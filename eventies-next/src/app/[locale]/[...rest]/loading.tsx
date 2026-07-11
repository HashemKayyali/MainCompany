/**
 * Suspense boundary for the catch-all segment: under cacheComponents the
 * page's `params` access is dynamic and must sit below a boundary. Renders
 * nothing — the segment's only job is to throw notFound().
 */
export default function CatchAllLoading() {
  return null
}
