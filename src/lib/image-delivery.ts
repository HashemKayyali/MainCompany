import { parseMediaValue, stripMediaTransform } from '../utils/media-frame'
import {
  traceImagePreloadComplete,
  traceImagePreloadStart,
  type ImageLoadingGroup,
} from './image-loading-trace'

export type ImagePreset =
  | 'tiny'
  | 'logo'
  | 'thumbnail'
  | 'card'
  | 'category'
  | 'gallery'
  | 'detail'
  | 'hero'
  | 'fullscreen'

interface ImagePresetConfig {
  width: number
  quality: number
  srcSetWidths: number[]
  useEmbeddedPreview: boolean
}

const PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  tiny: { width: 96, quality: 68, srcSetWidths: [64, 96, 128], useEmbeddedPreview: true },
  logo: { width: 320, quality: 84, srcSetWidths: [160, 240, 320, 480], useEmbeddedPreview: true },
  thumbnail: { width: 320, quality: 70, srcSetWidths: [160, 240, 320, 480], useEmbeddedPreview: true },
  card: { width: 720, quality: 76, srcSetWidths: [320, 480, 640, 720, 960], useEmbeddedPreview: true },
  category: { width: 800, quality: 77, srcSetWidths: [360, 540, 720, 900], useEmbeddedPreview: true },
  gallery: { width: 1100, quality: 79, srcSetWidths: [480, 720, 960, 1200], useEmbeddedPreview: true },
  detail: { width: 1600, quality: 82, srcSetWidths: [720, 960, 1280, 1600], useEmbeddedPreview: false },
  hero: { width: 1600, quality: 82, srcSetWidths: [720, 960, 1280, 1600], useEmbeddedPreview: false },
  fullscreen: { width: 1920, quality: 84, srcSetWidths: [960, 1280, 1600, 1920], useEmbeddedPreview: false },
}

const SUPABASE_PUBLIC_MARKER = '/storage/v1/object/public/'
const SUPABASE_RENDER_MARKER = '/storage/v1/render/image/public/'
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/'
const CLOUDINARY_DELIVERY_ORIGIN = 'https://res.cloudinary.com'
const transformationsEnabled =
  String(import.meta.env.VITE_IMAGE_TRANSFORMATIONS_ENABLED ?? '').toLowerCase() === 'true'

const loadedImages = new Set<string>()
const preloadPromises = new Map<string, Promise<void>>()

const PRELOAD_SIZES: Record<ImagePreset, string> = {
  tiny: '96px',
  logo: '240px',
  thumbnail: '320px',
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  category: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  gallery: '(max-width: 640px) 78vw, (max-width: 1024px) 48vw, 32vw',
  detail: '100vw',
  hero: '100vw',
  fullscreen: '100vw',
}

function withDevelopmentAuditCacheBuster(src: string) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return src
  const auditRun = new URLSearchParams(window.location.search).get('imageAuditRun')
  if (!auditRun) return src

  try {
    const url = new URL(src, window.location.href)
    url.searchParams.set('__image_audit', auditRun)
    return url.toString()
  } catch {
    return src
  }
}

function cleanSource(value?: string | null) {
  return stripMediaTransform(value ?? '').trim()
}

function isSupabaseTransformable(src: string) {
  return src.includes(SUPABASE_PUBLIC_MARKER) || src.includes(SUPABASE_RENDER_MARKER)
}

export function isCloudinaryImageUrl(src: string) {
  try {
    const url = new URL(src)
    return url.hostname === 'res.cloudinary.com' && url.pathname.includes(CLOUDINARY_UPLOAD_MARKER)
  } catch {
    return false
  }
}

function toSupabaseTransformUrl(src: string, width: number, quality: number) {
  if (!src || !isSupabaseTransformable(src)) return src

  const withoutHash = src.split('#')[0] || src
  const base = withoutHash.replace(SUPABASE_PUBLIC_MARKER, SUPABASE_RENDER_MARKER)
  const url = new URL(base)

  url.searchParams.set('width', String(width))
  url.searchParams.set('quality', String(quality))
  url.searchParams.set('resize', 'contain')
  return withDevelopmentAuditCacheBuster(url.toString())
}

/**
 * Build a Cloudinary delivery URL from the stored original secure_url.
 *
 * We intentionally use Cloudinary's automatic format and quality selection,
 * while `srcset` controls the requested pixel width. `c_limit` prevents an
 * accidental upscale when the source is smaller than the preset width.
 */
function toCloudinaryTransformUrl(src: string, width: number) {
  if (!src || !isCloudinaryImageUrl(src)) return src

  const url = new URL(src)
  const markerIndex = url.pathname.indexOf(CLOUDINARY_UPLOAD_MARKER)
  if (markerIndex < 0) return src

  const prefix = url.pathname.slice(0, markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const tail = url.pathname.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const segments = tail.split('/').filter(Boolean)
  const versionIndex = segments.findIndex(segment => /^v\d+$/.test(segment))

  // Stored Eventies Cloudinary URLs are versioned Upload API secure URLs. If a
  // non-versioned URL slips through, inserting the transformation directly is
  // still a valid Cloudinary delivery form.
  const assetTail = versionIndex >= 0 ? segments.slice(versionIndex).join('/') : tail
  const transform = `c_limit,w_${Math.max(1, Math.round(width))},f_auto,q_auto`

  url.pathname = `${prefix}${transform}/${assetTail}`
  url.search = ''
  url.hash = ''
  return withDevelopmentAuditCacheBuster(url.toString())
}

function getParsedSources(media?: string) {
  const parsed = parseMediaValue(media)
  return {
    original: cleanSource(parsed.src),
    preview: cleanSource(parsed.previewSrc),
  }
}

export function getImageDeliverySource(media: string | undefined, preset: ImagePreset = 'card') {
  const config = PRESETS[preset]
  const { original, preview } = getParsedSources(media)
  if (!original) return ''

  if (isCloudinaryImageUrl(original)) {
    return toCloudinaryTransformUrl(original, config.width)
  }

  if (transformationsEnabled && isSupabaseTransformable(original)) {
    return toSupabaseTransformUrl(original, config.width, config.quality)
  }

  if (config.useEmbeddedPreview && preview) return preview
  return original
}

export function getImageDeliverySrcSet(media: string | undefined, preset: ImagePreset = 'card') {
  const { original } = getParsedSources(media)
  if (!original) return undefined

  const config = PRESETS[preset]

  if (isCloudinaryImageUrl(original)) {
    return config.srcSetWidths
      .map(width => `${toCloudinaryTransformUrl(original, width)} ${width}w`)
      .join(', ')
  }

  if (!transformationsEnabled || !isSupabaseTransformable(original)) return undefined

  return config.srcSetWidths
    .map(width => `${toSupabaseTransformUrl(original, width, config.quality)} ${width}w`)
    .join(', ')
}

export function getImagePlaceholderSource(media: string | undefined, preset: ImagePreset = 'card') {
  const { original, preview } = getParsedSources(media)
  if (!original || !preview) return ''

  const finalSource = getImageDeliverySource(media, preset)
  return finalSource !== preview ? preview : ''
}

export function isImageDeliveryLoaded(src: string | undefined) {
  return Boolean(src && loadedImages.has(src))
}

export function markImageDeliveryLoaded(src: string | undefined) {
  if (src) loadedImages.add(src)
}

export function preloadImage(
  media: string | undefined,
  preset: ImagePreset = 'detail',
  group: ImageLoadingGroup = 'other',
  sizes = PRELOAD_SIZES[preset],
): Promise<void> {
  const src = getImageDeliverySource(media, preset)
  const srcSet = getImageDeliverySrcSet(media, preset)
  if (!src || typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.resolve()
  }

  if (loadedImages.has(src)) return Promise.resolve()
  const requestKey = srcSet ? `${srcSet}|${sizes}` : src
  const existing = preloadPromises.get(requestKey)
  if (existing) return existing

  const promise = new Promise<void>(resolve => {
    const candidates = srcSet
      ? Array.from(srcSet.matchAll(/([^\s]+)\s+\d+w/g), match => match[1])
      : []
    traceImagePreloadStart(src, cleanSource(media), group, candidates)
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const done = () => {
        const loadedSrc = image.currentSrc || src
        loadedImages.add(loadedSrc)
        preloadPromises.delete(requestKey)
        traceImagePreloadComplete(loadedSrc)
        resolve()
      }

      if (typeof image.decode === 'function') {
        void image.decode().catch(() => undefined).finally(done)
      } else {
        done()
      }
    }
    image.onerror = () => {
      preloadPromises.delete(requestKey)
      traceImagePreloadComplete(image.currentSrc || src)
      resolve()
    }
    if (srcSet) {
      image.sizes = sizes
      image.srcset = srcSet
    }
    image.src = src
  })

  preloadPromises.set(requestKey, promise)
  return promise
}

export function preloadImageWhenIdle(
  media: string | undefined,
  preset: ImagePreset = 'detail',
  group: ImageLoadingGroup = 'other',
  sizes = PRELOAD_SIZES[preset],
) {
  if (typeof window === 'undefined') return () => undefined

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(() => {
      void preloadImage(media, preset, group, sizes)
    }, { timeout: 1800 })
    return () => idleWindow.cancelIdleCallback?.(handle)
  }

  const timer = window.setTimeout(() => {
    void preloadImage(media, preset, group, sizes)
  }, 600)
  return () => window.clearTimeout(timer)
}

export function ensureImageOriginPreconnect() {
  if (typeof document === 'undefined') return

  const origins = new Set<string>([CLOUDINARY_DELIVERY_ORIGIN])
  const rawSupabase = import.meta.env.VITE_SUPABASE_URL as string | undefined

  if (rawSupabase) {
    try {
      origins.add(new URL(rawSupabase).origin)
    } catch {
      // Ignore malformed local configuration; image rendering still falls back.
    }
  }

  const addLink = (rel: 'preconnect' | 'dns-prefetch', href: string) => {
    const selector = `link[rel="${rel}"][href="${href}"]`
    if (document.head.querySelector(selector)) return
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    if (rel === 'preconnect') link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }

  for (const origin of origins) {
    addLink('dns-prefetch', origin)
    addLink('preconnect', origin)
  }
}

export function imageTransformationsEnabled() {
  return transformationsEnabled
}
