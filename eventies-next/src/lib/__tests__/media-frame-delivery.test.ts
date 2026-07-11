import { describe, expect, it } from 'vitest'
import {
  encodeMediaValue,
  parseMediaValue,
  replaceMediaSource,
  updateMediaTransform,
} from '../media-frame'

describe('media delivery metadata', () => {
  const hero = 'https://example.supabase.co/storage/v1/object/public/product-images/p/hero.webp'
  const preview = 'https://example.supabase.co/storage/v1/object/public/product-images/p/thumb.webp'

  it('round-trips the embedded preview source', () => {
    const media = encodeMediaValue(hero, undefined, { previewSrc: preview })
    const parsed = parseMediaValue(media)
    expect(parsed.src).toBe(hero)
    expect(parsed.previewSrc).toBe(preview)
  })

  it('preserves delivery metadata when framing changes', () => {
    const media = encodeMediaValue(hero, undefined, { previewSrc: preview })
    const framed = updateMediaTransform(media, { x: 23, y: 77, scale: 1.2 })
    const parsed = parseMediaValue(framed)
    expect(parsed.previewSrc).toBe(preview)
    expect(parsed.transform.x).toBe(23)
    expect(parsed.transform.y).toBe(77)
    expect(parsed.transform.scale).toBe(1.2)
  })

  it('preserves preview metadata when the canonical source is replaced', () => {
    const media = encodeMediaValue(hero, undefined, { previewSrc: preview })
    const replaced = replaceMediaSource(media, (src) => `${src}?v=2`)
    const parsed = parseMediaValue(replaced)
    expect(parsed.src).toBe(`${hero}?v=2`)
    expect(parsed.previewSrc).toBe(preview)
  })
})
