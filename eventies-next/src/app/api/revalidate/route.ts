import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getSessionClaims, getAuthoritativeRole } from '@/server/supabase/session'
import { revalidateEntity } from '@/server/cache/revalidate'
import { track } from '@/server/observability/track'
import { isTrustedMutationRequest } from '@/server/security/request'
import { hasAdminPermission } from '@/server/admin/permissions'
import {
  buildAdminAuditRecord,
  correlationIdFromHeaders,
  writeAdminAudit,
} from '@/server/admin/audit'

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

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    const json = request.headers.get('content-type')?.includes('application/json')
    return NextResponse.json(
      { error: json ? 'forbidden' : 'json only' },
      { status: json ? 403 : 415 }
    )
  }

  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const role = await getAuthoritativeRole(identity.userId, supabase)
  if (!hasAdminPermission(role, 'cache.revalidate')) {
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

    // Tag invalidation refreshes the shared data cache. The localized layout
    // invalidation also purges the public Full Route Cache so already-rendered
    // EN/AR pages cannot continue serving pre-mutation HTML.
    const invalidatedLayouts = ['en', 'ar'] as const
    for (const locale of invalidatedLayouts) {
      revalidatePath(`/${locale}`, 'layout')
    }
    await writeAdminAudit(
      buildAdminAuditRecord({
        actorId: identity.userId,
        actorRole: role,
        operation: 'cache_revalidated',
        targetType: entity,
        targetId: typeof body.slug === 'string' ? body.slug : entity,
        result: 'succeeded',
        correlationId: correlationIdFromHeaders(request.headers),
        metadata: { tagCount: tags.length },
      })
    )
    return NextResponse.json({ revalidated: tags })
  } catch (error) {
    // 06 §Hard rule 4: failure is surfaced, evented, retryable — never silent.
    await track('revalidate.failed', {
      entity,
      message: error instanceof Error ? error.message : 'unknown',
    })
    await writeAdminAudit(
      buildAdminAuditRecord({
        actorId: identity.userId,
        actorRole: role,
        operation: 'cache_revalidated',
        targetType: entity,
        targetId: typeof body.slug === 'string' ? body.slug : entity,
        result: 'failed',
        correlationId: correlationIdFromHeaders(request.headers),
        metadata: { reason: error instanceof Error ? error.message : 'unknown' },
      })
    )
    return NextResponse.json({ error: 'revalidation failed' }, { status: 500 })
  }
}
