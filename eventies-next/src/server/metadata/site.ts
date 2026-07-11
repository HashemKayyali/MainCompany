import 'server-only'

/**
 * SEO-001 constants — the field-for-field parity anchors, transcribed from the
 * audited prerender script (scripts/prerender-seo.mjs). Changing any of these
 * is an SEO parity delta and must be reflected in the SEO-013 diff report.
 */
export const SITE_URL = 'https://www.eventiesjo.com'
export const SITE_NAME = 'Eventies'
// P0 BASE-017/IMG-012: the compressed 1200×630 JPEG replaced the 1.5 MB PNG.
export const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`
export const DEFAULT_IMAGE_ALT =
  'Eventies event services and trusted providers marketplace in Jordan'
export const DEFAULT_IMAGE_WIDTH = 1200
export const DEFAULT_IMAGE_HEIGHT = 630
export const BRAND_LOGO_ABSOLUTE = `${SITE_URL}/brand/eventies_icon_transparent_master.png`
export const ORG_EMAIL = 'info@eventiesjo.com'

/** og:locale value per app locale (prerender emitted en_JO for English). */
export const OG_LOCALE: Record<string, string> = {
  en: 'en_JO',
  ar: 'ar_JO',
}

/** Absolute https URL or undefined — mirrors normalizePublicHttpsUrl. */
export function normalizePublicHttpsUrl(value: string | null | undefined): string | undefined {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return undefined
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') return undefined
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

export function normalizeText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}
