import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { Database } from '@/shared/types/database.types'
import { getAnonServerClient } from './anon-client'
import { TAGS, CACHE_PROFILES } from '@/server/cache/tags'

/**
 * DATA-003..007 — P1 scaffolds for the remaining public read domains.
 * Row-typed reads with tags + TTL backstops wired per 06; the app-type
 * mappings (dbToApp) join in P2 with their pages (sanctioned carry-over:
 * "implementations may carry into P2 where page-coupled"). select('*')
 * matches current service behavior; DATA-009 column hygiene is a P2 task.
 */

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/** DATA-003 — parts byProduct */
export async function getPartsByProductSlug(productSlug: string): Promise<Row<'parts'>[]> {
  'use cache'
  cacheTag(TAGS.parts, TAGS.product(productSlug))
  cacheLife(CACHE_PROFILES.catalog)
  const { data, error } = await getAnonServerClient()
    .from('parts')
    .select('*')
    .eq('product_slug', productSlug)
  if (error) throw error
  return data ?? []
}

/** DATA-004 — custom builds (+categories) */
export async function getCustomBuilds(): Promise<Row<'custom_builds'>[]> {
  'use cache'
  cacheTag(TAGS.buildsList)
  cacheLife(CACHE_PROFILES.catalog)
  const { data, error } = await getAnonServerClient().from('custom_builds').select('*')
  if (error) throw error
  return data ?? []
}

/** DATA-005 — customers wall (daily profile per 06 registry) */
export async function getCustomers(): Promise<Row<'customers'>[]> {
  'use cache'
  cacheTag(TAGS.customersList)
  cacheLife(CACHE_PROFILES.daily)
  const { data, error } = await getAnonServerClient().from('customers').select('*')
  if (error) throw error
  return data ?? []
}

/** DATA-006 — gallery albums (list server-side; images stay client-progressive) */
export async function getGalleryAlbums(): Promise<Row<'gallery_albums'>[]> {
  'use cache'
  cacheTag(TAGS.galleryAlbums)
  cacheLife(CACHE_PROFILES.catalog)
  const { data, error } = await getAnonServerClient()
    .from('gallery_albums')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
