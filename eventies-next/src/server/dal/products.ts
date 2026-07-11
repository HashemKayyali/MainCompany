import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Product } from '@/shared/types/catalog'
import { createProductsService } from '@/shared/services/products'
import { getAnonServerClient } from './anon-client'
import { TAGS, REVALIDATE } from '@/server/cache/tags'

/**
 * DATA-001 — products DAL: the ONLY cache owner for the products domain
 * (ADR-23 traditional model). unstable_cache attaches the tag registry + a TTL
 * backstop; revalidateTag(tag) invalidates on admin mutation. A cookie-less
 * anon client keeps these reads out of any session scope (QG-ARCH-3).
 */

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => createProductsService(getAnonServerClient()).getAll(),
  ['dal:products:all'],
  { tags: [TAGS.products], revalidate: REVALIDATE.catalog }
)

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> =>
    createProductsService(getAnonServerClient()).getBySlug(slug),
  ['dal:products:bySlug'],
  { tags: [TAGS.products], revalidate: REVALIDATE.catalog }
)

export const getFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const all = await createProductsService(getAnonServerClient()).getAll()
    return all.filter((p) => p.featured)
  },
  ['dal:products:featured'],
  { tags: [TAGS.products, TAGS.homeContent], revalidate: REVALIDATE.catalog }
)
