import 'server-only'

import { createHash } from 'node:crypto'
import { serviceRoleRestFetch } from '@/server/supabase/service-role-rest'

const CLAIM_TTL_SECONDS = 600

/**
 * Claims a verified Turnstile token exactly once across all server instances.
 * The raw token is never persisted; only its SHA-256 digest reaches the DB.
 */
export async function claimVerifiedTurnstileToken(
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<'claimed' | 'duplicate' | 'unavailable'> {
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const response = await serviceRoleRestFetch(
    '/rest/v1/rpc/claim_turnstile_token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        p_token_hash: tokenHash,
        p_ttl_seconds: CLAIM_TTL_SECONDS,
      }),
    },
    fetchImpl
  )

  if (!response?.ok) return 'unavailable'
  return (await response.json()) === true ? 'claimed' : 'duplicate'
}
