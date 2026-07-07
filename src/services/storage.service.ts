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
import { encodeMediaValue } from '../utils/media-frame'

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

/* ------------------------------------------------------------------ *
 *  Constants                                                          *
 * ------------------------------------------------------------------ */

const CACHE_1Y = '31536000'
const WEBP_QUALITY = 0.78
const PREVIEW_WEBP_QUALITY = 0.74
const HERO_MAX_WIDTH = 1600
const THUMB_MAX_WIDTH = 720

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

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
 *  Image processing (WebP conversion)                                 *
 * ------------------------------------------------------------------ */

async function loadImageBitmap(file: File): Promise<{ bitmap: ImageBitmap }> {
  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(file)
    return { bitmap }
  }

  const url = URL.createObjectURL(file)
  const img = new Image()
  img.decoding = 'async'
  img.src = url

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not supported')

  ctx.drawImage(img, 0, 0)
  const bitmap = await createImageBitmap(canvas)
  URL.revokeObjectURL(url)

  return { bitmap }
}

async function bitmapToWebpFile(
  bitmap: ImageBitmap,
  outNameBase: string,
  maxDimension: number,
  quality = WEBP_QUALITY,
): Promise<File> {
  const srcW = bitmap.width
  const srcH = bitmap.height
  // Bound both dimensions. The previous width-only limiter could still emit
  // multi-megapixel portrait files (for example 1600×3000), which is costly
  // on first visit even after WebP encoding.
  const scale = Math.min(1, maxDimension / srcW, maxDimension / srcH)

  const dstW = Math.max(1, Math.round(srcW * scale))
  const dstH = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Canvas 2D not supported')

  ctx.imageSmoothingEnabled = true
  ;(ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: string }).imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, dstW, dstH)

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      value => (value ? resolve(value) : reject(new Error('Failed to encode WEBP'))),
      'image/webp',
      quality,
    )
  })

  return new File([blob], `${outNameBase}.webp`, { type: 'image/webp' })
}

async function createWebpVariants(file: File, base: string): Promise<[File, File]> {
  const { bitmap } = await loadImageBitmap(file)
  try {
    // Decode the source once, then render both delivery sizes from the same
    // bitmap. This avoids doing two full image decodes in parallel on the
    // admin device for every upload.
    return await Promise.all([
      bitmapToWebpFile(bitmap, `${base}-thumb`, THUMB_MAX_WIDTH, PREVIEW_WEBP_QUALITY),
      bitmapToWebpFile(bitmap, `${base}-hero`, HERO_MAX_WIDTH),
    ])
  } finally {
    bitmap.close?.()
  }
}

/* ------------------------------------------------------------------ *
 *  Image upload                                                       *
 * ------------------------------------------------------------------ */

/**
 * Upload an optimized preview+hero pair and return one media value.
 * The hero remains the canonical source while the preview URL is embedded in
 * the existing #m= payload. This keeps the database schema unchanged while
 * letting cards and progressive placeholders use the lightweight preview.
 */
export async function uploadImage(
  file: File,
  folder: string,
  fileName?: string,
): Promise<string> {
  const variants = await uploadImageVariants(file, folder, fileName)

  // Store the lightweight preview URL inside the existing media payload so no
  // database migration is required. FramedImage uses it for cards/thumbnails
  // and as a progressive placeholder while the detail source downloads.
  if (!variants.heroUrl || variants.heroUrl === variants.thumbUrl) {
    return variants.heroUrl
  }

  return encodeMediaValue(variants.heroUrl, undefined, { previewSrc: variants.thumbUrl })
}

export async function uploadImages(files: File[], folder: string): Promise<string[]> {
  return Promise.all(files.map(file => uploadImage(file, folder)))
}

/**
 * Upload a thumb+hero pair atomically. If either upload fails, the
 * partially-uploaded sibling (if any) is rolled back so no orphan
 * storage object is left behind.
 *
 * Rollback cleanup failures are re-surfaced via the thrown error so the
 * caller can log them — they are never silently swallowed.
 */
export async function uploadImageVariants(
  file: File,
  folder: string,
  fileName?: string,
): Promise<UploadedImageVariants> {
  if (!isSupabaseConfigured()) {
    const dataUrl = await fileToDataUrl(file)
    return { thumbUrl: dataUrl, heroUrl: dataUrl }
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)

  const [thumbFile, heroFile] = await createWebpVariants(file, base)

  const thumbPath = normalizePath(`${safeFolder}/${base}-thumb.webp`)
  const heroPath = normalizePath(`${safeFolder}/${base}-hero.webp`)

  const up = supabase.storage.from(IMAGE_BUCKET)

  const [thumbRes, heroRes] = await Promise.allSettled([
    up.upload(thumbPath, thumbFile, {
      cacheControl: CACHE_1Y,
      upsert: true,
      contentType: 'image/webp',
    }),
    up.upload(heroPath, heroFile, {
      cacheControl: CACHE_1Y,
      upsert: true,
      contentType: 'image/webp',
    }),
  ])

  const thumbOk = thumbRes.status === 'fulfilled' && !thumbRes.value.error
  const heroOk = heroRes.status === 'fulfilled' && !heroRes.value.error

  if (thumbOk && heroOk) {
    const { data: t } = up.getPublicUrl(thumbPath)
    const { data: h } = up.getPublicUrl(heroPath)
    return { thumbUrl: t.publicUrl, heroUrl: h.publicUrl }
  }

  // At least one failed — roll back any successful upload.
  const rollbackPaths: string[] = []
  if (thumbOk) rollbackPaths.push(thumbPath)
  if (heroOk) rollbackPaths.push(heroPath)

  let rollbackError: string | null = null
  if (rollbackPaths.length > 0) {
    try {
      const { error: removeErr } = await up.remove(rollbackPaths)
      if (removeErr) rollbackError = toErrorMessage(removeErr)
    } catch (err) {
      rollbackError = toErrorMessage(err)
    }
  }

  const failure =
    !thumbOk && thumbRes.status === 'fulfilled'
      ? thumbRes.value.error
      : !thumbOk && thumbRes.status === 'rejected'
        ? thumbRes.reason
        : !heroOk && heroRes.status === 'fulfilled'
          ? heroRes.value.error
          : !heroOk && heroRes.status === 'rejected'
            ? heroRes.reason
            : new Error('Unknown upload failure')

  const baseMsg = `Image variant upload failed: ${toErrorMessage(failure)}`
  const rollbackMsg = rollbackError
    ? ` (rollback cleanup also failed: ${rollbackError} — orphan may remain at ${rollbackPaths.join(', ')})`
    : rollbackPaths.length > 0
      ? ' (rollback cleanup succeeded)'
      : ''
  throw new Error(baseMsg + rollbackMsg)
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
    for (const identity of getStorageIdentities(url)) {
      if (!identities.has(identity.canonical)) {
        identities.set(identity.canonical, identity)
      }
    }
  }

  return deleteStorageIdentities(Array.from(identities.values()))
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

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('Failed to read the selected video.'))
  })

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

