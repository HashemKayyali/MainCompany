import { DEFAULT_FROM, DEFAULT_TO } from './constants'

export const normalizeHex = (hex: string | undefined, fallback: string) => {
  const h = String(hex || fallback).trim()
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    const r = h[1]
    const g = h[2]
    const b = h[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  if (/^#[0-9a-fA-F]{8}$/.test(h)) return h.slice(0, 7).toLowerCase()
  if (/^#[0-9a-fA-F]{6}$/.test(h)) return h.toLowerCase()
  return fallback.toLowerCase()
}

export const parseGradient = (badgeColor: string) => {
  const raw = String(badgeColor || '')
  if (raw.includes('linear-gradient')) {
    const hexes = raw.match(/#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []
    return { fromHex: normalizeHex(hexes[0], DEFAULT_FROM), toHex: normalizeHex(hexes[1], DEFAULT_TO) }
  }
  return { fromHex: DEFAULT_FROM, toHex: DEFAULT_TO }
}
