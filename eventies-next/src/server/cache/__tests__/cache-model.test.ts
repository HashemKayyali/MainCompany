import { describe, expect, it, vi, beforeAll } from 'vitest'

/**
 * CACHE-005 — CACHE-MODEL conformance suite (ADR-23 traditional model).
 * Asserts the invariants that keep catalog caching correct:
 *  1. every catalog DAL read attaches the RIGHT tag(s) to unstable_cache;
 *  2. an admin mutation fans out to the FULL invalidation set (06 §graph)
 *     and calls revalidateTag with the fresh-on-next-request form;
 *  3. the tag registry is the single source (no duplicated tag strings).
 * The DAL's `revalidate` TTL backstop is a config value asserted in tags.ts.
 */

const calls = vi.hoisted(() => ({
  unstable_cache: [] as Array<{ keys: string[]; opts: { tags: string[]; revalidate: number } }>,
  revalidateTag: [] as Array<[string, unknown]>,
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: unknown, keys: string[], opts: { tags: string[]; revalidate: number }) => {
    calls.unstable_cache.push({ keys, opts })
    return fn
  },
  revalidateTag: (tag: string, profile?: unknown) => {
    calls.revalidateTag.push([tag, profile])
  },
}))

vi.mock('../../dal/anon-client', () => ({ getAnonServerClient: () => ({}) }))
vi.mock('server-only', () => ({}))

import { TAGS, REVALIDATE } from '../tags'
import { invalidationSet } from '../tags'

// Import every cached DAL ONCE so all unstable_cache registrations are captured
// (module import is cached — re-importing per test records nothing).
beforeAll(async () => {
  await import('../../dal/products')
  await import('../../dal/categories')
  await import('../../dal/catalog-extras')
})

describe('CACHE-005: DAL cache-tag attachment', () => {
  const find = (key: string) => calls.unstable_cache.find((c) => c.keys[0] === key)

  it('products DAL attaches catalog:products with a catalog TTL', () => {
    const read = find('dal:products:all')
    expect(read?.opts.tags).toContain(TAGS.products)
    expect(read?.opts.revalidate).toBe(REVALIDATE.catalog)
  })

  it('featured products also tag home:content (home fan-in)', () => {
    const featured = find('dal:products:featured')
    expect(featured?.opts.tags).toEqual(expect.arrayContaining([TAGS.products, TAGS.homeContent]))
  })

  it('customers use the daily TTL (per 06 registry), not catalog', () => {
    const customers = find('dal:customers:all')
    expect(customers?.opts.revalidate).toBe(REVALIDATE.daily)
  })
})

describe('CACHE-005: invalidation graph (06 §Hard rule 5)', () => {
  it('a product edit fans out to product:{slug}, products, and home', () => {
    const tags = invalidationSet('product', 'vr-booth')
    expect(tags).toEqual(
      expect.arrayContaining([TAGS.product('vr-booth'), TAGS.products, TAGS.homeContent])
    )
  })

  it('a category edit fans out to category, categories, products, and home', () => {
    const tags = invalidationSet('category', 'screens')
    expect(tags).toEqual(
      expect.arrayContaining([
        TAGS.category('screens'),
        TAGS.categories,
        TAGS.products,
        TAGS.homeContent,
      ])
    )
  })

  it('revalidateEntity purges each tag with the fresh-on-next-request form', async () => {
    calls.revalidateTag.length = 0
    const { revalidateEntity } = await import('../revalidate')
    const tags = revalidateEntity('gallery')
    expect(tags).toEqual(expect.arrayContaining([TAGS.galleryAlbums, TAGS.homeContent]))
    // every tag was passed to revalidateTag with { expire: 0 } (immediate purge)
    for (const tag of tags) {
      expect(calls.revalidateTag).toContainEqual([tag, { expire: 0 }])
    }
  })
})

describe('CACHE-005: single-source tag registry', () => {
  it('tag builders are pure and slug-scoped', () => {
    expect(TAGS.product('a')).toBe('catalog:product:a')
    expect(TAGS.category('b')).toBe('catalog:category:b')
    expect(TAGS.products).toBe('catalog:products')
  })
})
