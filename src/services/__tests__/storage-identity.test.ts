import { describe, it, expect } from 'vitest'
import { getStorageIdentities, getStorageIdentity, IMAGE_BUCKET, VIDEO_BUCKET } from '../storage.service'
import { encodeMediaValue } from '../../utils/media-frame'

/*
 * Canonical storage-identity extraction is the entire foundation for
 * safe deduplication and deletion — every session-lifecycle test
 * indirectly depends on these guarantees.
 */

describe('getStorageIdentity', () => {
  const project = 'https://example.supabase.co'

  it('parses a normal public image URL', () => {
    const url = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/hero.webp`
    const id = getStorageIdentity(url)
    expect(id).toEqual({
      kind: 'image',
      bucket: IMAGE_BUCKET,
      path: 'products/hero.webp',
      canonical: `${IMAGE_BUCKET}/products/hero.webp`,
    })
  })

  it('parses a normal public video URL', () => {
    const url = `${project}/storage/v1/object/public/${VIDEO_BUCKET}/products/clip.webm`
    const id = getStorageIdentity(url)
    expect(id?.kind).toBe('video')
    expect(id?.bucket).toBe(VIDEO_BUCKET)
    expect(id?.path).toBe('products/clip.webm')
  })

  it('strips media-frame hash from URLs', () => {
    const plain = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/gallery/a.webp`
    const framed = `${plain}#m=eyJ4Ijo1MH0`
    expect(getStorageIdentity(plain)?.canonical).toBe(
      getStorageIdentity(framed)?.canonical,
    )
  })

  it('strips query parameters (image transform width/height)', () => {
    const plain = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/gallery/a.webp`
    const withQuery = `${plain}?width=200&height=200`
    expect(getStorageIdentity(withQuery)?.path).toBe('gallery/a.webp')
  })

  it('parses image-render transform URLs to the same canonical as the public URL', () => {
    const publicUrl = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/a.webp`
    const renderUrl = `${project}/storage/v1/render/image/public/${IMAGE_BUCKET}/products/a.webp?width=320`
    expect(getStorageIdentity(publicUrl)?.canonical).toBe(
      getStorageIdentity(renderUrl)?.canonical,
    )
  })

  it('parses signed URLs to the same canonical as the public URL', () => {
    const publicUrl = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/a.webp`
    const signedUrl = `${project}/storage/v1/object/sign/${IMAGE_BUCKET}/products/a.webp?token=abc.def`
    expect(getStorageIdentity(publicUrl)?.canonical).toBe(
      getStorageIdentity(signedUrl)?.canonical,
    )
  })

  it('decodes percent-encoded path segments', () => {
    const url = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/categories/my%20folder/a.webp`
    expect(getStorageIdentity(url)?.path).toBe('categories/my folder/a.webp')
  })

  it('returns the same canonical for duplicate URLs (framed vs. bare vs. transform)', () => {
    const bare = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/gallery/b.webp`
    const framed = `${bare}#m=SGVsbG8`
    const transformed = `${project}/storage/v1/render/image/public/${IMAGE_BUCKET}/gallery/b.webp?width=800`
    const canonicals = [bare, framed, transformed].map(u => getStorageIdentity(u)?.canonical)
    expect(new Set(canonicals).size).toBe(1)
  })



  it('expands the primary and embedded preview identities from one media value', () => {
    const hero = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/a-hero.webp`
    const preview = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/a-thumb.webp`
    const media = encodeMediaValue(hero, undefined, { previewSrc: preview })

    expect(getStorageIdentities(media).map(identity => identity.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
      `${IMAGE_BUCKET}/products/a-thumb.webp`,
    ])
  })

  it('deduplicates a preview identity when it matches the primary source', () => {
    const hero = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/products/a.webp`
    const media = encodeMediaValue(hero, undefined, { previewSrc: hero })
    expect(getStorageIdentities(media)).toHaveLength(1)
  })

  it('rejects data: and blob: URLs', () => {
    expect(getStorageIdentity('data:image/webp;base64,AAAA')).toBeNull()
    expect(getStorageIdentity('blob:https://foo/bar-baz')).toBeNull()
  })

  it('rejects null, undefined, empty strings and non-storage URLs', () => {
    expect(getStorageIdentity(null)).toBeNull()
    expect(getStorageIdentity(undefined)).toBeNull()
    expect(getStorageIdentity('')).toBeNull()
    expect(getStorageIdentity('   ')).toBeNull()
    expect(getStorageIdentity('https://cdn.example.com/asset.png')).toBeNull()
  })

  it('rejects URLs without a path after the bucket segment', () => {
    const url = `${project}/storage/v1/object/public/${IMAGE_BUCKET}/`
    expect(getStorageIdentity(url)).toBeNull()
  })
})
