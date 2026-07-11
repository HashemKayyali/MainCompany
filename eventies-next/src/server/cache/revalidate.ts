import 'server-only'

import { revalidateTag } from 'next/cache'
import { invalidationSet } from './tags'

/**
 * FOUND-020 — invalidation helper. ADR-19: the two-argument, non-deprecated
 * `revalidateTag(tag, profile)` form ONLY (single-argument form is banned —
 * see VERSION_LOCK.md). Admin-edited entities get fresh-on-next-request
 * semantics via the expire-now object form.
 */
export function revalidateEntity(
  entity: Parameters<typeof invalidationSet>[0],
  slug?: string
): string[] {
  const tags = invalidationSet(entity, slug)
  for (const tag of tags) {
    // Admin mutations require fresh-on-next-request (06 §Cache model):
    // expire immediately rather than stale-while-revalidate.
    revalidateTag(tag, { expire: 0 })
  }
  return tags
}
