/**
 * Media invariants for the Product editor.
 *
 * Centralized here so the enforcement rule can be unit-tested in
 * isolation from React state. Keep the surface tiny — a single
 * source of truth for "what does a persisted product's media set
 * look like".
 */

export interface ProductMediaShape {
  heroImage?: string
  gallery?: string[]
  videoUrl?: string
}

/**
 * Product hero invariant.
 *
 * Rule: `heroImage === gallery[0] || ''`.
 *
 * Enforced BEFORE persistence so a stale hero URL can never be
 * written to the database once the gallery is empty. This makes the
 * dangerous state
 *
 *     gallery = []
 *     heroImage = <some-old-image-that-was-removed>
 *
 * unrepresentable in DB output. Legacy heroes (where the persisted
 * `heroImage` did not match `gallery[0]`) are preserved in the
 * session's ORIGINAL set — see `collectProductMediaRefs` — so the
 * session's commit diff can reconcile them safely.
 */
export function enforceHeroInvariant(gallery: string[]): string {
  return gallery[0] || ''
}

/**
 * Collect every canonical media reference a product carries. Used at
 * two moments:
 *
 *   1. When the editor opens, to seed the session's original set —
 *      this ensures a legacy `heroImage` that doesn't match
 *      `gallery[0]` is still tracked as a reconcilable original.
 *   2. When the entity is deleted, to feed `deleteAssetsSafely` with
 *      the complete media set that the DB row was pointing at.
 *
 * Duplicates (e.g. `heroImage === gallery[0]`) are NOT removed here —
 * the session's canonical dedup handles that at cleanup time.
 */
export function collectProductMediaRefs(product: ProductMediaShape): string[] {
  const refs: string[] = []
  if (product.heroImage) refs.push(product.heroImage)
  if (product.gallery) refs.push(...product.gallery)
  if (product.videoUrl) refs.push(product.videoUrl)
  return refs
}
