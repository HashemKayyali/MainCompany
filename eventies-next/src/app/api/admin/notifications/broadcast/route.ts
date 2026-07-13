import { NextResponse, type NextRequest } from 'next/server'
import { adminNotificationSchema } from '@/shared/schemas/admin'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getAuthoritativeRole, getVerifiedUser } from '@/server/supabase/session'
import { isTrustedMutationRequest } from '@/server/security/request'
import { authorizeAdminMutation } from '@/server/admin/mutation-contract'
import { track } from '@/server/observability/track'
import { parseAuthTimeClaim } from '@/server/auth/admin-guard'

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ ok: false, code: 'UNTRUSTED_REQUEST' }, { status: 403 })
  }
  const parsed = adminNotificationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, code: 'INVALID' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  if (!user) return NextResponse.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 })
  const role = await getAuthoritativeRole(user.id, supabase)
  const { data: claimData } = await supabase.auth.getClaims()
  const claims = claimData?.claims as { aal?: unknown; auth_time?: unknown } | undefined
  const decision = authorizeAdminMutation({
    mutation: 'notification.broadcast',
    role,
    aal: typeof claims?.aal === 'string' ? claims.aal : null,
    authTimeSeconds: parseAuthTimeClaim(claims?.auth_time),
  })
  if (decision !== 'allow') {
    await track('admin.broadcast_denied', { reason: decision })
    return NextResponse.json({ ok: false, code: decision }, { status: 403 })
  }
  const { data, error } = await supabase.rpc('send_custom_notification_idempotent', {
    p_title: parsed.data.title,
    p_message: parsed.data.message,
    p_clients: parsed.data.audience.clients,
    p_admins: parsed.data.audience.admins,
    p_superadmins: parsed.data.audience.superadmins,
    p_target_url: parsed.data.targetUrl ?? null,
    p_type: 'custom',
    p_idempotency_key: parsed.data.idempotencyKey,
  })
  if (error) return NextResponse.json({ ok: false, code: 'BROADCAST_FAILED' }, { status: 409 })
  return NextResponse.json({ ok: true, result: data })
}
