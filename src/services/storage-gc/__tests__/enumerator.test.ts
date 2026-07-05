import { describe, it, expect, vi } from 'vitest'
import { enumerateStorage, type StorageListFetcher } from '../storage-enumerator'

/**
 * Enumerator regression tests: pagination, nested folders, retries.
 */

describe('enumerator: pagination', () => {
  it('14. paginates across a large flat prefix', async () => {
    const pages: string[][] = [
      ['a.webp', 'b.webp'],
      ['c.webp', 'd.webp'],
      ['e.webp'],
    ]
    const calls: Array<{ prefix: string; offset: number; limit: number }> = []
    const fetcher: StorageListFetcher = async (_bucket, prefix, offset, limit) => {
      calls.push({ prefix, offset, limit })
      const page = pages[calls.filter(c => c.prefix === prefix).length - 1] ?? []
      return {
        data: page.map(name => ({
          name,
          id: `id-${name}`,
          metadata: { size: 1 },
          updated_at: '2025-01-01T00:00:00Z',
        })),
        error: null,
      }
    }
    const objects = await enumerateStorage(fetcher, {
      buckets: ['product-images'],
      pageSize: 2,
    })
    // 5 non-placeholder objects total across 3 pages.
    expect(objects.filter(o => !o.isDirectoryPlaceholder)).toHaveLength(5)
    expect(calls.length).toBeGreaterThanOrEqual(3)
  })

  it('15. recurses into nested folders (BFS)', async () => {
    const fetcher: StorageListFetcher = async (_bucket, prefix, _offset, _limit) => {
      if (prefix === '') {
        return {
          data: [
            { name: 'products', id: null, metadata: null },
            { name: 'root.webp', id: 'r', metadata: { size: 10 }, updated_at: '2025-01-01T00:00:00Z' },
          ],
          error: null,
        }
      }
      if (prefix === 'products') {
        return {
          data: [
            { name: 'nested', id: null, metadata: null },
            { name: 'a.webp', id: 'a', metadata: { size: 20 }, updated_at: '2025-01-01T00:00:00Z' },
          ],
          error: null,
        }
      }
      if (prefix === 'products/nested') {
        return {
          data: [
            { name: 'deep.webp', id: 'd', metadata: { size: 30 }, updated_at: '2025-01-01T00:00:00Z' },
          ],
          error: null,
        }
      }
      return { data: [], error: null }
    }
    const objects = await enumerateStorage(fetcher, {
      buckets: ['product-images'],
      pageSize: 100,
    })
    const paths = objects.filter(o => !o.isDirectoryPlaceholder).map(o => o.path).sort()
    expect(paths).toEqual(['products/a.webp', 'products/nested/deep.webp', 'root.webp'])
    // Two placeholder entries.
    expect(objects.filter(o => o.isDirectoryPlaceholder)).toHaveLength(2)
  })

  it('retries a transient error and eventually succeeds', async () => {
    let attempts = 0
    const fetcher: StorageListFetcher = async () => {
      attempts += 1
      if (attempts < 3) throw new Error('transient')
      return {
        data: [{ name: 'ok.webp', id: 'x', metadata: { size: 5 }, updated_at: '2025-01-01T00:00:00Z' }],
        error: null,
      }
    }
    const objects = await enumerateStorage(fetcher, {
      buckets: ['product-images'],
      pageSize: 100,
      retries: 3,
      retryDelayMs: 1,
    })
    expect(attempts).toBe(3)
    expect(objects.filter(o => !o.isDirectoryPlaceholder)).toHaveLength(1)
  })

  it('surfaces a persistent error as a thrown Error', async () => {
    const fetcher: StorageListFetcher = async () => ({ data: null, error: { message: 'boom' } })
    await expect(
      enumerateStorage(fetcher, { buckets: ['product-images'], pageSize: 100 }),
    ).rejects.toThrow(/boom/)
  })

  it('handles empty bucket cleanly', async () => {
    const fetcher: StorageListFetcher = async () => ({ data: [], error: null })
    const objects = await enumerateStorage(fetcher, {
      buckets: ['product-images'],
      pageSize: 100,
    })
    expect(objects).toEqual([])
  })

  it('progress callback is invoked per page', async () => {
    const fetcher: StorageListFetcher = async () => ({
      data: [{ name: 'ok.webp', id: 'a', metadata: { size: 1 }, updated_at: '2025-01-01T00:00:00Z' }],
      error: null,
    })
    const spy = vi.fn()
    await enumerateStorage(fetcher, {
      buckets: ['product-images'],
      pageSize: 100,
      onProgress: spy,
    })
    expect(spy).toHaveBeenCalled()
  })
})
