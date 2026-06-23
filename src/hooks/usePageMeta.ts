import { useEffect } from 'react'

type JsonLdInput = Record<string, unknown> | Array<Record<string, unknown>>

interface PageMeta {
  title: string
  description?: string
  canonical?: string
  image?: string
  imageAlt?: string
  type?: string
  noIndex?: boolean
  /** JSON-LD structured data object or array */
  jsonLd?: JsonLdInput
  /** Backwards-compatible aliases for existing callers. */
  ogImage?: string
  ogType?: string
}

const SITE_NAME = 'Eventies'
const SITE_URL = 'https://www.eventiesjo.com'
const DEFAULT_TITLE = 'Event Services & Vendors in Jordan | Eventies'
const DEFAULT_DESC =
  'Discover venues, photographers, catering, booths, equipment, entertainment, and trusted event vendors across Jordan with Eventies.'
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.png`
const DEFAULT_IMAGE_ALT = 'Eventies event services and vendors marketplace in Jordan'
const DEFAULT_IMAGE_WIDTH = '1200'
const DEFAULT_IMAGE_HEIGHT = '630'
const DEFAULT_LOCALE = 'en_JO'

const GLOBAL_JSON_LD: Array<Record<string, unknown>> = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'info@eventiesjo.com',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
]

function getFullTitle(title: string) {
  if (!title.trim()) return DEFAULT_TITLE
  if (title.includes(SITE_NAME)) return title
  return `${title} | ${SITE_NAME}`
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(name: string, attr: 'name' | 'property' = 'name') {
  document.querySelectorAll(`meta[${attr}="${name}"]`).forEach(el => el.remove())
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeLink(rel: string) {
  document.querySelectorAll(`link[rel="${rel}"]`).forEach(el => el.remove())
}

function normalizeAbsoluteUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  try {
    const url = new URL(trimmed, SITE_URL)
    if (url.protocol !== 'https:') return undefined
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

function normalizeCanonicalUrl(value?: string) {
  const normalized = normalizeAbsoluteUrl(value)
  if (!normalized) return undefined

  const url = new URL(normalized)
  url.search = ''
  url.hash = ''
  return url.toString()
}

function getCurrentPageUrl() {
  if (typeof window === 'undefined') return SITE_URL

  const url = new URL(window.location.pathname || '/', SITE_URL)
  return url.toString()
}

function setJsonLd(data: Array<Record<string, unknown>>) {
  document.querySelectorAll('script[data-page-jsonld]').forEach(el => el.remove())

  data.forEach((item, index) => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-page-jsonld', String(index))
    el.textContent = JSON.stringify(item)
    document.head.appendChild(el)
  })
}

function toJsonLdArray(jsonLd?: JsonLdInput) {
  if (!jsonLd) return []
  return Array.isArray(jsonLd) ? jsonLd : [jsonLd]
}

/**
 * Sets document title, meta description, canonical URL, Open Graph tags,
 * Twitter card tags, robots directives, and JSON-LD structured data.
 */
export function usePageMeta({
  title,
  description,
  canonical,
  image,
  imageAlt,
  type,
  noIndex,
  jsonLd,
  ogImage,
  ogType,
}: PageMeta) {
  useEffect(() => {
    const fullTitle = getFullTitle(title)
    const desc = description || DEFAULT_DESC
    const canonicalUrl = normalizeCanonicalUrl(canonical)
    const pageUrl = canonicalUrl || getCurrentPageUrl()
    const socialImage = normalizeAbsoluteUrl(image || ogImage) || DEFAULT_IMAGE
    const socialImageAlt = imageAlt || DEFAULT_IMAGE_ALT
    const pageType = type || ogType || 'website'

    document.title = fullTitle
    setMeta('description', desc)

    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('og:url', pageUrl, 'property')
    setMeta('og:type', pageType, 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:image', socialImage, 'property')
    setMeta('og:image:secure_url', socialImage, 'property')
    setMeta('og:image:alt', socialImageAlt, 'property')
    setMeta('og:image:width', DEFAULT_IMAGE_WIDTH, 'property')
    setMeta('og:image:height', DEFAULT_IMAGE_HEIGHT, 'property')
    setMeta('og:locale', DEFAULT_LOCALE, 'property')

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    setMeta('twitter:image', socialImage)
    setMeta('twitter:image:alt', socialImageAlt)

    // Do not add twitter:site unless Eventies has a real X account.
    removeMeta('twitter:site')

    if (canonicalUrl) {
      setLink('canonical', canonicalUrl)
    } else {
      removeLink('canonical')
    }

    if (noIndex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      removeMeta('robots')
    }

    setJsonLd([...GLOBAL_JSON_LD, ...toJsonLdArray(jsonLd)])

    return () => {
      document.querySelectorAll('script[data-page-jsonld]').forEach(el => el.remove())
    }
  }, [
    title,
    description,
    canonical,
    image,
    imageAlt,
    type,
    noIndex,
    jsonLd,
    ogImage,
    ogType,
  ])
}
