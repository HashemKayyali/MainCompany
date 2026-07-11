import 'server-only'

import { serverEnv } from '@/server/env'
import { track } from '@/server/observability/track'

/**
 * FOUND-034 — server-side Turnstile verification (05 §Bot defense:
 * client-side-only Turnstile is a violation). FAILS CLOSED: a missing secret,
 * network error, or non-success response all reject.
 */

const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ ok: boolean; errorCodes?: string[] }> {
  const secret = serverEnv().TURNSTILE_SECRET_KEY
  if (!secret) {
    await track('turnstile.misconfigured', {})
    return { ok: false, errorCodes: ['missing-secret'] }
  }
  if (!token) return { ok: false, errorCodes: ['missing-input-response'] }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)

    const res = await fetch(VERIFY_ENDPOINT, { method: 'POST', body })
    if (!res.ok) {
      await track('turnstile.verify_http_error', { status: res.status })
      return { ok: false, errorCodes: [`http-${res.status}`] }
    }
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      return { ok: false, errorCodes: data['error-codes'] ?? ['unknown'] }
    }
    return { ok: true }
  } catch (error) {
    await track('turnstile.verify_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    })
    return { ok: false, errorCodes: ['network-error'] }
  }
}
