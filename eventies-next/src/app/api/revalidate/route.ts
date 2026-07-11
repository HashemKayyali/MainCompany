import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getSessionClaims, getAuthoritativeRole } from '@/server/supabase/session'
import { revalidateEntity } from '@/server/cache/revalidate'
import { track } from '@/server/observability/track'

/**
 * FOUND-021 — /api/revalidate: tag revalidation behind a real authorization
 * check (Constitution §3: this handler is the trusted boundary for the
 * cross-system rule "who may flush public caches").
 *
 * CSRF posture (05 §CSRF): cookie-authed → accepts JSON only; Origin /
 * Sec-Fetch-Site verified when present.
 */

const VALID_ENTITIES = ['product', 'category', 'gallery', 'build', 'customer', 'part'] as const
type Entity = (typeof VALID_ENTITIES)[number]

function isCrossSite(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'same-site') return true
  const origin = request.headers.get('origin')
  if (origin) {
    const host = request.headers.get('host')
    try {
      if (host && new URL(origin).host !== host) return true
    } catch {
      return true
    }
  }
  return false
}

export async function POST(request: NextRequest) {
  if (isCrossSite(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'json only' }, { status: 415 })
  }

  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const role = await getAuthoritativeRole(identity.userId, supabase)
  if (role !== 'admin' && role !== 'superadmin') {
    await track('revalidate.denied', { role: role ?? 'none' })
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: { entity?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const entity = body.entity as Entity | undefined
  if (!entity || !VALID_ENTITIES.includes(entity)) {
    return NextResponse.json({ error: 'unknown entity' }, { status: 400 })
  }

  try {
    const tags = revalidateEntity(entity, typeof body.slug === 'string' ? body.slug : undefined)
    await track('revalidate.succeeded', { entity, tagCount: tags.length })
    return NextResponse.json({ revalidated: tags })
  } catch (error) {
    // 06 §Hard rule 4: failure is surfaced, evented, retryable — never silent.
    await track('revalidate.failed', { entity, message: error instanceof Error ? error.message : 'unknown' })
    return NextResponse.json({ error: 'revalidation failed' }, { status: 500 })
  }
}
