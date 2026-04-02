import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { stripMediaTransform } from '../utils/media-frame'

const BUCKET = 'product-images'
const CACHE_1Y = '31536000'
const WEBP_QUALITY = 0.78

const VIDEO_BUCKET = 'product-videos'
const MAX_VIDEO_SIZE = 50 * 1024 * 1024
const VIDEO_MAX_WIDTH = 960
const VIDEO_TARGET_FPS = 24
const VIDEO_TARGET_BITRATE = 1_400_000

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

async function loadImageBitmap(file: File): Promise<{ bitmap: ImageBitmap }> {
  if ('createImageBitmap' in window) {
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
  canvas.width = img.naturalWidth || (img as any).width
  canvas.height = img.naturalHeight || (img as any).height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not supported')

  ctx.drawImage(img, 0, 0)

  const bitmap = await createImageBitmap(canvas)
  URL.revokeObjectURL(url)

  return { bitmap }
}

async function toWebpFile(
  file: File,
  outNameBase: string,
  maxWidth: number,
  quality = WEBP_QUALITY
): Promise<File> {
  const { bitmap } = await loadImageBitmap(file)

  const srcW = bitmap.width
  const srcH = bitmap.height
  const scale = srcW > maxWidth ? maxWidth / srcW : 1

  const dstW = Math.max(1, Math.round(srcW * scale))
  const dstH = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('Canvas 2D not supported')

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

export async function uploadImage(file: File, folder: string, fileName?: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return fileToDataUrl(file)
  }

  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const base = safeBaseName(fileName)
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
  if (!isSupabaseConfigured()) return
  if (!url || url.startsWith('data:')) return

  const cleanUrl = stripMediaTransform(url)
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = cleanUrl.indexOf(marker)
  if (idx === -1) return

  const path = cleanUrl.substring(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('Failed to delete image:', error)
}

function getSupportedWebmMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null

  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]

  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || null
}

function ensureEven(n: number) {
  return n % 2 === 0 ? n : n - 1
}

async function loadVideoElement(file: File): Promise<{ video: HTMLVideoElement; cleanup: () => void }> {
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
  onStatus?: (status: string) => void
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
      recorder.onerror = () => reject(new Error('Failed to encode the converted WebM video.'))
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

export async function uploadVideo(
  file: File,
  folder: string,
  fileName?: string,
  onStatus?: (status: string) => void
): Promise<string> {
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(`Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 50MB.`)
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

export async function deleteVideo(url: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return

  const cleanUrl = stripMediaTransform(url)
  const marker = `/storage/v1/object/public/${VIDEO_BUCKET}/`
  const idx = cleanUrl.indexOf(marker)
  if (idx === -1) return

  const path = cleanUrl.substring(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove([path])
  if (error) console.warn('Failed to delete video:', error)
}
