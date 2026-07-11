import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { Product } from '@/shared/types/catalog'
import { createProductsService } from '@/shared/services/products'
import { getAnonServerClient } from './anon-client'
import { TAGS, CACHE_PROFILES } from '@/server/cache/tags'

/**
 * DATA-001 — products DAL: the ONLY cache owner for the products domain
 * (06 §Cache model / ADR-19). 'use cache' + cacheTag inside the function;
 * profiles named once in next.config.
 */

export async function getProducts(): Promise<Product[]> {
  'use cache'
  cacheTag(TAGS.products)
  cacheLife(CACHE_PROFILES.catalog)
  return createProductsService(getAnonServerClient()).getAll()
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  'use cache'
  cacheTag(TAGS.product(slug), TAGS.products)
  cacheLife(CACHE_PROFILES.catalog)
  return createProductsService(getAnonServerClient()).getBySlug(slug)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  'use cache'
  cacheTag(TAGS.products, TAGS.homeContent)
  cacheLife(CACHE_PROFILES.catalog)
  const all = await createProductsService(getAnonServerClient()).getAll()
  return all.filter((p) => p.featured)
}
