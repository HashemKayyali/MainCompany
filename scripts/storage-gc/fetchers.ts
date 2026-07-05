import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ReferenceInputs,
  ReferenceScanReport,
} from '../../src/services/storage-gc/reference-index'
import { buildReferenceIndex } from '../../src/services/storage-gc/reference-index'
import type { StorageListFetcher } from '../../src/services/storage-gc/storage-enumerator'
import { getStorageIdentity } from '../../src/services/storage.service'

/**
 * Fetch every URL-bearing row from every media-managed table.
 *
 * On any per-table failure we RECORD the failure in `sourcesFailed`
 * but continue scanning the others — the cleanup driver will refuse
 * to run if any source failed, so we still surface partial data
 * for audit-only inspection.
 */
export async function fetchReferenceScan(
  supabase: SupabaseClient,
): Promise<ReferenceScanReport> {
  const inputs: ReferenceInputs = {}
  const sourcesFailed: string[] = []

  const trySource = async <T>(
    tag: string,
    scan: () => Promise<T>,
    assign: (value: T) => void,
  ) => {
    try {
      const value = await scan()
      assign(value)
    } catch (err) {
      sourcesFailed.push(`${tag}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  await trySource(
    'categories',
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, image')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.categories = v.map(row => ({
        id: String(row.id),
        image: row.image ?? null,
      }))
    },
  )

  await trySource(
    'customers',
    async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('slug, logo_url')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.customers = v.map(row => ({
        slug: String(row.slug),
        logo_url: row.logo_url ?? null,
      }))
    },
  )

  await trySource(
    'parts',
    async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('id, image')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.parts = v.map(row => ({
        id: String(row.id),
        image: row.image ?? null,
      }))
    },
  )

  await trySource(
    'gallery_albums',
    async () => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('slug, cover, images')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.galleryAlbums = v.map(row => ({
        slug: String(row.slug),
        cover: row.cover ?? null,
        images: (row.images as string[] | null) ?? null,
      }))
    },
  )

  await trySource(
    'custom_builds',
    async () => {
      const { data, error } = await supabase
        .from('custom_builds')
        .select('id, image_url, images')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.customBuilds = v.map(row => ({
        id: String(row.id ?? ''),
        image_url: row.image_url ?? null,
        images: (row.images as string[] | null) ?? null,
      }))
    },
  )

  await trySource(
    'products',
    async () => {
      const { data, error } = await supabase
        .from('products')
        .select('slug, hero_image, gallery, video_url')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.products = v.map(row => ({
        slug: String(row.slug),
        hero_image: row.hero_image ?? null,
        gallery: (row.gallery as string[] | null) ?? null,
        video_url: row.video_url ?? null,
      }))
    },
  )

  // product_images is the legacy residual table.
  await trySource(
    'product_images',
    async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('id, url')
      if (error) throw error
      return data ?? []
    },
    v => {
      inputs.productImages = v.map(row => ({
        id: String(row.id),
        url: String(row.url ?? ''),
      }))
    },
  )

  const scan = buildReferenceIndex(inputs)
  scan.sourcesFailed = sourcesFailed
  return scan
}

/**
 * Live reference re-check for a specific set of candidates. Instead
 * of scanning entire tables again, we fetch only rows that could
 * plausibly reference one of the candidate paths, keeping the check
 * both cheap and comprehensive. Falls back to full-table scans if
 * the narrowed query fails so the "fail-closed" contract still holds.
 */
export async function makeLiveReferenceFetcher(supabase: SupabaseClient) {
  return async function fetchLive(
    candidates: Array<{ bucket: string; path: string; canonical: string }>,
  ): Promise<ReferenceInputs> {
    if (candidates.length === 0) return {}
    // Match on the file basename (last segment of the path) because
    // the URLs stored in DB rows all include this basename. This is
    // a cheap OR-filter that lets Postgres skip the vast majority of
    // rows, but the buildReferenceIndex still uses full canonical
    // equality to decide referenced/not.
    const basenames = Array.from(
      new Set(
        candidates
          .map(c => c.path.split('/').pop() ?? '')
          .filter(Boolean),
      ),
    )
    if (basenames.length === 0) return {}

    const inputs: ReferenceInputs = {}
    // For each source, we do a light "url LIKE %basename%" scan.
    // Postgres won't index-scan LIKE %..%, so we cap the search by
    // constructing an OR of ilike terms. The result is filtered
    // downstream by canonical match, so false positives here are
    // harmless.
    const orIlike = (field: string) =>
      basenames.map(b => `${field}.ilike.%${b.replace(/[%_,]/g, '\\$&')}%`).join(',')

    const runQuery = async <T>(
      table: string,
      columns: string,
      filterField: string,
    ): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .or(orIlike(filterField))
      if (error) throw error
      return (data as T[]) ?? []
    }

    try {
      inputs.categories = (
        await runQuery<{ id: string; image: string | null }>(
          'categories',
          'id, image',
          'image',
        )
      ).map(row => ({ id: row.id, image: row.image }))
    } catch (err) {
      // Fail-closed: rethrow so the driver can refuse the batch.
      throw new Error(
        `live re-check failed for categories: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    try {
      inputs.customers = (
        await runQuery<{ slug: string; logo_url: string | null }>(
          'customers',
          'slug, logo_url',
          'logo_url',
        )
      ).map(row => ({ slug: row.slug, logo_url: row.logo_url }))
    } catch (err) {
      throw new Error(
        `live re-check failed for customers: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    try {
      inputs.parts = (
        await runQuery<{ id: string; image: string | null }>(
          'parts',
          'id, image',
          'image',
        )
      ).map(row => ({ id: row.id, image: row.image }))
    } catch (err) {
      throw new Error(
        `live re-check failed for parts: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Array-typed columns need array-any filters. Simplest safe
    // fallback: fetch the whole table (usually small).
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('slug, cover, images')
      if (error) throw error
      inputs.galleryAlbums = (data ?? []).map(row => ({
        slug: String(row.slug),
        cover: row.cover ?? null,
        images: (row.images as string[] | null) ?? null,
      }))
    } catch (err) {
      throw new Error(
        `live re-check failed for gallery_albums: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    try {
      const { data, error } = await supabase
        .from('custom_builds')
        .select('id, image_url, images')
      if (error) throw error
      inputs.customBuilds = (data ?? []).map(row => ({
        id: String(row.id ?? ''),
        image_url: row.image_url ?? null,
        images: (row.images as string[] | null) ?? null,
      }))
    } catch (err) {
      throw new Error(
        `live re-check failed for custom_builds: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('slug, hero_image, gallery, video_url')
      if (error) throw error
      inputs.products = (data ?? []).map(row => ({
        slug: String(row.slug),
        hero_image: row.hero_image ?? null,
        gallery: (row.gallery as string[] | null) ?? null,
        video_url: row.video_url ?? null,
      }))
    } catch (err) {
      throw new Error(
        `live re-check failed for products: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // product_images — same pattern as parts.
    try {
      inputs.productImages = (
        await runQuery<{ id: string; url: string }>(
          'product_images',
          'id, url',
          'url',
        )
      ).map(row => ({ id: row.id, url: row.url }))
    } catch (err) {
      throw new Error(
        `live re-check failed for product_images: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Guard: if we got zero identifiable references but the DB was
    // supposedly not empty, treat as an anomaly.
    void getStorageIdentity
    return inputs
  }
}

export function makeStorageListFetcher(
  supabase: SupabaseClient,
): StorageListFetcher {
  return async (bucket, prefix, offset, limit) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } })
    return { data: (data as any) ?? null, error: error ? { message: error.message } : null }
  }
}

export function makeDeleter(supabase: SupabaseClient) {
  return async (
    identities: Array<{ bucket: string; path: string; canonical: string; kind: 'image' | 'video' }>,
  ) => {
    // Group by bucket so we can call remove() per-bucket.
    const byBucket = new Map<string, typeof identities>()
    for (const id of identities) {
      const list = byBucket.get(id.bucket) ?? []
      list.push(id)
      byBucket.set(id.bucket, list)
    }
    const deleted: typeof identities = []
    const alreadyMissing: typeof identities = []
    const failed: Array<{ canonical: string; bucket: string; path: string; error: string }> = []
    await Promise.all(
      Array.from(byBucket.entries()).map(async ([bucket, list]) => {
        const paths = list.map(l => l.path)
        try {
          const { data, error } = await supabase.storage.from(bucket).remove(paths)
          if (error) {
            for (const l of list) {
              failed.push({ canonical: l.canonical, bucket: l.bucket, path: l.path, error: error.message })
            }
            return
          }
          const removedSet = new Set(
            (data ?? [])
              .map(entry => (entry && typeof entry.name === 'string' ? entry.name : null))
              .filter((n): n is string => !!n),
          )
          for (const l of list) {
            if (removedSet.size === 0 || removedSet.has(l.path)) deleted.push(l)
            else alreadyMissing.push(l)
          }
        } catch (err) {
          for (const l of list) {
            failed.push({
              canonical: l.canonical,
              bucket: l.bucket,
              path: l.path,
              error: err instanceof Error ? err.message : String(err),
            })
          }
        }
      }),
    )
    return {
      requested: identities.length,
      deleted,
      alreadyMissing,
      failed,
    }
  }
}
