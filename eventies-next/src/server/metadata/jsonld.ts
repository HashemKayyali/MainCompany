import 'server-only'

import type { Product, Category } from '@/shared/types/catalog'
import { SITE_URL, SITE_NAME, BRAND_LOGO_ABSOLUTE, ORG_EMAIL, normalizeText } from './site'

/**
 * JSON-LD builders (SEO-005/006/007/016), verbatim shapes from the audited
 * prerender. Global Organization + WebSite render on every page; ItemList /
 * CollectionPage on listings; Product on detail.
 *
 * OQ-1 (offers semantics) is UNRESOLVED, so per 11_SEO_CONSTITUTION §JSON-LD
 * the Product node ships WITHOUT `offers` — "ship Product without offers
 * rather than misleading schema." This is a deliberate, constitution-approved
 * delta from the Vite prerender (which emitted offers on priced products);
 * recorded in the SEO-014 parity report.
 */

export const GLOBAL_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: ORG_EMAIL,
    logo: BRAND_LOGO_ABSOLUTE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
]

export function productJsonLd(product: Product, canonical: string, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription || '',
    url: canonical,
    ...(image ? { image } : {}),
    // offers intentionally omitted (OQ-1 unresolved — see file header).
  }
}

export function categoryJsonLd(
  category: Category,
  canonical: string,
  products: Pick<Product, 'name' | 'slug'>[],
  image?: string
) {
  const name = `${normalizeText(category.name)} Event Services in Jordan`
  const itemListId = `${canonical}#item-list`
  const description =
    normalizeText(category.description) ||
    `Browse ${normalizeText(category.name)} event services, rentals, and experiences in Jordan through Eventies.`
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      url: canonical,
      ...(image ? { image } : {}),
      mainEntity: { '@id': itemListId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': itemListId,
      name,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
      })),
    },
  ]
}

export function itemListJsonLd(
  canonical: string,
  name: string,
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: canonical,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  }
}

/** SEO-016 — BreadcrumbList for category→product paths. */
export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}
