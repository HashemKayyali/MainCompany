import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Category } from '@/shared/types/catalog'
import { createCategoriesService } from '@/shared/services/categories'
import { getAnonServerClient } from './anon-client'
import { TAGS, REVALIDATE } from '@/server/cache/tags'

/** DATA-002 — categories DAL (cache owner; ADR-23 traditional model). */

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => createCategoriesService(getAnonServerClient()).getAll(),
  ['dal:categories:all'],
  { tags: [TAGS.categories], revalidate: REVALIDATE.catalog }
)

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> =>
    createCategoriesService(getAnonServerClient()).getBySlug(slug),
  ['dal:categories:bySlug'],
  { tags: [TAGS.categories], revalidate: REVALIDATE.catalog }
)
