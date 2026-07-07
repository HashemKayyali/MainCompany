import { stripMediaTransform, type StorageIdentity } from './storage-identity'

const CLOUDINARY_DELIVERY_HOST = 'res.cloudinary.com'

export interface CloudinaryStorageIdentity extends StorageIdentity {
  provider: 'cloudinary'
  cloudName: string
  publicId: string
  resourceType: 'image'
}

/**
 * Parse a versioned Cloudinary delivery URL back to the original asset public ID.
 *
 * Stored Eventies values use the `secure_url` returned by the Upload API. Those
 * URLs are versioned (`.../image/upload/v123/...`) which makes the public ID
 * boundary unambiguous even if a transformed delivery URL is passed later.
 */
export function getCloudinaryIdentity(
  media: string | null | undefined,
): CloudinaryStorageIdentity | null {
  if (!media || typeof media !== 'string') return null

  const clean = stripMediaTransform(media).trim()
  if (!clean || clean.startsWith('data:') || clean.startsWith('blob:')) return null

  let url: URL
  try {
    url = new URL(clean)
  } catch {
    return null
  }

  if (url.hostname !== CLOUDINARY_DELIVERY_HOST) return null

  const segments = url.pathname
    .split('/')
    .filter(Boolean)
    .map(segment => safeDecode(segment))

  // /<cloud_name>/image/upload/[transformations...]/v123/<public_id>.<format>
  if (segments.length < 5) return null

  const [cloudName, resourceType, deliveryType] = segments
  if (!cloudName || resourceType !== 'image' || deliveryType !== 'upload') return null

  const versionIndex = segments.findIndex((segment, index) => index >= 3 && /^v\d+$/.test(segment))
  if (versionIndex < 0 || versionIndex >= segments.length - 1) return null

  const publicIdSegments = segments.slice(versionIndex + 1)
  const last = publicIdSegments[publicIdSegments.length - 1]
  if (!last) return null

  // The secure URL includes the delivery format extension. Cloudinary public IDs
  // may contain dots, so remove only the final extension-like suffix.
  publicIdSegments[publicIdSegments.length - 1] = last.replace(/\.[a-zA-Z0-9]{2,8}$/, '')
  const publicId = publicIdSegments.join('/').replace(/^\/+|\/+$/g, '')
  if (!publicId) return null

  const bucket = `cloudinary:${cloudName}:image`
  return {
    provider: 'cloudinary',
    kind: 'image',
    bucket,
    path: publicId,
    canonical: `${bucket}/${publicId}`,
    cloudName,
    publicId,
    resourceType: 'image',
  }
}

export function isCloudinaryIdentity(identity: StorageIdentity): identity is CloudinaryStorageIdentity {
  return (identity as Partial<CloudinaryStorageIdentity>).provider === 'cloudinary'
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
