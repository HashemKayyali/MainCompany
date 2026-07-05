import { describe, it, expect } from 'vitest'
import { buildReferenceIndex } from '../reference-index'
import { IMAGE_BUCKET, VIDEO_BUCKET } from '../../storage-identity'

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

const A = url(IMAGE_BUCKET, 'products/a-hero.webp')
const A_FRAMED = `${A}#m=eyJ4Ijo1MH0`
const A_TRANSFORM = `${PROJECT}/storage/v1/render/image/public/${IMAGE_BUCKET}/products/a-hero.webp?width=320`
const B = url(IMAGE_BUCKET, 'gallery/b.webp')
const V = url(VIDEO_BUCKET, 'products/v.webm')
const LEGACY = url(IMAGE_BUCKET, 'products/legacy.webp')

describe('reference-index: sources coverage', () => {
  it('registers every media-bearing column', () => {
    const scan = buildReferenceIndex({
      categories: [{ id: 'c1', image: A }],
      customers: [{ slug: 'cu1', logo_url: B }],
      parts: [{ id: 'p1', image: B }],
      galleryAlbums: [
        { slug: 'g1', cover: A, images: [A, B] },
      ],
      customBuilds: [
        { id: 'b1', image_url: A, images: [A, LEGACY] },
      ],
      products: [
        { slug: 'prod1', hero_image: A, gallery: [A, B], video_url: V },
      ],
      productImages: [{ id: 'pi1', url: LEGACY }],
    })
    expect(scan.sourcesScanned).toEqual([
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
    ])
    // Unique canonicals: A, B, V, LEGACY.
    expect(scan.index.size).toBe(4)
    expect(scan.duplicateCount).toBeGreaterThan(0)
  })

  it('same canonical from multiple URL forms resolves to one entry (framed / transform)', () => {
    const scan = buildReferenceIndex({
      products: [
        {
          slug: 'p',
          hero_image: A_FRAMED,
          gallery: [A_TRANSFORM],
          video_url: null,
        },
      ],
    })
    expect(scan.index.size).toBe(1)
    const entry = scan.index.get(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(entry?.sources).toHaveLength(2)
  })

  it('product_images.url IS registered — protects a legacy row', () => {
    const scan = buildReferenceIndex({
      productImages: [{ id: 'row-1', url: LEGACY }],
    })
    expect(scan.index.get(`${IMAGE_BUCKET}/products/legacy.webp`)).toBeDefined()
  })

  it('skips null / empty / non-storage URLs safely', () => {
    const scan = buildReferenceIndex({
      categories: [
        { id: 'c1', image: null },
        { id: 'c2', image: '' },
        { id: 'c3', image: 'https://cdn.example.com/other.png' },
        { id: 'c4', image: A },
      ],
    })
    expect(scan.index.size).toBe(1)
    expect(scan.rawReferenceCount).toBe(1)
  })
})
