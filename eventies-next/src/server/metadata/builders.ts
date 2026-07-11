import 'server-only'

import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import type { Product, Category } from '@/shared/types/catalog'
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_HEIGHT,
  OG_LOCALE,
  normalizePublicHttpsUrl,
  normalizeText,
} from './site'

/**
 * SEO-001 — the single typed metadata builder (11_SEO_CONSTITUTION). Every
 * route's generateMetadata composes its fields here so title/description/
 * canonical/robots/OG/Twitter stay field-for-field parity with the audited
 * prerender output, and hreflang/canonical are locale-correct (SEO-011,
 * I18N-002): EN at unprefixed URLs, AR under /ar (ADR-03).
 */

export interface MetaInput {
  locale: string
  /** Route path WITHOUT locale prefix, e.g. '/products/foo' or '/' */
  path: string
  title: string
  description: string
  type?: 'website' | 'product' | 'article'
  image?: string
  imageAlt?: string
  /** noindex,nofollow for private/auth routes (SEO-010). */
  noindex?: boolean
}

/** Absolute URL for a locale + unprefixed path (EN unprefixed, AR under /ar). */
export function localeUrl(locale: string, path: string): string {
  const clean = path === '/' ? '' : path
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  const joined = `${prefix}${clean}` || '/'
  return `${SITE_URL}${joined === '/' ? '/' : joined}`
}

/** hreflang alternates: en + ar + x-default (08 §Metadata). */
function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const l of routing.locales) out[l] = localeUrl(l, path)
  out['x-default'] = localeUrl(routing.defaultLocale, path)
  return out
}

export function buildMetadata(input: MetaInput): Metadata {
  const { locale, path, title, description } = input
  const type = input.type ?? 'website'
  const image = normalizePublicHttpsUrl(input.image) ?? DEFAULT_IMAGE
  const imageAlt = input.imageAlt || DEFAULT_IMAGE_ALT
  const canonical = localeUrl(locale, path)
  const ogLocale = OG_LOCALE[locale] ?? OG_LOCALE.en
  const alternateLocales = routing.locales
    .filter((l) => l !== locale)
    .map((l) => OG_LOCALE[l])
    .filter((v): v is string => Boolean(v))

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: type === 'product' ? 'website' : type, // Next OG type union lacks 'product'; raw tag added below
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: image,
          secureUrl: image,
          alt: imageAlt,
          width: DEFAULT_IMAGE_WIDTH,
          height: DEFAULT_IMAGE_HEIGHT,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
    // og:type=product parity for detail pages (Next's typed OG omits it).
    ...(type === 'product' ? { other: { 'og:type': 'product' } } : {}),
  }
}

// ---- Per-domain field formulas (verbatim from prerender productToMeta / categoryToMeta) ----

export function productMeta(locale: string, product: Product): MetaInput {
  const title = `${product.name} for Events in Jordan | Eventies`
  const description = `Request ${product.name} for corporate events, exhibitions, schools, malls, celebrations, and activations across Jordan.`
  const galleryImage = (product.gallery ?? []).map(normalizePublicHttpsUrl).find(Boolean)
  const image = galleryImage ?? normalizePublicHttpsUrl(product.heroImage) ?? DEFAULT_IMAGE
  return {
    locale,
    path: `/products/${encodeURIComponent(product.slug)}`,
    title,
    description,
    type: 'product',
    image,
    imageAlt: `${product.name} service for events in Jordan`,
  }
}

export function categoryMeta(locale: string, category: Category): MetaInput {
  const name = normalizeText(category.name)
  const title = `${name} Event Services in Jordan | Eventies`
  const description =
    normalizeText(category.description) ||
    `Browse ${name} event services, rentals, and experiences in Jordan through Eventies.`
  return {
    locale,
    path: `/categories/${encodeURIComponent(category.slug)}`,
    title,
    description,
    type: 'website',
    image: normalizePublicHttpsUrl(category.image) ?? DEFAULT_IMAGE,
    imageAlt: `${name} event services in Jordan`,
  }
}
