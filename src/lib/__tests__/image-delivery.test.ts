import { afterEach, describe, expect, it, vi } from 'vitest'
import { encodeMediaValue } from '../../utils/media-frame'

const hero = 'https://example.supabase.co/storage/v1/object/public/product-images/products/a-hero.webp'
const preview = 'https://example.supabase.co/storage/v1/object/public/product-images/products/a-thumb.webp'
const media = encodeMediaValue(hero, undefined, { previewSrc: preview })

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('image delivery strategy', () => {
  it('uses the embedded preview for card-sized delivery without transformations', async () => {
    vi.stubEnv('VITE_IMAGE_TRANSFORMATIONS_ENABLED', 'false')
    vi.resetModules()
    const mod = await import('../image-delivery')

    expect(mod.getImageDeliverySource(media, 'card')).toBe(preview)
    expect(mod.getImageDeliverySource(media, 'detail')).toBe(hero)
    expect(mod.getImageDeliverySrcSet(media, 'card')).toBeUndefined()
    expect(mod.getImagePlaceholderSource(media, 'detail')).toBe(preview)
  })

  it('builds Supabase render URLs and a responsive srcset when transformations are enabled', async () => {
    vi.stubEnv('VITE_IMAGE_TRANSFORMATIONS_ENABLED', 'true')
    vi.resetModules()
    const mod = await import('../image-delivery')

    const src = mod.getImageDeliverySource(media, 'card')
    expect(src).toContain('/storage/v1/render/image/public/product-images/products/a-hero.webp')
    expect(src).toContain('width=720')
    expect(src).toContain('quality=76')
    expect(src).toContain('resize=contain')

    const srcSet = mod.getImageDeliverySrcSet(media, 'card')
    expect(srcSet).toContain('320w')
    expect(srcSet).toContain('960w')
  })

  it('leaves non-Supabase local assets untouched', async () => {
    vi.stubEnv('VITE_IMAGE_TRANSFORMATIONS_ENABLED', 'true')
    vi.resetModules()
    const mod = await import('../image-delivery')

    expect(mod.getImageDeliverySource('/images/local.webp', 'hero')).toBe('/images/local.webp')
    expect(mod.getImageDeliverySrcSet('/images/local.webp', 'hero')).toBeUndefined()
  })
})
