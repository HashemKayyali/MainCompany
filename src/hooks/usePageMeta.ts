import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
  ogImage?: string
  ogType?: string
  canonical?: string
  noIndex?: boolean
  /** JSON-LD structured data object */
  jsonLd?: Record<string, unknown>
}

const SITE_NAME = 'Bike Land'
const DEFAULT_DESC =
  'Interactive bike-powered activations for events — LED races, smoothie bikes, VR cycling and more across Jordan.'

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
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

function setJsonLd(data: Record<string, unknown>) {
  let el = document.querySelector<HTMLScriptElement>('script[data-page-jsonld]')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-page-jsonld', 'true')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Sets document title, meta description, Open Graph tags, Twitter cards,
 * canonical URL, and JSON-LD structured data.
 *
 * @example
 * usePageMeta({ title: 'Products', description: 'Browse our bike experiences' })
 */
export function usePageMeta({ title, description, ogImage, ogType, canonical, noIndex, jsonLd }: PageMeta) {
  useEffect(() => {
    // Title
    const fullTitle = title === 'Home' ? SITE_NAME : `${title} — ${SITE_NAME}`
    document.title = fullTitle

    // Description
    const desc = description || DEFAULT_DESC
    setMeta('description', desc)

    // Open Graph
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', desc, 'property')
    setMeta('og:type', ogType || 'website', 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    // ✅ Always set og:url
    setMeta('og:url', window.location.href, 'property')

    if (ogImage) {
      setMeta('og:image', ogImage, 'property')
    }

    // Twitter
    setMeta('twitter:card', ogImage ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)

    // Canonical
    if (canonical) {
      setLink('canonical', canonical)
    } else {
      const el = document.querySelector('link[rel="canonical"]')
      if (el) el.remove()
    }

    // Robots
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      const el = document.querySelector('meta[name="robots"]')
      if (el) el.remove()
    }

    // ✅ JSON-LD Structured Data
    if (jsonLd) {
      setJsonLd(jsonLd)
    } else {
      // Default Organization schema
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        description: DEFAULT_DESC,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Amman',
          addressCountry: 'JO',
        },
      })
    }

    return () => {
      // Cleanup JSON-LD on unmount (new page will set its own)
      const el = document.querySelector('script[data-page-jsonld]')
      if (el) el.remove()
    }
  }, [title, description, ogImage, ogType, canonical, noIndex, jsonLd])
}
