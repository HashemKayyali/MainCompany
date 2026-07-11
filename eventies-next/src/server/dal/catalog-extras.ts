import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Database } from '@/shared/types/database.types'
import { getAnonServerClient } from './anon-client'
import { TAGS, REVALIDATE } from '@/server/cache/tags'

/**
 * DATA-003..006 — remaining public read domains (ADR-23 traditional model).
 * Row-typed reads with tags + TTL backstops. select('*') matches current
 * service behavior; DATA-009 column hygiene is a later task.
 */

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/** DATA-003 — parts byProduct (tagged with product so a product edit invalidates it). */
export const getPartsByProductSlug = unstable_cache(
  async (productSlug: string): Promise<Row<'parts'>[]> => {
    const { data, error } = await getAnonServerClient()
      .from('parts')
      .select('*')
      .eq('product_slug', productSlug)
    if (error) throw error
    return data ?? []
  },
  ['dal:parts:byProduct'],
  { tags: [TAGS.parts], revalidate: REVALIDATE.catalog }
)

/** DATA-004 — custom builds (+categories) */
export const getCustomBuilds = unstable_cache(
  async (): Promise<Row<'custom_builds'>[]> => {
    const { data, error } = await getAnonServerClient().from('custom_builds').select('*')
    if (error) throw error
    return data ?? []
  },
  ['dal:custom_builds:all'],
  { tags: [TAGS.buildsList], revalidate: REVALIDATE.catalog }
)

/** DATA-005 — customers wall (daily profile per 06 registry) */
export const getCustomers = unstable_cache(
  async (): Promise<Row<'customers'>[]> => {
    const { data, error } = await getAnonServerClient().from('customers').select('*')
    if (error) throw error
    return data ?? []
  },
  ['dal:customers:all'],
  { tags: [TAGS.customersList], revalidate: REVALIDATE.daily }
)

/** DATA-006 — gallery albums (list server-side; images stay client-progressive) */
export const getGalleryAlbums = unstable_cache(
  async (): Promise<Row<'gallery_albums'>[]> => {
    const { data, error } = await getAnonServerClient()
      .from('gallery_albums')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
  ['dal:gallery_albums:all'],
  { tags: [TAGS.galleryAlbums], revalidate: REVALIDATE.catalog }
)
