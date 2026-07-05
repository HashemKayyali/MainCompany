import { describe, it, expect } from 'vitest'
import { classifyStorageObjects, MANAGED_FOLDERS } from '../classifier'
import { buildReferenceIndex } from '../reference-index'
import { IMAGE_BUCKET, VIDEO_BUCKET } from '../../storage-identity'
import type { StorageObject } from '../types'

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

function obj(overrides: Partial<StorageObject>): StorageObject {
  return {
    bucket: IMAGE_BUCKET,
    path: 'products/x.webp',
    canonical: `${IMAGE_BUCKET}/products/x.webp`,
    size: 100,
    lastModifiedIso: '2025-01-01T00:00:00Z',
    isDirectoryPlaceholder: false,
    ...overrides,
  }
}

const NOW = new Date('2026-01-15T00:00:00Z')
const CUTOFF = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

describe('classifier: core scenarios', () => {
  it('1. referenced object is never a candidate', () => {
    const { index } = buildReferenceIndex({
      products: [{ slug: 'p', hero_image: url(IMAGE_BUCKET, 'products/x.webp'), gallery: null, video_url: null }],
    })
    const { classified } = classifyStorageObjects(
      [obj({ lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REFERENCED')
  })

  it('2. unreferenced old managed object becomes SAFE_CANDIDATE', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('SAFE_CANDIDATE')
  })

  it('3. recent unreferenced object is not deleted', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ lastModifiedIso: '2026-01-14T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('RECENT_UNREFERENCED')
  })

  it('4. product_images.url protects a Storage object', () => {
    const target = url(IMAGE_BUCKET, 'products/legacy.webp')
    const { index } = buildReferenceIndex({
      productImages: [{ id: 'row', url: target }],
    })
    const { classified } = classifyStorageObjects(
      [obj({ path: 'products/legacy.webp', canonical: `${IMAGE_BUCKET}/products/legacy.webp`, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REFERENCED')
    expect(classified[0].references[0]?.table).toBe('product_images')
  })

  it('5. same canonical from multiple URL forms resolves to one identity', () => {
    const base = url(IMAGE_BUCKET, 'products/z.webp')
    const framed = `${base}#m=eyJ4Ijo1MH0`
    const transform = `${PROJECT}/storage/v1/render/image/public/${IMAGE_BUCKET}/products/z.webp?width=200`
    const { index } = buildReferenceIndex({
      categories: [{ id: 'c1', image: framed }],
      products: [{ slug: 'p', hero_image: transform, gallery: null, video_url: null }],
    })
    expect(index.size).toBe(1)
    const { classified } = classifyStorageObjects(
      [obj({ path: 'products/z.webp', canonical: `${IMAGE_BUCKET}/products/z.webp`, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REFERENCED')
  })

  it('6. same Storage object referenced by multiple DB rows remains protected', () => {
    const target = url(IMAGE_BUCKET, 'products/shared.webp')
    const { index } = buildReferenceIndex({
      products: [
        { slug: 'p1', hero_image: target, gallery: null, video_url: null },
        { slug: 'p2', hero_image: target, gallery: null, video_url: null },
      ],
    })
    const { classified } = classifyStorageObjects(
      [obj({ path: 'products/shared.webp', canonical: `${IMAGE_BUCKET}/products/shared.webp`, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REFERENCED')
    expect(classified[0].references).toHaveLength(2)
  })

  it('9. malformed URL becomes REVIEW_REQUIRED via unknown folder path', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ path: 'weird/../x.webp', canonical: `${IMAGE_BUCKET}/weird/../x.webp`, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REVIEW_REQUIRED')
  })

  it('10. unknown folder object is REVIEW_REQUIRED', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ path: 'mystery/y.webp', canonical: `${IMAGE_BUCKET}/mystery/y.webp`, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REVIEW_REQUIRED')
    expect(classified[0].reason).toMatch(/mystery/)
  })

  it('16. safety window boundary — exactly on cutoff = SAFE, one ms newer = RECENT', () => {
    const { index } = buildReferenceIndex({})
    const onCutoff = classifyStorageObjects(
      [obj({ lastModifiedIso: CUTOFF })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(onCutoff.classified[0].classification).toBe('SAFE_CANDIDATE')

    const cutoffMs = new Date(CUTOFF).getTime()
    const barelyRecent = new Date(cutoffMs + 1).toISOString()
    const oneMs = classifyStorageObjects(
      [obj({ lastModifiedIso: barelyRecent })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(oneMs.classified[0].classification).toBe('RECENT_UNREFERENCED')
  })

  it('18. broken DB reference is reported but NOT a deletion candidate', () => {
    const target = url(IMAGE_BUCKET, 'products/gone.webp')
    const { index } = buildReferenceIndex({
      products: [{ slug: 'p', hero_image: target, gallery: null, video_url: null }],
    })
    const { classified, broken } = classifyStorageObjects([], index, {
      safetyWindowCutoffIso: CUTOFF,
      now: NOW,
    })
    expect(classified).toHaveLength(0)
    expect(broken).toHaveLength(1)
    expect(broken[0].canonical).toBe(`${IMAGE_BUCKET}/products/gone.webp`)
  })

  it('directory placeholder is REVIEW_REQUIRED not SAFE_CANDIDATE', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ isDirectoryPlaceholder: true, lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REVIEW_REQUIRED')
    expect(classified[0].reason).toMatch(/placeholder/)
  })

  it('video bucket with managed folder correctly classifies', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [
        {
          bucket: VIDEO_BUCKET,
          path: 'products/orphan.webm',
          canonical: `${VIDEO_BUCKET}/products/orphan.webm`,
          size: 500,
          lastModifiedIso: '2020-01-01T00:00:00Z',
          isDirectoryPlaceholder: false,
        },
      ],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('SAFE_CANDIDATE')
    expect(MANAGED_FOLDERS[VIDEO_BUCKET]).toContain('products')
  })

  it('unknown bucket → REVIEW_REQUIRED', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [
        {
          bucket: 'weird-bucket',
          path: 'products/x.webp',
          canonical: 'weird-bucket/products/x.webp',
          size: 1,
          lastModifiedIso: '2020-01-01T00:00:00Z',
          isDirectoryPlaceholder: false,
        },
      ],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('REVIEW_REQUIRED')
  })

  it('invalid safety cutoff → UNKNOWN_OR_UNPARSEABLE', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ lastModifiedIso: '2020-01-01T00:00:00Z' })],
      index,
      { safetyWindowCutoffIso: 'not-a-date', now: NOW },
    )
    expect(classified[0].classification).toBe('UNKNOWN_OR_UNPARSEABLE')
  })

  it('invalid object lastModified → UNKNOWN_OR_UNPARSEABLE', () => {
    const { index } = buildReferenceIndex({})
    const { classified } = classifyStorageObjects(
      [obj({ lastModifiedIso: 'garbage' })],
      index,
      { safetyWindowCutoffIso: CUTOFF, now: NOW },
    )
    expect(classified[0].classification).toBe('UNKNOWN_OR_UNPARSEABLE')
  })
})
