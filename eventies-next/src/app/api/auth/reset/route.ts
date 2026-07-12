import { NextResponse, type NextRequest } from 'next/server'
import { resetSchema } from '@/shared/schemas/auth'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { authFailure, UNIFORM_AUTH_MESSAGE } from '@/server/auth/responses'
import { isTrustedMutationRequest, requestIp } from '@/server/security/request'
import { verifyTurnstileToken } from '@/server/security/turnstile'
import { localizedPath } from '@/lib/auth-routing'

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) return authFailure(403)
  const parsed = resetSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return authFailure()
  const challenge = await verifyTurnstileToken(parsed.data.turnstileToken, requestIp(request))
  if (!challenge.ok)
    return NextResponse.json({ ok: false, code: 'CHALLENGE_REQUIRED' }, { status: 403 })
  const supabase = await createSupabaseServerClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: new URL(
      localizedPath(parsed.data.locale, '/auth/callback?redirect=/update-password'),
      request.url
    ).toString(),
  })
  return NextResponse.json({ ok: true, message: UNIFORM_AUTH_MESSAGE })
}
