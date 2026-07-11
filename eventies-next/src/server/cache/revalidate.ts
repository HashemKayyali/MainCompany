import 'server-only'

import { revalidateTag } from 'next/cache'
import { invalidationSet } from './tags'

/**
 * FOUND-020 — invalidation helper. ADR-23 traditional model: `revalidateTag(tag)`
 * invalidates the unstable_cache entries carrying that tag, giving admin-edited
 * entities fresh-on-next-request semantics (06 §Cache model). The DAL's
 * `revalidate` TTL is the self-heal backstop for any missed call.
 */
export function revalidateEntity(
  entity: Parameters<typeof invalidationSet>[0],
  slug?: string
): string[] {
  const tags = invalidationSet(entity, slug)
  // Two-arg form (Next 16); { expire: 0 } = purge now → fresh on next request.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  return tags
}
