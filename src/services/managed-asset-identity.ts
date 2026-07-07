import { parseMediaValue } from '../utils/media-frame'
import { getCloudinaryIdentity } from './cloudinary-identity'
import { getStorageIdentity, type StorageIdentity } from './storage-identity'

/**
 * Return every remotely managed asset represented by one Eventies media value.
 *
 * This intentionally lives outside `storage-identity.ts`: the Storage GC is a
 * Supabase-only scanner and must keep ignoring Cloudinary assets. Browser editor
 * sessions, on the other hand, need to reconcile both providers.
 */
export function getManagedAssetIdentities(
  media: string | null | undefined,
): StorageIdentity[] {
  if (!media || typeof media !== 'string') return []

  const parsed = parseMediaValue(media)
  const sources = [parsed.src, parsed.previewSrc].filter(Boolean)
  const identities = new Map<string, StorageIdentity>()

  for (const source of sources) {
    const identity = getStorageIdentity(source) ?? getCloudinaryIdentity(source)
    if (identity && !identities.has(identity.canonical)) {
      identities.set(identity.canonical, identity)
    }
  }

  return Array.from(identities.values())
}
