import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
  ogImage?: string
  ogType?: string
  canonical?: string
  noIndex?: boolean
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

/**
 * Sets document title, meta description, Open Graph tags, and canonical URL.
 * Call once per page component.
 *
 * @example
 * usePageMeta({ title: 'Products', description: 'Browse our bike experiences' })
 */
export function usePageMeta({ title, description, ogImage, ogType, canonical, noIndex }: PageMeta) {
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
  }, [title, description, ogImage, ogType, canonical, noIndex])
}
