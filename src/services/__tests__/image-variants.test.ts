import { beforeEach, describe, expect, it, vi } from 'vitest'

interface FakeStorage {
  removals: string[][]
  nextRemovals: Array<{ ok: boolean; error?: string }>
}

let fake: FakeStorage

const cloudinaryMocks = vi.hoisted(() => ({
  uploadImageToCloudinary: vi.fn(),
}))

vi.mock('../cloudinary.service', () => ({
  uploadImageToCloudinary: cloudinaryMocks.uploadImageToCloudinary,
  deleteCloudinaryIdentities: vi.fn(async () => ({
    requested: 0,
    deleted: [],
    alreadyMissing: [],
    failed: [],
  })),
}))

vi.mock('../../lib/supabase', () => {
  return {
    isSupabaseConfigured: () => true,
    supabase: {
      storage: {
        from: (_bucket: string) => ({
          remove: async (paths: string[]) => {
            fake.removals.push(paths)
            const next = fake.nextRemovals.shift() ?? { ok: true }
            return next.ok
              ? { data: paths.map(name => ({ name })), error: null }
              : { data: null, error: new Error(next.error ?? 'remove failed') }
          },
          upload: vi.fn(async () => {
            throw new Error('Image uploads must never use Supabase Storage')
          }),
          getPublicUrl: vi.fn(),
        }),
      },
    },
  }
})

beforeEach(() => {
  fake = {
    removals: [],
    nextRemovals: [],
  }
  cloudinaryMocks.uploadImageToCloudinary.mockReset()
  cloudinaryMocks.uploadImageToCloudinary.mockResolvedValue(
    'https://res.cloudinary.com/demo-cloud/image/upload/v1783447500/eventies/products/example.jpg',
  )
})

describe('image upload provider invariants', () => {
  it('uploads image variants only through Cloudinary and returns one canonical URL', async () => {
    const mod = await import('../storage.service')
    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })

    const result = await mod.uploadImageVariants(file, 'products', 'ignored-name')

    expect(cloudinaryMocks.uploadImageToCloudinary).toHaveBeenCalledTimes(1)
    expect(cloudinaryMocks.uploadImageToCloudinary).toHaveBeenCalledWith(file, 'products')
    expect(result.thumbUrl).toBe(result.heroUrl)
    expect(result.heroUrl).toContain('res.cloudinary.com')
  })

  it('uploadImage returns the Cloudinary URL directly', async () => {
    const mod = await import('../storage.service')
    const file = new File([new Uint8Array([9])], 'x.jpg', { type: 'image/jpeg' })

    const media = await mod.uploadImage(file, 'products')

    expect(media).toContain('res.cloudinary.com')
    expect(cloudinaryMocks.uploadImageToCloudinary).toHaveBeenCalledTimes(1)
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
