/**
 * Pure canonical-identity module.
 *
 * This file is imported by BOTH the browser Supabase service
 * (src/services/storage.service.ts) AND the Node-only Storage GC
 * scripts under `scripts/storage-gc/*` and `src/services/storage-gc/*`.
 *
 * IMPORTANT: it must remain free of any dependency that touches the
 * browser or Vite environment — no `import.meta.env`, no
 * `src/lib/supabase.ts`, no React. Node's tsx runtime evaluates this
 * module at import time, so any browser-only side effect here breaks
 * the CLI.
 */

/* ------------------------------------------------------------------ *
 *  Bucket names                                                       *
 * ------------------------------------------------------------------ */

export const IMAGE_BUCKET = 'product-images'
export const VIDEO_BUCKET = 'product-videos'

/* ------------------------------------------------------------------ *
 *  Types                                                              *
 * ------------------------------------------------------------------ */

export type StorageAssetKind = 'image' | 'video'

/**
 * A canonical identity for a storage object. Two URLs pointing at the
 * same object (e.g. one with a media-frame `#m=` hash, or one going
 * through the image-render transform endpoint) resolve to the same
 * canonical string, so callers can compare / dedupe safely.
 */
export interface StorageIdentity {
  kind: StorageAssetKind
  bucket: string
  path: string
  canonical: string
}

export interface AssetDeletionFailure {
  canonical: string
  bucket: string
  path: string
  error: string
}

export interface AssetDeletionResult {
  requested: number
  deleted: StorageIdentity[]
  alreadyMissing: StorageIdentity[]
  failed: AssetDeletionFailure[]
}

/* ------------------------------------------------------------------ *
 *  Canonical storage-identity extraction                              *
 * ------------------------------------------------------------------ */

const PUBLIC_MARKER = '/storage/v1/object/public/'
const RENDER_MARKER = '/storage/v1/render/image/public/'
const SIGN_MARKER = '/storage/v1/object/sign/'

/**
 * Strip the media-frame hash suffix (`#m=...`) from a URL. Inline
 * here — the utility in `src/utils/media-frame.ts` transitively
 * imports React types, which is fine at runtime but keeps this
 * module strictly self-contained.
 */
export function stripMediaTransform(media?: string | null): string {
  if (!media) return ''
  return media.split('#')[0] || ''
}

/**
 * Extract the canonical identity of a Supabase storage object from a URL.
 * Accepts:
 *   - normal public URLs
 *   - image-render/transform URLs (`/storage/v1/render/image/public/...`)
 *   - signed URLs (`/storage/v1/object/sign/...`)
 *   - URLs with a media-frame hash (`#m=...`)
 *   - URLs with query parameters (e.g. `?width=...`)
 *   - percent-encoded path segments
 *
 * Returns null for `data:` / `blob:` values, empty strings, or anything
 * that does not look like a Supabase storage URL.
 */
export function getStorageIdentity(
  url: string | null | undefined,
): StorageIdentity | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null

  const withoutHash = stripMediaTransform(trimmed)
  const withoutQuery = withoutHash.split('?')[0] || ''
  if (!withoutQuery) return null

  const marker = pickMarker(withoutQuery)
  if (!marker) return null

  const afterMarker = withoutQuery.substring(
    withoutQuery.indexOf(marker) + marker.length,
  )
  if (!afterMarker) return null

  const firstSlash = afterMarker.indexOf('/')
  if (firstSlash <= 0) return null

  const bucket = afterMarker.substring(0, firstSlash)
  const rawPath = afterMarker.substring(firstSlash + 1)
  if (!bucket || !rawPath) return null

  const decodedPath = decodePathSegments(rawPath)
  const normalizedPath = normalizePath(decodedPath)
  if (!normalizedPath) return null

  const kind = bucketKind(bucket)
  return {
    kind,
    bucket,
    path: normalizedPath,
    canonical: `${bucket}/${normalizedPath}`,
  }
}

function pickMarker(url: string): string | null {
  if (url.includes(PUBLIC_MARKER)) return PUBLIC_MARKER
  if (url.includes(RENDER_MARKER)) return RENDER_MARKER
  if (url.includes(SIGN_MARKER)) return SIGN_MARKER
  return null
}

function decodePathSegments(rawPath: string): string {
  return rawPath
    .split('/')
    .map(segment => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
    .join('/')
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, '')
}

export function bucketKind(bucket: string): StorageAssetKind {
  if (bucket === VIDEO_BUCKET) return 'video'
  return 'image'
}

export function emptyDeletionResult(): AssetDeletionResult {
  return { requested: 0, deleted: [], alreadyMissing: [], failed: [] }
}
