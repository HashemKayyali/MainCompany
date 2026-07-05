import type { StorageObject } from './types'

/**
 * The subset of the Supabase storage `list()` response we actually
 * use. Keeping this narrow means the enumerator is straightforward
 * to test with a fake.
 */
export interface StorageListEntry {
  name: string
  id: string | null
  updated_at?: string | null
  created_at?: string | null
  last_accessed_at?: string | null
  metadata?: { size?: number | null; mimetype?: string | null } | null
}

export interface StorageListPage {
  data: StorageListEntry[] | null
  error: { message: string } | null
}

export interface StorageListFetcher {
  (
    bucket: string,
    prefix: string,
    offset: number,
    limit: number,
  ): Promise<StorageListPage>
}

export interface EnumerateOptions {
  buckets: string[]
  pageSize?: number
  /** Retries per page on transient error. Defaults to 3. */
  retries?: number
  /** Ms between retries. Defaults to 500. */
  retryDelayMs?: number
  /** Called for each listed page — helpful for progress logs. */
  onProgress?: (msg: string) => void
}

/**
 * Recursively enumerate every object in the supplied buckets. The
 * Supabase JS SDK returns FLAT pages of a single prefix, so we
 * BFS-traverse folders explicitly.
 *
 * Directory placeholder entries (`id === null`) are captured but
 * flagged so the classifier can skip them.
 */
export async function enumerateStorage(
  fetcher: StorageListFetcher,
  options: EnumerateOptions,
): Promise<StorageObject[]> {
  const pageSize = options.pageSize ?? 200
  const retries = options.retries ?? 3
  const retryDelayMs = options.retryDelayMs ?? 500
  const results: StorageObject[] = []

  for (const bucket of options.buckets) {
    // BFS queue of prefixes to walk.
    const queue: string[] = ['']
    while (queue.length > 0) {
      const prefix = queue.shift() as string
      let offset = 0
      // Loop until a partial page is returned.
      while (true) {
        const page = await withRetries(
          () => fetcher(bucket, prefix, offset, pageSize),
          retries,
          retryDelayMs,
        )
        if (page.error) {
          throw new Error(
            `storage list failed for ${bucket}/${prefix}: ${page.error.message}`,
          )
        }
        const entries = page.data ?? []
        options.onProgress?.(
          `list ${bucket}:${prefix || '(root)'} offset=${offset} → ${entries.length}`,
        )

        for (const entry of entries) {
          if (entry.id === null) {
            // Folder entry — recurse into it.
            const nextPrefix = prefix
              ? `${prefix}/${entry.name}`
              : entry.name
            queue.push(nextPrefix)
            // Also record the placeholder so callers see it in the raw list.
            const fullPath = nextPrefix
            results.push({
              bucket,
              path: fullPath,
              canonical: `${bucket}/${fullPath}`,
              size: 0,
              lastModifiedIso: entry.updated_at ?? entry.created_at ?? '1970-01-01T00:00:00.000Z',
              isDirectoryPlaceholder: true,
            })
            continue
          }
          const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name
          const size = entry.metadata?.size ?? 0
          results.push({
            bucket,
            path: fullPath,
            canonical: `${bucket}/${fullPath}`,
            size,
            lastModifiedIso:
              entry.updated_at ?? entry.created_at ?? new Date(0).toISOString(),
            isDirectoryPlaceholder: false,
          })
        }

        if (entries.length < pageSize) break
        offset += entries.length
      }
    }
  }

  return results
}

async function withRetries<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs: number,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === retries) break
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  throw lastError
}
