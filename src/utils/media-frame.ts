import type { CSSProperties } from 'react'

export type MediaFit = 'cover' | 'contain'

export interface MediaFrameTransform {
  x: number
  y: number
  scale: number
  fit: MediaFit
  bgColor: string
  bgOpacity: number
}

export interface ParsedMediaValue {
  src: string
  transform: MediaFrameTransform
  hasTransform: boolean
}

const HASH_PREFIX = 'm='
const DEFAULT_TRANSFORM: MediaFrameTransform = {
  x: 50,
  y: 50,
  scale: 1,
  fit: 'cover',
  bgColor: '#0b1020',
  bgOpacity: 0,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number, precision = 2) => Number(value.toFixed(precision))

function normalizeHexColor(value: unknown, fallback: string) {
  const raw = String(value || fallback).trim()
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1]
    const g = raw[2]
    const b = raw[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  if (/^#[0-9a-fA-F]{8}$/.test(raw)) return raw.slice(0, 7).toLowerCase()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
  return fallback
}

function toRgba(hex: string, opacity: number) {
  const normalized = normalizeHexColor(hex, DEFAULT_TRANSFORM.bgColor)
  const clean = normalized.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${round(clamp(opacity, 0, 1), 2)})`
}

function encodeBase64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: string) {
  const base = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base.length % 4 === 0 ? '' : '='.repeat(4 - (base.length % 4))
  return atob(base + pad)
}

export function normalizeMediaTransform(
  value?: Partial<MediaFrameTransform>,
  fallback?: Partial<MediaFrameTransform>
): MediaFrameTransform {
  const source = { ...DEFAULT_TRANSFORM, ...fallback, ...value }

  return {
    x: round(clamp(Number(source.x ?? DEFAULT_TRANSFORM.x), 0, 100), 1),
    y: round(clamp(Number(source.y ?? DEFAULT_TRANSFORM.y), 0, 100), 1),
    scale: round(clamp(Number(source.scale ?? DEFAULT_TRANSFORM.scale), 0.25, 4), 2),
    fit: source.fit === 'contain' ? 'contain' : 'cover',
    bgColor: normalizeHexColor(source.bgColor, DEFAULT_TRANSFORM.bgColor),
    bgOpacity: round(clamp(Number(source.bgOpacity ?? DEFAULT_TRANSFORM.bgOpacity), 0, 1), 2),
  }
}

export function stripMediaTransform(media?: string) {
  if (!media) return ''
  return media.split('#')[0] || ''
}

export function hasMediaTransform(media?: string) {
  if (!media) return false
  const hash = media.split('#')[1] || ''
  return hash.startsWith(HASH_PREFIX)
}

export function parseMediaValue(
  media?: string,
  fallback?: Partial<MediaFrameTransform>
): ParsedMediaValue {
  const src = stripMediaTransform(media)
  if (!media) {
    return { src: '', transform: normalizeMediaTransform(undefined, fallback), hasTransform: false }
  }

  const hash = media.split('#')[1] || ''
  if (!hash.startsWith(HASH_PREFIX)) {
    return { src, transform: normalizeMediaTransform(undefined, fallback), hasTransform: false }
  }

  try {
    const raw = JSON.parse(decodeBase64Url(hash.slice(HASH_PREFIX.length))) as Partial<MediaFrameTransform>
    return { src, transform: normalizeMediaTransform(raw, fallback), hasTransform: true }
  } catch {
    return { src, transform: normalizeMediaTransform(undefined, fallback), hasTransform: false }
  }
}

function isDefaultTransform(transform: MediaFrameTransform) {
  return (
    transform.x === DEFAULT_TRANSFORM.x &&
    transform.y === DEFAULT_TRANSFORM.y &&
    transform.scale === DEFAULT_TRANSFORM.scale &&
    transform.fit === DEFAULT_TRANSFORM.fit &&
    transform.bgColor === DEFAULT_TRANSFORM.bgColor &&
    transform.bgOpacity === DEFAULT_TRANSFORM.bgOpacity
  )
}

export function encodeMediaValue(src: string, transform?: Partial<MediaFrameTransform>) {
  const cleanSrc = stripMediaTransform(src)
  const normalized = normalizeMediaTransform(transform)

  if (!cleanSrc || isDefaultTransform(normalized)) {
    return cleanSrc
  }

  const payload = encodeBase64Url(JSON.stringify(normalized))
  return `${cleanSrc}#${HASH_PREFIX}${payload}`
}

export function updateMediaTransform(
  media: string,
  transform?: Partial<MediaFrameTransform>,
  fallback?: Partial<MediaFrameTransform>
) {
  const parsed = parseMediaValue(media, fallback)
  return encodeMediaValue(parsed.src, { ...parsed.transform, ...transform })
}

export function replaceMediaSource(
  media: string,
  replacer: (src: string) => string,
  fallback?: Partial<MediaFrameTransform>
) {
  const parsed = parseMediaValue(media, fallback)
  return encodeMediaValue(replacer(parsed.src), parsed.transform)
}

export function getMediaObjectStyle(
  media: string,
  options?: {
    fallback?: Partial<MediaFrameTransform>
    extraScale?: number
  }
): CSSProperties {
  const parsed = parseMediaValue(media, options?.fallback)
  const scale = round(parsed.transform.scale * (options?.extraScale ?? 1), 3)

  return {
    objectFit: parsed.transform.fit,
    objectPosition: `${parsed.transform.x}% ${parsed.transform.y}%`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    backgroundColor:
      parsed.transform.bgOpacity > 0
        ? toRgba(parsed.transform.bgColor, parsed.transform.bgOpacity)
        : undefined,
  }
}

export function inferMediaKind(media?: string): 'image' | 'video' {
  const src = stripMediaTransform(media).toLowerCase()
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(src) ? 'video' : 'image'
}
