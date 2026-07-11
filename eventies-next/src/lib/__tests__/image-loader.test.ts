import { afterEach, describe, expect, it, vi } from 'vitest'
import { encodeMediaValue } from '../media-frame'

const hero =
  'https://example.supabase.co/storage/v1/object/public/product-images/products/a-hero.webp'
const preview =
  'https://example.supabase.co/storage/v1/object/public/product-images/products/a-thumb.webp'
const media = encodeMediaValue(hero, undefined, { previewSrc: preview })

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('image delivery strategy', () => {
  it('uses the embedded preview for card-sized delivery without transformations', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED', 'false')
    vi.resetModules()
    const mod = await import('../image-loader')

    expect(mod.getImageDeliverySource(media, 'card')).toBe(preview)
    expect(mod.getImageDeliverySource(media, 'detail')).toBe(hero)
    expect(mod.getImageDeliverySrcSet(media, 'card')).toBeUndefined()
    expect(mod.getImagePlaceholderSource(media, 'detail')).toBe(preview)
  })

  it('builds Supabase render URLs and a responsive srcset when transformations are enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED', 'true')
    vi.resetModules()
    const mod = await import('../image-loader')

    const src = mod.getImageDeliverySource(media, 'card')
    expect(src).toContain('/storage/v1/render/image/public/product-images/products/a-hero.webp')
    expect(src).toContain('width=720')
    expect(src).toContain('quality=76')
    expect(src).toContain('resize=contain')

    const srcSet = mod.getImageDeliverySrcSet(media, 'card')
    expect(srcSet).toContain('320w')
    expect(srcSet).toContain('960w')
  })

  it('builds responsive Cloudinary f_auto/q_auto URLs without a feature flag', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED', 'false')
    vi.resetModules()
    const mod = await import('../image-loader')

    const cloudinary =
      'https://res.cloudinary.com/vcax8jxb/image/upload/v1783447500/eventies/gallery/sample.jpg'

    const src = mod.getImageDeliverySource(cloudinary, 'card')
    expect(src).toContain('/image/upload/c_limit,w_720,f_auto,q_auto/v1783447500/')

    const srcSet = mod.getImageDeliverySrcSet(cloudinary, 'card')
    expect(srcSet).toContain('c_limit,w_320,f_auto,q_auto')
    expect(srcSet).toContain('c_limit,w_960,f_auto,q_auto')
    expect(srcSet).toContain('320w')
    expect(srcSet).toContain('960w')
  })

  it('leaves non-Supabase local assets untouched', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED', 'true')
    vi.resetModules()
    const mod = await import('../image-loader')

    expect(mod.getImageDeliverySource('/images/local.webp', 'hero')).toBe('/images/local.webp')
    expect(mod.getImageDeliverySrcSet('/images/local.webp', 'hero')).toBeUndefined()
  })
})
