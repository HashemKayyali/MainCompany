import { describe, it, expect, vi, beforeEach } from 'vitest'

/*
 * Scenario 3 — partial variant upload failure MUST NOT leave an
 * orphan storage object behind. This exercises the rollback path in
 * `uploadImageVariants` against a fully-mocked supabase client so
 * the failure semantics are asserted directly, without the real
 * client + network.
 */

interface UploadCall {
  path: string
  contentType: string
}

interface FakeStorage {
  uploads: UploadCall[]
  removals: string[][]
  nextUploads: Array<{ ok: boolean; error?: string }>
  nextRemovals: Array<{ ok: boolean; error?: string }>
}

let fake: FakeStorage

vi.mock('../../lib/supabase', () => {
  return {
    isSupabaseConfigured: () => true,
    supabase: {
      storage: {
        from: (_bucket: string) => ({
          upload: async (
            path: string,
            _file: unknown,
            opts: { contentType: string },
          ) => {
            fake.uploads.push({ path, contentType: opts.contentType })
            const next = fake.nextUploads.shift() ?? { ok: true }
            return next.ok
              ? { data: { path }, error: null }
              : { data: null, error: new Error(next.error ?? 'upload failed') }
          },
          remove: async (paths: string[]) => {
            fake.removals.push(paths)
            const next = fake.nextRemovals.shift() ?? { ok: true }
            return next.ok
              ? { data: paths.map(name => ({ name })), error: null }
              : { data: null, error: new Error(next.error ?? 'remove failed') }
          },
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://cdn/${path}` },
          }),
        }),
      },
    },
  }
})

// The service caches a bunch of module-scoped constants that reference the
// mocked supabase client through `import` — no need to also mock the
// canvas/WebP pipeline: we inject the File already-encoded (uploadImageVariants
// re-encodes internally, so we stub `toWebpFile` indirectly by keeping the
// mock lightweight and only exercising the branches around upload + rollback).
//
// To skip the WebP encoding path entirely we stub the underlying
// `createImageBitmap` + canvas so `toWebpFile` succeeds. jsdom doesn't
// support canvas.toBlob, so we patch that too.
beforeEach(() => {
  fake = {
    uploads: [],
    removals: [],
    nextUploads: [],
    nextRemovals: [],
  }
  vi.stubGlobal('createImageBitmap', async () => ({
    width: 100,
    height: 100,
    close: () => undefined,
  }))
  // Patch canvas.toBlob so jsdom returns a real Blob for encode step.
  // Casting through `unknown` because we only patch the one overload
  // the service actually calls; the TS overload set is intentionally
  // strict to prevent accidental mis-use elsewhere.
  const proto = HTMLCanvasElement.prototype as unknown as {
    toBlob: (callback: (blob: Blob | null) => void) => void
    getContext: (type: string) => CanvasRenderingContext2D | null
  }
  proto.toBlob = function (callback: (blob: Blob | null) => void) {
    callback(new Blob([new Uint8Array([1, 2, 3])], { type: 'image/webp' }))
  }
  proto.getContext = function () {
    return {
      drawImage: () => undefined,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    } as unknown as CanvasRenderingContext2D
  }
})

describe('uploadImageVariants — atomic rollback (scenario 3)', () => {
  it('rolls back the successful sibling when one variant upload fails', async () => {
    const mod = await import('../storage.service')
    // First upload (thumb) succeeds, second (hero) fails.
    fake.nextUploads = [{ ok: true }, { ok: false, error: 'network' }]

    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })
    await expect(mod.uploadImageVariants(file, 'products', 'test-1')).rejects.toThrow(
      /Image variant upload failed/,
    )

    expect(fake.uploads.map(u => u.path)).toEqual([
      'products/test-1-thumb.webp',
      'products/test-1-hero.webp',
    ])
    // Successful sibling must be rolled back.
    expect(fake.removals).toHaveLength(1)
    expect(fake.removals[0]).toEqual(['products/test-1-thumb.webp'])
  })

  it('surfaces the rollback failure in the thrown error so the caller can log it', async () => {
    const mod = await import('../storage.service')
    fake.nextUploads = [{ ok: true }, { ok: false, error: 'network' }]
    fake.nextRemovals = [{ ok: false, error: 'cleanup 500' }]

    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })
    let caught: Error | null = null
    try {
      await mod.uploadImageVariants(file, 'products', 'test-2')
    } catch (err) {
      caught = err as Error
    }
    expect(caught).toBeTruthy()
    expect(caught?.message).toContain('rollback cleanup also failed')
    expect(caught?.message).toContain('cleanup 500')
    expect(caught?.message).toContain('products/test-2-thumb.webp')
  })

  it('returns both URLs on full success', async () => {
    const mod = await import('../storage.service')
    fake.nextUploads = [{ ok: true }, { ok: true }]

    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })
    const result = await mod.uploadImageVariants(file, 'products', 'test-3')
    expect(result.thumbUrl).toBe('https://cdn/products/test-3-thumb.webp')
    expect(result.heroUrl).toBe('https://cdn/products/test-3-hero.webp')
    expect(fake.removals).toHaveLength(0)
  })


  it('uploadImage returns one media value with hero source + embedded preview', async () => {
    const mod = await import('../storage.service')
    const { parseMediaValue } = await import('../../utils/media-frame')
    fake.nextUploads = [{ ok: true }, { ok: true }]

    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })
    const media = await mod.uploadImage(file, 'products', 'test-4')
    const parsed = parseMediaValue(media)

    expect(parsed.src).toBe('https://cdn/products/test-4-hero.webp')
    expect(parsed.previewSrc).toBe('https://cdn/products/test-4-thumb.webp')
    expect(fake.uploads.map(u => u.path)).toEqual([
      'products/test-4-thumb.webp',
      'products/test-4-hero.webp',
    ])
  })
})

describe('deleteAssetsSafely — delete/missing/failure (scenarios 4/5/6)', () => {
  it('reports a successful delete as `deleted` (scenario 4)', async () => {
    const mod = await import('../storage.service')
    fake.nextRemovals = [{ ok: true }]

    const publicUrl =
      'https://example.supabase.co/storage/v1/object/public/product-images/foo/a-hero.webp'
    const result = await mod.deleteAssetsSafely([publicUrl])
    expect(result.deleted.map(d => d.canonical)).toEqual([
      'product-images/foo/a-hero.webp',
    ])
    expect(result.failed).toHaveLength(0)
    expect(result.alreadyMissing).toHaveLength(0)
  })

  it('reports a real failure without swallowing the error (scenario 6)', async () => {
    const mod = await import('../storage.service')
    fake.nextRemovals = [{ ok: false, error: 'permission denied' }]

    const publicUrl =
      'https://example.supabase.co/storage/v1/object/public/product-images/foo/b-hero.webp'
    const result = await mod.deleteAssetsSafely([publicUrl])
    expect(result.deleted).toHaveLength(0)
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('permission denied')
    expect(mod.isDeletionSuccessful(result)).toBe(false)
  })

  it('deletes both hero and embedded preview objects from one media value', async () => {
    const mod = await import('../storage.service')
    const { encodeMediaValue } = await import('../../utils/media-frame')
    fake.nextRemovals = [{ ok: true }]

    const hero = 'https://example.supabase.co/storage/v1/object/public/product-images/foo/d-hero.webp'
    const thumb = 'https://example.supabase.co/storage/v1/object/public/product-images/foo/d-thumb.webp'
    const media = encodeMediaValue(hero, undefined, { previewSrc: thumb })

    const result = await mod.deleteAssetsSafely([media])
    expect(result.requested).toBe(2)
    expect(fake.removals).toHaveLength(1)
    expect(new Set(fake.removals[0])).toEqual(new Set(['foo/d-hero.webp', 'foo/d-thumb.webp']))
  })

  it('dedupes duplicate URLs pointing at the same canonical', async () => {
    const mod = await import('../storage.service')
    fake.nextRemovals = [{ ok: true }]

    const publicUrl =
      'https://example.supabase.co/storage/v1/object/public/product-images/foo/c-hero.webp'
    const framed = `${publicUrl}#m=eyJ4Ijo1MH0`
    const withQuery = `${publicUrl}?width=200`

    const result = await mod.deleteAssetsSafely([publicUrl, framed, withQuery])
    // Only one storage call, only one canonical requested.
    expect(result.requested).toBe(1)
    expect(fake.removals).toHaveLength(1)
    expect(fake.removals[0]).toEqual(['foo/c-hero.webp'])
  })
})
