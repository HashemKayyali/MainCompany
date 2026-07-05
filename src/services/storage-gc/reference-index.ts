import { getStorageIdentity } from '../storage.service'
import type { DbReference, DbReferenceSource, ReferenceIndex } from './types'

/* ------------------------------------------------------------------ *
 *  Reference index — pure builder                                     *
 *                                                                     *
 *  Feed the shape below with every row from every media-bearing       *
 *  table and get back a canonical → sources map. The builder is       *
 *  strict about which tables/columns it accepts so a future           *
 *  schema addition either shows up in the report or fails the         *
 *  fetcher scan, never silently missed.                               *
 * ------------------------------------------------------------------ */

export interface CategoryRow {
  id: string
  image: string | null
}

export interface CustomerRow {
  slug: string
  logo_url: string | null
}

export interface PartRow {
  id: string
  image: string | null
}

export interface GalleryAlbumRow {
  slug: string
  cover: string | null
  images: string[] | null
}

export interface CustomBuildRow {
  id: string
  image_url: string | null
  images: string[] | null
}

export interface ProductRow {
  slug: string
  hero_image: string | null
  gallery: string[] | null
  video_url: string | null
}

export interface ProductImageRow {
  id: string
  url: string
}

export interface ReferenceInputs {
  categories?: CategoryRow[]
  customers?: CustomerRow[]
  parts?: PartRow[]
  galleryAlbums?: GalleryAlbumRow[]
  customBuilds?: CustomBuildRow[]
  products?: ProductRow[]
  /**
   * Legacy `product_images` residual data. Must be fetched by the
   * scanner even though no active `src/` code reads or writes it —
   * the row's URL is a live DB reference and the GC must protect it.
   */
  productImages?: ProductImageRow[]
}

/**
 * Bookkeeping about the scan itself. Used by cleanup mode to refuse
 * to run when a required source scan failed — it's much safer to
 * skip a cleanup run than to delete real storage that a partial
 * scan didn't know was referenced.
 */
export interface ReferenceScanReport {
  index: ReferenceIndex
  duplicateCount: number
  sourcesScanned: string[]
  sourcesFailed: string[]
  rawReferenceCount: number
}

export function buildReferenceIndex(
  inputs: ReferenceInputs,
): ReferenceScanReport {
  const index: ReferenceIndex = new Map()
  const sourcesScanned: string[] = []
  let raw = 0
  let duplicates = 0

  const register = (
    url: string | null | undefined,
    source: DbReferenceSource,
  ) => {
    if (!url) return
    const identity = getStorageIdentity(url)
    if (!identity) return
    raw += 1
    const existing = index.get(identity.canonical)
    if (existing) {
      duplicates += 1
      existing.sources.push(source)
      return
    }
    const entry: DbReference = {
      canonical: identity.canonical,
      bucket: identity.bucket,
      path: identity.path,
      kind: identity.kind,
      sources: [source],
    }
    index.set(identity.canonical, entry)
  }

  if (inputs.categories) {
    sourcesScanned.push('categories.image')
    for (const row of inputs.categories) {
      register(row.image, { table: 'categories', field: 'image', rowKey: row.id })
    }
  }

  if (inputs.customers) {
    sourcesScanned.push('customers.logo_url')
    for (const row of inputs.customers) {
      register(row.logo_url, {
        table: 'customers',
        field: 'logo_url',
        rowKey: row.slug,
      })
    }
  }

  if (inputs.parts) {
    sourcesScanned.push('parts.image')
    for (const row of inputs.parts) {
      register(row.image, { table: 'parts', field: 'image', rowKey: row.id })
    }
  }

  if (inputs.galleryAlbums) {
    sourcesScanned.push('gallery_albums.cover', 'gallery_albums.images')
    for (const row of inputs.galleryAlbums) {
      register(row.cover, {
        table: 'gallery_albums',
        field: 'cover',
        rowKey: row.slug,
      })
      for (const url of row.images ?? []) {
        register(url, {
          table: 'gallery_albums',
          field: 'images',
          rowKey: row.slug,
        })
      }
    }
  }

  if (inputs.customBuilds) {
    sourcesScanned.push('custom_builds.image_url', 'custom_builds.images')
    for (const row of inputs.customBuilds) {
      register(row.image_url, {
        table: 'custom_builds',
        field: 'image_url',
        rowKey: row.id,
      })
      for (const url of row.images ?? []) {
        register(url, {
          table: 'custom_builds',
          field: 'images',
          rowKey: row.id,
        })
      }
    }
  }

  if (inputs.products) {
    sourcesScanned.push(
      'products.hero_image',
      'products.gallery',
      'products.video_url',
    )
    for (const row of inputs.products) {
      register(row.hero_image, {
        table: 'products',
        field: 'hero_image',
        rowKey: row.slug,
      })
      for (const url of row.gallery ?? []) {
        register(url, {
          table: 'products',
          field: 'gallery',
          rowKey: row.slug,
        })
      }
      register(row.video_url, {
        table: 'products',
        field: 'video_url',
        rowKey: row.slug,
      })
    }
  }

  if (inputs.productImages) {
    sourcesScanned.push('product_images.url')
    for (const row of inputs.productImages) {
      register(row.url, {
        table: 'product_images',
        field: 'url',
        rowKey: row.id,
      })
    }
  }

  return {
    index,
    duplicateCount: duplicates,
    sourcesScanned,
    sourcesFailed: [],
    rawReferenceCount: raw,
  }
}

/**
 * Full list of the reference sources this GC knows about. If a
 * future migration adds a new URL-bearing column, add it here AND
 * to the fetcher AND to `buildReferenceIndex`. The audit tool will
 * fail closed (refuse to run) if any of these can't be scanned.
 */
export const ALL_REFERENCE_SOURCES = [
  'categories.image',
  'customers.logo_url',
  'parts.image',
  'gallery_albums.cover',
  'gallery_albums.images',
  'custom_builds.image_url',
  'custom_builds.images',
  'products.hero_image',
  'products.gallery',
  'products.video_url',
  'product_images.url',
] as const
