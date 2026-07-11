import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { Category } from '@/shared/types/catalog'
import { createCategoriesService } from '@/shared/services/categories'
import { getAnonServerClient } from './anon-client'
import { TAGS, CACHE_PROFILES } from '@/server/cache/tags'

/** DATA-002 — categories DAL (cache owner for the categories domain). */

export async function getCategories(): Promise<Category[]> {
  'use cache'
  cacheTag(TAGS.categories)
  cacheLife(CACHE_PROFILES.catalog)
  return createCategoriesService(getAnonServerClient()).getAll()
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  'use cache'
  cacheTag(TAGS.category(slug), TAGS.categories)
  cacheLife(CACHE_PROFILES.catalog)
  return createCategoriesService(getAnonServerClient()).getBySlug(slug)
}
