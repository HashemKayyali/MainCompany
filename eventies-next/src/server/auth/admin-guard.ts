import 'server-only'

import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getAuthoritativeRole, getVerifiedUser } from '@/server/supabase/session'

export type AdminRole = 'admin' | 'superadmin'
export type MfaRollout = 'off' | 'superadmin' | 'all'
export type AdminGateDecision = 'allow' | 'signed-out' | 'forbidden' | 'mfa-required'
export type PrivilegedAssuranceDecision = 'allow' | 'aal2-required' | 'recent-auth-required'

export function evaluateAdminGate(input: {
  userPresent: boolean
  role: string | null
  aal: string | null
  rollout: MfaRollout
  superadminOnly?: boolean
}): AdminGateDecision {
  if (!input.userPresent) return 'signed-out'
  if (input.role !== 'admin' && input.role !== 'superadmin') return 'forbidden'
  if (input.superadminOnly && input.role !== 'superadmin') return 'forbidden'
  const mfaRequired =
    input.rollout === 'all' || (input.rollout === 'superadmin' && input.role === 'superadmin')
  if (mfaRequired && input.aal !== 'aal2') return 'mfa-required'
  return 'allow'
}

export function mfaRolloutFromEnv(value = process.env.ADMIN_MFA_ROLLOUT): MfaRollout {
  return value === 'all' || value === 'superadmin' ? value : 'off'
}

function assuranceFromUser(user: User): string | null {
  const aal = user.aud === 'authenticated' ? user.app_metadata?.aal : null
  return typeof aal === 'string' ? aal : null
}

export async function requireAdmin(options: { locale: string; superadminOnly?: boolean }) {
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  const role = user ? await getAuthoritativeRole(user.id, supabase) : null
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as { aal?: string } | undefined
  const decision = evaluateAdminGate({
    userPresent: Boolean(user),
    role,
    aal: claims?.aal ?? (user ? assuranceFromUser(user) : null),
    rollout: mfaRolloutFromEnv(),
    superadminOnly: options.superadminOnly,
  })
  const prefix = options.locale === 'ar' ? '/ar' : ''
  if (decision === 'signed-out')
    redirect(`${prefix}/login?redirect=${encodeURIComponent(`${prefix}/admin`)}`)
  if (decision === 'mfa-required')
    redirect(`${prefix}/mfa?redirect=${encodeURIComponent(`${prefix}/admin`)}`)
  if (decision === 'forbidden') redirect(`${prefix}/`)
  return { user: user!, role: role as AdminRole }
}

export function isRecentAuthentication(authTimeSeconds: number | null, nowMs = Date.now()) {
  if (!authTimeSeconds) return false
  const age = nowMs - authTimeSeconds * 1000
  return age >= 0 && age <= 15 * 60 * 1000
}

/** Application-side contract; DB/RPC enforcement still follows SEC-018/SEC-016. */
export function evaluatePrivilegedAssurance(input: {
  aal: string | null
  authTimeSeconds: number | null
  nowMs?: number
}): PrivilegedAssuranceDecision {
  if (input.aal !== 'aal2') return 'aal2-required'
  if (!isRecentAuthentication(input.authTimeSeconds, input.nowMs)) return 'recent-auth-required'
  return 'allow'
}
