import { notFound } from 'next/navigation'

/**
 * Catch-all: any unknown path inside a valid locale renders the localized
 * not-found page with a REAL HTTP 404 status (SEO-404 groundwork).
 *
 * Deliberately touches NO dynamic data (no params/cookies): the segment
 * prerenders statically, so the 404 status is decided before streaming —
 * a dynamic notFound() inside a Suspense hole would ship a 200 shell first.
 * Localization comes from the [locale] layout's client provider.
 */
export default function CatchAllPage() {
  notFound()
}
