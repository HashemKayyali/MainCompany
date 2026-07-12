import { NextResponse, type NextRequest } from 'next/server'
import { loginSchema } from '@/shared/schemas/auth'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { authFailure } from '@/server/auth/responses'
import { consume, progressiveDelayMs, registerRateLimitStore } from '@/server/security/rate-limit'
import { isTrustedMutationRequest, requestIp } from '@/server/security/request'
import { pseudonymousBucket, supabaseRateLimitStore } from '@/server/security/supabase-rate-limit-store'
import { verifyTurnstileToken } from '@/server/security/turnstile'
import { track } from '@/server/observability/track'

registerRateLimitStore(supabaseRateLimitStore)

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) return authFailure(403)
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return authFailure()

  const ip = requestIp(request)
  const key = pseudonymousBucket('login', parsed.data.email, ip)
  const attempt = await consume('loginFailuresBeforeChallenge', key)
  const challengeRequired = process.env.SECURITY_STRICT === '1' || attempt.count > attempt.limit
  if (challengeRequired) {
    if (!parsed.data.turnstileToken) {
      return NextResponse.json({ ok: false, code: 'CHALLENGE_REQUIRED' }, { status: 403 })
    }
    const verified = await verifyTurnstileToken(parsed.data.turnstileToken, ip)
    if (!verified.ok) return NextResponse.json({ ok: false, code: 'CHALLENGE_REQUIRED' }, { status: 403 })
  }

  const delay = progressiveDelayMs(attempt.count)
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) {
    await track('auth.login_failed', { identifierHash: pseudonymousBucket('identity', parsed.data.email) })
    return authFailure()
  }
  await track('auth.login_succeeded', { provider: 'password' })
  return NextResponse.json({ ok: true })
}
