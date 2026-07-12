import 'server-only'

import { createHmac } from 'node:crypto'
import { getAnonServerClient } from '@/server/dal/anon-client'
import { serverEnv } from '@/server/env'
import type { RateLimitStore } from './rate-limit'

export function pseudonymousBucket(...parts: string[]): string {
  const secret = serverEnv().TURNSTILE_SECRET_KEY
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is required for security buckets')
  return createHmac('sha256', secret)
    .update(parts.map((part) => part.trim().toLowerCase()).join('\u001f'))
    .digest('hex')
}

export const supabaseRateLimitStore: RateLimitStore = {
  async increment(key, windowSeconds) {
    const { data, error } = await getAnonServerClient().rpc('consume_app_rate_limit', {
      p_bucket_key: pseudonymousBucket('rate-limit', key),
      p_window_seconds: windowSeconds,
    })
    if (error) throw error
    return data
  },
  async reset() {
    // Failure windows intentionally expire instead of being deleted after a
    // successful login, preventing reset-based races across instances.
  },
}
