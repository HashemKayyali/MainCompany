import { NextResponse, type NextRequest } from 'next/server'
import { signupSchema } from '@/shared/schemas/auth'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { authFailure, UNIFORM_AUTH_MESSAGE } from '@/server/auth/responses'
import { isTrustedMutationRequest, requestIp } from '@/server/security/request'
import { verifyTurnstileToken } from '@/server/security/turnstile'
import { track } from '@/server/observability/track'

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) return authFailure(403)
  const parsed = signupSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return authFailure()
  const challenge = await verifyTurnstileToken(parsed.data.turnstileToken ?? '', requestIp(request))
  if (!challenge.ok) return NextResponse.json({ ok: false, code: 'CHALLENGE_REQUIRED' }, { status: 403 })
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  })
  await track(error ? 'auth.signup_failed' : 'auth.signup_submitted', {})
  return NextResponse.json({ ok: true, message: UNIFORM_AUTH_MESSAGE })
}
