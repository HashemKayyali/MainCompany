/**
 * Image upload service.
 * Uses base64 data URLs by default (no backend needed).
 * When Supabase is configured, uploads to Supabase Storage.
 *
 * ✅ Update:
 * - Convert any uploaded image to WEBP before uploading (client-side)
 * - Optional: upload variants (thumb + hero) as WEBP
 * - Better cache headers
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const BUCKET = 'product-images'

// سنة كاش للملفات الثابتة (مهم للأداء)
const CACHE_1Y = '31536000'

// جودة WEBP (0..1)
const WEBP_QUALITY = 0.78

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function normalizePath(path: string): string {
  // إزالة أي "/" في البداية
  return path.replace(/^\/+/, '')
}

function safeBaseName(fileName?: string) {
  return (
    fileName ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  )
}

/**
 * Load image from File in the browser.
 */
async function loadImageBitmap(file: File): Promise<{ bitmap: ImageBitmap; revoke?: () => void }> {
  // createImageBitmap is fast when supported
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    return { bitmap }
  }

  // Fallback to HTMLImageElement
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
  })

  // Convert HTMLImageElement to ImageBitmap via canvas draw
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || (img as any).width
  canvas.height = img.naturalHeight || (img as any).height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not supported')
  ctx.drawImage(img, 0, 0)

  const bitmap = await createImageBitmap(canvas)
  URL.revokeObjectURL(url)

  return { bitmap }
}

/**
 * Resize + encode to WEBP (client-side).
 * - maxWidth: cap the width (keeps aspect ratio)
 */
async function toWebpFile(
  file: File,
  outNameBase: string,
  maxWidth: number,
  quality = WEBP_QUALITY
): Promise<File> {
  const { bitmap } = await loadImageBitmap(file)

  const srcW = bitmap.width
  const srcH = bitmap.height

  // Keep aspect ratio
  const scale = srcW > maxWidth ? maxWidth / srcW : 1
  const dstW = Math.max(1, Math.round(srcW * scale))
  const dstH = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Canvas 2D not supported')

  // high quality scaling
  ctx.imageSmoothingEnabled = true
  ;(ctx as any).imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, dstW, dstH)

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Failed to encode WEBP'))),
      'image/webp',
      quality
    )
  })

  return new File([blob], `${outNameBase}.webp`, { type: 'image/webp' })
}

/**
 * ✅ Old API but now uploads WEBP always.
 * Returns a public URL string.
 *
 * Strategy:
 * - Convert to WEBP
 * - Resize (cap) to 1600px by default to prevent gigantic uploads
 */
export async function uploadImage(file: File, folder: string, fileName?: string): Promise<string> {
  // fallback إذا Supabase مش مهيأ
  if (!isSupabaseConfigured()) {
    return fileToDataUrl(file)
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)

  // cap to prevent 4000px+ images for normal usage
  const webpFile = await toWebpFile(file, `${base}-hero`, 1600)

  const path = normalizePath(`${safeFolder}/${base}-hero.webp`)

  const { error } = await supabase.storage.from(BUCKET).upload(path, webpFile, {
    cacheControl: CACHE_1Y,
    upsert: true,
    contentType: 'image/webp',
  })
  if (error) throw error

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

/**
 * ✅ New API: upload 2 variants automatically:
 * - thumb (512px): for cards/grids
 * - hero  (1600px): for product page / big preview
 *
 * Returns both URLs.
 */
export async function uploadImageVariants(
  file: File,
  folder: string,
  fileName?: string
): Promise<{ thumbUrl: string; heroUrl: string }> {
  if (!isSupabaseConfigured()) {
    const dataUrl = await fileToDataUrl(file)
    return { thumbUrl: dataUrl, heroUrl: dataUrl }
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)

  const [thumbFile, heroFile] = await Promise.all([
    toWebpFile(file, `${base}-thumb`, 512),
    toWebpFile(file, `${base}-hero`, 1600),
  ])

  const thumbPath = normalizePath(`${safeFolder}/${base}-thumb.webp`)
  const heroPath = normalizePath(`${safeFolder}/${base}-hero.webp`)

  const up = supabase.storage.from(BUCKET)

  const [thumbRes, heroRes] = await Promise.all([
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

  if (thumbRes.error) throw thumbRes.error
  if (heroRes.error) throw heroRes.error

  const { data: t } = up.getPublicUrl(thumbPath)
  const { data: h } = up.getPublicUrl(heroPath)

  return { thumbUrl: t.publicUrl, heroUrl: h.publicUrl }
}

export async function uploadImages(files: File[], folder: string): Promise<string[]> {
  return Promise.all(files.map(file => uploadImage(file, folder)))
}

export async function deleteImage(url: string): Promise<void> {
  // إذا data url أو supabase مش مهيأ
  if (!isSupabaseConfigured()) return
  if (!url || url.startsWith('data:')) return

  // شكل الرابط غالبًا: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return

  const path = url.substring(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('Failed to delete image:', error)
}

/**
 * ✅ Upload a video file to Supabase Storage.
 * - Accepts mp4, webm, mov (max ~50MB recommended)
 * - Returns the public URL
 */
const VIDEO_BUCKET = 'product-videos'
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export async function uploadVideo(file: File, folder: string, fileName?: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Fallback: return object URL (won't persist across sessions)
    return URL.createObjectURL(file)
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(`Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 50MB.`)
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const path = normalizePath(`${safeFolder}/${base}.${ext}`)

  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
    cacheControl: CACHE_1Y,
    upsert: true,
    contentType: file.type || 'video/mp4',
  })
  if (error) throw error

  const { data: urlData } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

export async function deleteVideo(url: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return

  const marker = `/storage/v1/object/public/${VIDEO_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return

  const path = url.substring(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove([path])
  if (error) console.warn('Failed to delete video:', error)
}