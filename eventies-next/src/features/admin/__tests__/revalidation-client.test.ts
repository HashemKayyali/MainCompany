import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestAdminRevalidation } from '../revalidation-client'

describe('ADM-INV and revalidation failure retry', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('sends the canonical entity and slug after mutation commit', async () => {
    const fetchMock = vi.fn(
      async (...args: Parameters<typeof fetch>) => {
        void args
        return new Response(JSON.stringify({ revalidated: ['catalog:products'] }), { status: 200 })
      }
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await requestAdminRevalidation('product', 'stage')
    expect(result).toEqual({ ok: true, tags: ['catalog:products'] })
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))).toEqual({
      entity: 'product',
      slug: 'stage',
    })
  })

  it('returns an explicit retry contract when cache refresh fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ revalidated: ['home:content'] }), { status: 200 })
      )
    vi.stubGlobal('fetch', fetchMock)
    const failed = await requestAdminRevalidation('gallery')
    expect(failed.ok).toBe(false)
    if (!failed.ok) expect(await failed.retry()).toEqual({ ok: true, tags: ['home:content'] })
  })
})
