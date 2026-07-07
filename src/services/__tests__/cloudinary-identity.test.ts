import { describe, expect, it } from 'vitest'
import { encodeMediaValue } from '../../utils/media-frame'
import { getCloudinaryIdentity } from '../cloudinary-identity'
import { getManagedAssetIdentities } from '../managed-asset-identity'

const original =
  'https://res.cloudinary.com/vcax8jxb/image/upload/v1783447500/eventies/gallery/sample.photo.jpg'

describe('Cloudinary managed identity parsing', () => {
  it('extracts the Cloudinary public ID from a versioned secure URL', () => {
    const identity = getCloudinaryIdentity(original)
    expect(identity?.cloudName).toBe('vcax8jxb')
    expect(identity?.publicId).toBe('eventies/gallery/sample.photo')
    expect(identity?.canonical).toBe(
      'cloudinary:vcax8jxb:image/eventies/gallery/sample.photo',
    )
  })


  it('also parses a root-level Cloudinary asset URL', () => {
    const root =
      'https://res.cloudinary.com/vcax8jxb/image/upload/v1783447500/WhatsApp_Image_test.jpg'
    expect(getCloudinaryIdentity(root)?.publicId).toBe('WhatsApp_Image_test')
  })

  it('parses a transformed Cloudinary URL back to the same asset', () => {
    const transformed =
      'https://res.cloudinary.com/vcax8jxb/image/upload/c_limit,w_640/f_auto,q_auto/v1783447500/eventies/gallery/sample.photo.jpg'

    expect(getCloudinaryIdentity(transformed)?.canonical).toBe(
      getCloudinaryIdentity(original)?.canonical,
    )
  })

  it('tracks Cloudinary and Supabase media values through one hybrid parser', () => {
    const supabase =
      'https://example.supabase.co/storage/v1/object/public/product-images/gallery/old.webp'
    const cloudinaryMedia = encodeMediaValue(original, { x: 30 })

    expect(getManagedAssetIdentities(cloudinaryMedia)).toHaveLength(1)
    expect(getManagedAssetIdentities(supabase)).toHaveLength(1)
    expect(getManagedAssetIdentities('https://example.com/unmanaged.jpg')).toHaveLength(0)
  })
})
