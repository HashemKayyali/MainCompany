import { parseMediaValue, stripMediaTransform } from './media-frame'

/**
 * FOUND-022 — Cloudinary loader wrapping the PORTED URL builders from
 * src/lib/image-delivery.ts. URL OUTPUT IS BYTE-IDENTICAL to the legacy
 * builder (verified by the ported image-delivery test suite): transform
 * segment `c_limit,w_{width},f_auto,q_auto`, versioned-tail handling, and
 * the Supabase render-API fallback behind the flag.
 *
 * ENV-003 decision applied: `NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED`,
 * identical default-false semantics (prod value is unset=false — bundle
 * evidence in the Phase-0 environment inventory). The dev-only audit
 * cache-buster from the Vite module is deliberately NOT ported (it hung off
 * import.meta.env.DEV + window.location; the Next app has no equivalent
 * surface — noted in the P1 report).
 */

export type ImagePreset =
  'tiny' | 'logo' | 'thumbnail' | 'card' | 'category' | 'gallery' | 'detail' | 'hero' | 'fullscreen'

interface PresetConfig {
  width: number
  quality: number
  srcSetWidths: number[]
  useEmbeddedPreview: boolean
}

/** VERBATIM preset table (surface registry formalizes per-surface binding in IMG-002). */
export const PRESETS: Record<ImagePreset, PresetConfig> = {
  tiny: { width: 96, quality: 60, srcSetWidths: [48, 96, 144], useEmbeddedPreview: true },
  logo: { width: 240, quality: 70, srcSetWidths: [120, 240, 360], useEmbeddedPreview: true },
  thumbnail: {
    width: 320,
    quality: 72,
    srcSetWidths: [160, 240, 320, 480],
    useEmbeddedPreview: true,
  },
  card: {
    width: 720,
    quality: 76,
    srcSetWidths: [320, 480, 640, 720, 960],
    useEmbeddedPreview: true,
  },
  category: {
    width: 800,
    quality: 77,
    srcSetWidths: [360, 540, 720, 900],
    useEmbeddedPreview: true,
  },
  gallery: {
    width: 1100,
    quality: 79,
    srcSetWidths: [480, 720, 960, 1200],
    useEmbeddedPreview: true,
  },
  detail: {
    width: 1600,
    quality: 82,
    srcSetWidths: [720, 960, 1280, 1600],
    useEmbeddedPreview: false,
  },
  hero: {
    width: 1600,
    quality: 82,
    srcSetWidths: [720, 960, 1280, 1600],
    useEmbeddedPreview: false,
  },
  fullscreen: {
    width: 1920,
    quality: 84,
    srcSetWidths: [960, 1280, 1600, 1920],
    useEmbeddedPreview: false,
  },
}

const SUPABASE_PUBLIC_MARKER = '/storage/v1/object/public/'
const SUPABASE_RENDER_MARKER = '/storage/v1/render/image/public/'
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/'

const transformationsEnabled =
  String(process.env.NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED ?? '').toLowerCase() === 'true'

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

export function toSupabaseTransformUrl(src: string, width: number, quality: number) {
  if (!src || !isSupabaseTransformable(src)) return src

  const withoutHash = src.split('#')[0] || src
  const base = withoutHash.replace(SUPABASE_PUBLIC_MARKER, SUPABASE_RENDER_MARKER)
  const url = new URL(base)

  url.searchParams.set('width', String(width))
  url.searchParams.set('quality', String(quality))
  url.searchParams.set('resize', 'contain')
  return url.toString()
}

/**
 * Build a Cloudinary delivery URL from the stored original secure_url.
 * `c_limit` prevents accidental upscale; f_auto/q_auto pick format/quality.
 */
export function toCloudinaryTransformUrl(src: string, width: number) {
  if (!src || !isCloudinaryImageUrl(src)) return src

  const url = new URL(src)
  const markerIndex = url.pathname.indexOf(CLOUDINARY_UPLOAD_MARKER)
  if (markerIndex < 0) return src

  const prefix = url.pathname.slice(0, markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const tail = url.pathname.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const segments = tail.split('/').filter(Boolean)
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment))

  // Stored Eventies Cloudinary URLs are versioned Upload API secure URLs. If a
  // non-versioned URL slips through, inserting the transformation directly is
  // still a valid Cloudinary delivery form.
  const assetTail = versionIndex >= 0 ? segments.slice(versionIndex).join('/') : tail
  const transform = `c_limit,w_${Math.max(1, Math.round(width))},f_auto,q_auto`

  url.pathname = `${prefix}${transform}/${assetTail}`
  url.search = ''
  url.hash = ''
  return url.toString()
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
      .map((width) => `${toCloudinaryTransformUrl(original, width)} ${width}w`)
      .join(', ')
  }

  if (!transformationsEnabled || !isSupabaseTransformable(original)) return undefined

  return config.srcSetWidths
    .map((width) => `${toSupabaseTransformUrl(original, width, config.quality)} ${width}w`)
    .join(', ')
}

export function getImagePlaceholderSource(media: string | undefined, preset: ImagePreset = 'card') {
  const { original, preview } = getParsedSources(media)
  if (!original || !preview) return ''

  const finalSource = getImageDeliverySource(media, preset)
  return finalSource !== preview ? preview : ''
}

/**
 * next/image custom loader (next.config `images.loader: 'custom'` binds it in
 * P2 when the first real image renders). Cloudinary URLs transform; legacy
 * Supabase URLs pass through per the flag semantics above.
 */
export default function eventiesImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (isCloudinaryImageUrl(src)) return toCloudinaryTransformUrl(src, width)
  if (transformationsEnabled && isSupabaseTransformable(src)) {
    return toSupabaseTransformUrl(src, width, quality ?? 75)
  }
  return src
}
