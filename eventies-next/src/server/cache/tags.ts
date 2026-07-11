import 'server-only'

/**
 * FOUND-020 — THE single source of cache tag names (06 §Tag naming).
 * String duplication of these anywhere else is a review-blocking violation.
 */
export const TAGS = {
  products: 'catalog:products',
  product: (slug: string) => `catalog:product:${slug}`,
  categories: 'catalog:categories',
  category: (slug: string) => `catalog:category:${slug}`,
  parts: 'catalog:parts',
  buildsList: 'builds:list',
  buildsCategories: 'builds:categories',
  customersList: 'customers:list',
  galleryAlbums: 'gallery:albums',
  homeContent: 'home:content',
  legal: (doc: string) => `legal:${doc}`,
} as const

/**
 * TTL backstops (seconds) for unstable_cache `revalidate` — ADR-23 traditional
 * model. Same intent as the former cacheLife profiles (catalog ≈1h, daily
 * ≈24h): a missed tag invalidation self-heals within the window (06 §Hard
 * rule 2 / ADR-07).
 */
export const REVALIDATE = {
  catalog: 3600,
  daily: 86400,
} as const

/**
 * 06 §Hard rule 5 — invalidation graph. Given an entity mutation, these are
 * the tags that must fan out.
 */
export function invalidationSet(
  entity: 'product' | 'category' | 'gallery' | 'build' | 'customer' | 'part',
  slug?: string
): string[] {
  switch (entity) {
    case 'product':
      return [...(slug ? [TAGS.product(slug)] : []), TAGS.products, TAGS.homeContent]
    case 'category':
      return [
        ...(slug ? [TAGS.category(slug)] : []),
        TAGS.categories,
        TAGS.products,
        TAGS.homeContent,
      ]
    case 'gallery':
      return [TAGS.galleryAlbums, TAGS.homeContent]
    case 'build':
      return [TAGS.buildsList, TAGS.buildsCategories, TAGS.homeContent]
    case 'customer':
      return [TAGS.customersList, TAGS.homeContent]
    case 'part':
      return [TAGS.parts, ...(slug ? [TAGS.product(slug)] : [])]
  }
}
