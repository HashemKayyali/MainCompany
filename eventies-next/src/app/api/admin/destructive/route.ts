import { NextResponse, type NextRequest } from 'next/server'
import { adminDestructiveRequestSchema } from '@/shared/schemas/admin'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getAuthoritativeRole, getVerifiedUser } from '@/server/supabase/session'
import { isTrustedMutationRequest } from '@/server/security/request'
import { authorizeAdminMutation } from '@/server/admin/mutation-contract'
import { revalidateEntity } from '@/server/cache/revalidate'
import { track } from '@/server/observability/track'
import { parseAuthTimeClaim } from '@/server/auth/admin-guard'

export async function POST(request: NextRequest) {
  if (process.env.ADMIN_DESTRUCTIVE_ENABLED !== '1') {
    return NextResponse.json({ ok: false, code: 'ROLLOUT_DISABLED' }, { status: 503 })
  }
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ ok: false, code: 'UNTRUSTED_REQUEST' }, { status: 403 })
  }
  const parsed = adminDestructiveRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, code: 'INVALID' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  if (!user) return NextResponse.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 })
  const role = await getAuthoritativeRole(user.id, supabase)
  const { data: claimData } = await supabase.auth.getClaims()
  const claims = claimData?.claims as { aal?: unknown; auth_time?: unknown } | undefined
  const mutation =
    parsed.data.operation === 'role'
      ? 'role.update'
      : parsed.data.operation === 'admin'
        ? 'admin.remove'
        : 'catalog.delete'
  const decision = authorizeAdminMutation({
    mutation,
    role,
    aal: typeof claims?.aal === 'string' ? claims.aal : null,
    authTimeSeconds: parseAuthTimeClaim(claims?.auth_time),
  })
  if (decision !== 'allow') {
    await track('admin.destructive_denied', { operation: parsed.data.operation, reason: decision })
    return NextResponse.json({ ok: false, code: decision }, { status: 403 })
  }

  let result: { data: unknown; error: { code?: string } | null }
  if (parsed.data.operation === 'product') {
    result = await supabase.rpc('delete_admin_product', {
      target_id: parsed.data.targetId,
      confirmation: parsed.data.confirmation,
    })
  } else if (parsed.data.operation === 'category') {
    result = await supabase.rpc('delete_admin_category', {
      target_id: parsed.data.targetId,
      confirmation: parsed.data.confirmation,
    })
  } else if (parsed.data.operation === 'gallery') {
    result = await supabase.rpc('delete_admin_gallery_album', {
      target_id: parsed.data.targetId,
      confirmation: parsed.data.confirmation,
    })
  } else if (parsed.data.operation === 'custom_build') {
    result = await supabase.rpc('delete_admin_custom_build', {
      target_id: parsed.data.targetId,
      confirmation: parsed.data.confirmation,
    })
  } else if (parsed.data.operation === 'bulk') {
    result = await supabase.rpc('bulk_delete_admin_entities', {
      entity_type: parsed.data.entity,
      target_ids: [...new Set(parsed.data.targetIds)],
      confirmation: parsed.data.confirmation,
    })
  } else if (parsed.data.operation === 'role') {
    result = await supabase.rpc('set_admin_role', {
      target_id: parsed.data.targetId,
      new_role: parsed.data.newRole,
    })
  } else {
    result = await supabase.rpc('remove_admin', { target_id: parsed.data.targetId })
  }

  if (result.error) {
    await track('admin.destructive_failed', {
      operation: parsed.data.operation,
      code: result.error.code ?? 'unknown',
    })
    return NextResponse.json({ ok: false, code: 'MUTATION_FAILED' }, { status: 409 })
  }

  let revalidation: { ok: true; tags: string[] } | { ok: false; pending: true } = {
    ok: true,
    tags: [],
  }
  const cacheEntity =
    parsed.data.operation === 'bulk'
      ? parsed.data.entity === 'custom_build'
        ? 'build'
        : parsed.data.entity
      : parsed.data.operation === 'custom_build'
        ? 'build'
        : parsed.data.operation === 'product' ||
            parsed.data.operation === 'category' ||
            parsed.data.operation === 'gallery'
          ? parsed.data.operation
          : null
  if (cacheEntity) {
    try {
      const tags = revalidateEntity(cacheEntity)
      revalidation = { ok: true, tags }
    } catch {
      await track('revalidate.failed', { operation: parsed.data.operation })
      revalidation = { ok: false, pending: true }
    }
  }
  return NextResponse.json({ ok: true, result: result.data, revalidation })
}
