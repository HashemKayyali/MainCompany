'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { parseMediaValue } from '@/lib/media-frame'

/**
 * IMG-002/004/005 — the single catalog image component. Parses the stored
 * media value (media-frame encoding) to the original URL, hands it to
 * next/image which runs the ported Cloudinary loader (ADR-08). Always carries
 * W/H or `fill` (CLS sweep), and on error swaps to the shared fallback SVG
 * without a layout jump (IMG-005).
 */
const FALLBACK = '/images/image-fallback.svg'

type SmartImageProps = {
  media: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  loading?: ImageProps['loading']
  fetchPriority?: ImageProps['fetchPriority']
} & (
  { fill: true; width?: never; height?: never } | { fill?: false; width: number; height: number }
)

export function SmartImage({
  media,
  alt,
  className,
  sizes,
  priority,
  loading,
  fetchPriority,
  ...dim
}: SmartImageProps) {
  const parsed = parseMediaValue(media ?? undefined)
  const original = (parsed.src || '').trim()
  const [errored, setErrored] = useState(false)
  const src = errored || !original ? FALLBACK : original
  // The custom loader can resize Cloudinary/Supabase media but not files from
  // public/. Passing a local file through it makes next/image generate several
  // widths that all resolve to the same URL and emits a runtime warning. Local
  // assets in this app are already delivery-sized WebP/SVG, so bypassing the
  // loader is both honest and warning-free.
  const unoptimized = src === FALLBACK || src.startsWith('/')

  const common = {
    src,
    className,
    sizes,
    priority,
    loading,
    fetchPriority,
    unoptimized,
    onError: () => setErrored(true),
  }

  if (dim.fill) return <Image {...common} alt={alt} fill />
  return <Image {...common} alt={alt} width={dim.width} height={dim.height} />
}
