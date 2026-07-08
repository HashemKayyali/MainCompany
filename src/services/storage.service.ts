import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  IMAGE_BUCKET,
  VIDEO_BUCKET,
  bucketKind,
  emptyDeletionResult,
  getStorageIdentity,
  getStorageIdentities,
  stripMediaTransform,
  type AssetDeletionFailure,
  type AssetDeletionResult,
  type StorageAssetKind,
  type StorageIdentity,
} from './storage-identity'
import { uploadImageToCloudinary, deleteCloudinaryIdentities } from './cloudinary.service'
import { isCloudinaryIdentity } from './cloudinary-identity'
import { getManagedAssetIdentities } from './managed-asset-identity'

/* ------------------------------------------------------------------ *
 *  Re-exports — callers used to import these from `storage.service`   *
 *  before the pure module was extracted for Node/GC use. Keep the     *
 *  surface unchanged.                                                 *
 * ------------------------------------------------------------------ */

export {
  IMAGE_BUCKET,
  VIDEO_BUCKET,
  bucketKind,
  emptyDeletionResult,
  getStorageIdentity,
  getStorageIdentities,
  stripMediaTransform,
}
export type {
  AssetDeletionFailure,
  AssetDeletionResult,
  StorageAssetKind,
  StorageIdentity,
}
export { getManagedAssetIdentities }

/* ------------------------------------------------------------------ *
 *  Constants                                                          *
 * ------------------------------------------------------------------ */

const CACHE_1Y = '31536000'

const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const VIDEO_MAX_WIDTH = 960
const VIDEO_TARGET_FPS = 24
const VIDEO_TARGET_BITRATE = 1_400_000

export interface UploadedImageVariants {
  thumbUrl: string
  heroUrl: string
}

/* ------------------------------------------------------------------ *
 *  Small utils                                                        *
 * ------------------------------------------------------------------ */

function normalizePath(path: string): string {
  return path.replace(/^\/+/, '')
}

function safeBaseName(fileName?: string) {
  return fileName || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toErrorMessage(value: unknown): string {
  if (!value) return 'Unknown error'
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/* ------------------------------------------------------------------ *
 *  Image upload                                                       *
 * ------------------------------------------------------------------ */

/**
 * Upload one image directly to Cloudinary. Image uploads intentionally have
 * no Supabase Storage fallback: a deployment-time environment variable can no
 * longer switch production image traffic back to the `product-images` bucket.
 *
 * The Supabase Edge Function used by `uploadImageToCloudinary` only signs the
 * Cloudinary request; the image bytes are posted directly from the browser to
 * Cloudinary.
 */
export async function uploadImage(
  file: File,
  folder: string,
  _fileName?: string,
): Promise<string> {
  return uploadImageToCloudinary(file, folder)
}

export async function uploadImages(files: File[], folder: string): Promise<string[]> {
  return Promise.all(files.map(file => uploadImage(file, folder)))
}

/**
 * Compatibility wrapper kept for callers/tests that still expect the old
 * variant API. Cloudinary is now the single image-upload provider, so both
 * delivery slots point at the same Cloudinary asset. Delivery transforms can
 * derive lighter card/thumbnail variants from that canonical URL.
 */
export async function uploadImageVariants(
  file: File,
  folder: string,
  _fileName?: string,
): Promise<UploadedImageVariants> {
  const url = await uploadImageToCloudinary(file, folder)
  return { thumbUrl: url, heroUrl: url }
}

/* ------------------------------------------------------------------ *
 *  Deletion                                                           *
 * ------------------------------------------------------------------ */

/**
 * Delete a single image. Returns a structured result the caller can
 * inspect. Never throws — deletion failures are reported via the
 * `failed` array; unrecognised / non-storage URLs are silently reported
 * as `requested: 0` (nothing to do), which is safe for idempotent
 * cleanup.
 */
export async function deleteImage(
  url: string | null | undefined,
): Promise<AssetDeletionResult> {
  return deleteAssetsSafely([url])
}

export async function deleteVideo(
  url: string | null | undefined,
): Promise<AssetDeletionResult> {
  return deleteAssetsSafely([url])
}

/**
 * Bulk delete images and/or videos referenced by any of the supplied
 * URLs. Deduplicates by canonical storage identity so the same object
 * is never asked to be removed twice.
 *
 * Behaviour:
 *   - `data:` / `blob:` / non-storage URLs are ignored (they don't count
 *     as `requested`).
 *   - Removal is batched per-bucket via `supabase.storage.remove`.
 *   - "Already missing" is distinguished from real deletion failures
 *     when the Supabase response exposes enough information.
 *   - Partial failures are reported; the function never throws.
 */
export async function deleteAssetsSafely(
  urls: Array<string | null | undefined>,
): Promise<AssetDeletionResult> {
  const identities = new Map<string, StorageIdentity>()

  for (const url of urls) {
    for (const identity of getManagedAssetIdentities(url)) {
      if (!identities.has(identity.canonical)) {
        identities.set(identity.canonical, identity)
      }
    }
  }

  return deleteManagedAssetIdentities(Array.from(identities.values()))
}

/**
 * Delete a mixed provider set. Supabase identities keep the existing batched
 * bucket deletion path; Cloudinary identities are sent to the authenticated
 * Edge Function so the API secret never reaches the browser.
 */
export async function deleteManagedAssetIdentities(
  identities: StorageIdentity[],
): Promise<AssetDeletionResult> {
  const supabaseIdentities = identities.filter(identity => !isCloudinaryIdentity(identity))
  const cloudinaryIdentities = identities.filter(isCloudinaryIdentity)

  const [supabaseResult, cloudinaryResult] = await Promise.all([
    deleteStorageIdentities(supabaseIdentities),
    deleteCloudinaryIdentities(cloudinaryIdentities),
  ])

  return mergeDeletionResults(supabaseResult, cloudinaryResult)
}

/**
 * Lower-level batched deletion for callers who already hold parsed
 * `StorageIdentity` instances (e.g. the `AssetSession`, which never
 * needs the URL round-trip). `deleteAssetsSafely` is the public
 * URL-based wrapper around this.
 *
 * The identities are assumed to already be deduplicated by canonical
 * — the caller is expected to have done that when parsing URLs.
 */
export async function deleteStorageIdentities(
  identities: StorageIdentity[],
): Promise<AssetDeletionResult> {
  const result: AssetDeletionResult = {
    requested: identities.length,
    deleted: [],
    alreadyMissing: [],
    failed: [],
  }

  if (result.requested === 0) return result

  if (!isSupabaseConfigured()) {
    for (const identity of identities) {
      result.alreadyMissing.push(identity)
    }
    return result
  }

  const byBucket = new Map<string, StorageIdentity[]>()
  for (const identity of identities) {
    const list = byBucket.get(identity.bucket) ?? []
    list.push(identity)
    byBucket.set(identity.bucket, list)
  }

  await Promise.all(
    Array.from(byBucket.entries()).map(async ([bucket, list]) => {
      const paths = list.map(entry => entry.path)
      try {
        const { data, error } = await supabase.storage.from(bucket).remove(paths)
        if (error) {
          for (const identity of list) {
            result.failed.push({
              canonical: identity.canonical,
              bucket: identity.bucket,
              path: identity.path,
              error: toErrorMessage(error),
            })
          }
          return
        }

        // Supabase returns the FileObject list of successfully-removed
        // paths. Anything we asked for that isn't in that list is
        // treated as already-missing (idempotent behaviour).
        const removedSet = new Set(
          (data ?? [])
            .map(entry => (entry && typeof entry.name === 'string' ? entry.name : null))
            .filter((name): name is string => !!name),
        )

        // Supabase historically returns an empty array on success even
        // when the objects were actually removed, so we can only detect
        // "already missing" when the returned list is non-empty AND our
        // requested path is not in it.
        for (const identity of list) {
          if (removedSet.size === 0 || removedSet.has(identity.path)) {
            result.deleted.push(identity)
          } else {
            result.alreadyMissing.push(identity)
          }
        }
      } catch (err) {
        for (const identity of list) {
          result.failed.push({
            canonical: identity.canonical,
            bucket: identity.bucket,
            path: identity.path,
            error: toErrorMessage(err),
          })
        }
      }
    }),
  )

  return result
}

/**
 * Merge two deletion results into a single report — useful when a
 * caller performs several sequential cleanup steps and wants one
 * combined outcome to log.
 */
export function mergeDeletionResults(
  a: AssetDeletionResult,
  b: AssetDeletionResult,
): AssetDeletionResult {
  return {
    requested: a.requested + b.requested,
    deleted: [...a.deleted, ...b.deleted],
    alreadyMissing: [...a.alreadyMissing, ...b.alreadyMissing],
    failed: [...a.failed, ...b.failed],
  }
}

export function isDeletionSuccessful(result: AssetDeletionResult): boolean {
  return result.failed.length === 0
}

/* ------------------------------------------------------------------ *
 *  Video processing                                                   *
 * ------------------------------------------------------------------ */

function getSupportedWebmMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null

  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || null
}

function ensureEven(n: number) {
  return n % 2 === 0 ? n : n - 1
}

async function loadVideoElement(
  file: File,
): Promise<{ video: HTMLVideoElement; cleanup: () => void }> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')

  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('Failed to read the selected video.'))
    })
  } catch (error) {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(url)
    throw error
  }

  return {
    video,
    cleanup: () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    },
  }
}

async function toWebmVideo(
  file: File,
  outNameBase: string,
  onStatus?: (status: string) => void,
): Promise<File> {
  const mimeType = getSupportedWebmMimeType()
  if (!mimeType) {
    throw new Error('This browser does not support automatic WebM conversion.')
  }

  onStatus?.('Converting video to WebM...')

  const { video, cleanup } = await loadVideoElement(file)

  try {
    const srcW = video.videoWidth || 1280
    const srcH = video.videoHeight || 720
    const scale = srcW > VIDEO_MAX_WIDTH ? VIDEO_MAX_WIDTH / srcW : 1

    const dstW = Math.max(2, ensureEven(Math.round(srcW * scale)))
    const dstH = Math.max(2, ensureEven(Math.round(srcH * scale)))

    const canvas = document.createElement('canvas')
    canvas.width = dstW
    canvas.height = dstH

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D is not available for video conversion.')

    const stream = canvas.captureStream(VIDEO_TARGET_FPS)
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: VIDEO_TARGET_BITRATE,
    })

    const chunks: Blob[] = []
    const blobPromise = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onerror = () =>
        reject(new Error('Failed to encode the converted WebM video.'))
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
    })

    let rafId = 0
    const drawFrame = () => {
      if (video.paused || video.ended) return
      ctx.drawImage(video, 0, 0, dstW, dstH)
      rafId = window.requestAnimationFrame(drawFrame)
    }

    const endedPromise = new Promise<void>((resolve, reject) => {
      video.onended = () => resolve()
      video.onerror = () => reject(new Error('Failed while processing the video frames.'))
    })

    recorder.start(1000)
    await video.play()
    drawFrame()
    await endedPromise

    window.cancelAnimationFrame(rafId)
    recorder.stop()

    const blob = await blobPromise
    return new File([blob], `${outNameBase}.webm`, {
      type: 'video/webm',
      lastModified: Date.now(),
    })
  } finally {
    cleanup()
  }
}

/* ------------------------------------------------------------------ *
 *  Video upload                                                       *
 * ------------------------------------------------------------------ */

export async function uploadVideo(
  file: File,
  folder: string,
  fileName?: string,
  onStatus?: (status: string) => void,
): Promise<string> {
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 50MB.`,
    )
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)
  let uploadFile = file

  try {
    const convertedFile = await toWebmVideo(file, base, onStatus)
    if (convertedFile.size < file.size) {
      uploadFile = convertedFile
    } else {
      onStatus?.('Original video is already lighter, uploading it as-is...')
    }
  } catch (err) {
    console.warn('[Video] WebM conversion failed, falling back to original file:', err)
    onStatus?.('WebM conversion unavailable, uploading original video...')
  }

  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(uploadFile)
  }

  const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'webm'
  const path = normalizePath(`${safeFolder}/${base}.${ext}`)

  onStatus?.(`Uploading ${(uploadFile.size / 1024 / 1024).toFixed(1)}MB...`)

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, uploadFile, {
    cacheControl: CACHE_1Y,
    upsert: true,
    contentType: uploadFile.type || 'video/webm',
  })
  if (error) throw error

  const { data: urlData } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

