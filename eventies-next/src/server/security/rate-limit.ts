import 'server-only'

/**
 * FOUND-033 — rate-limit module INTERFACE. All thresholds live HERE and only
 * here (05 §Calibration: configuration, never hard-coded at call sites).
 *
 * ⚠ NO STORAGE IMPLEMENTATION IN P1: ADR-18 (state store) closes via SEC-014's
 * evaluation; the store lands in P3 as SEC-015 behind this interface.
 * Process-local memory counters are PROHIBITED on serverless (05 §ADR-18) —
 * this module deliberately ships without a default store so nobody can
 * accidentally use one.
 */

export type RateLimitDimension = 'identifier' | 'ip' | 'identifier_or_ip'

export interface RateLimitRule {
  /** events allowed per window */
  limit: number
  windowSeconds: number
  dimension: RateLimitDimension
}

/**
 * ALL PROVISIONAL (ADR-11): measured for 2 weeks post-P3, reviewed weekly.
 * SECURITY_STRICT=1 halves every limit and forces the login challenge (SEC-008).
 */
export const RATE_LIMIT_RULES = {
  loginFailuresBeforeDelay: { limit: 3, windowSeconds: 900, dimension: 'identifier' },
  loginFailuresBeforeChallenge: { limit: 5, windowSeconds: 900, dimension: 'identifier_or_ip' },
  publicFormSubmissions: { limit: 5, windowSeconds: 600, dimension: 'identifier_or_ip' },
  chatMessagesPerMinute: { limit: 20, windowSeconds: 60, dimension: 'identifier' },
} satisfies Record<string, RateLimitRule>

export function effectiveRule(name: keyof typeof RATE_LIMIT_RULES): RateLimitRule {
  const rule = RATE_LIMIT_RULES[name]
  if (process.env.SECURITY_STRICT === '1') {
    return { ...rule, limit: Math.max(1, Math.floor(rule.limit / 2)) }
  }
  return rule
}

/** Storage adapter contract — implemented by SEC-015 per the CLOSED ADR-18. */
export interface RateLimitStore {
  /** Atomic increment; returns the running count within the window. */
  increment(key: string, windowSeconds: number): Promise<number>
  reset(key: string): Promise<void>
}

let store: RateLimitStore | null = null

export function registerRateLimitStore(implementation: RateLimitStore): void {
  store = implementation
}

export async function consume(
  name: keyof typeof RATE_LIMIT_RULES,
  key: string
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const rule = effectiveRule(name)
  if (!store) {
    // ADR-18 not closed / store not registered: FAIL OPEN by explicit design —
    // availability of auth/forms beats an unenforceable limit; DB-level
    // backstops (PRESERVED rate-limit functions) still apply.
    return { allowed: true, count: 0, limit: rule.limit }
  }
  const count = await store.increment(`${String(name)}:${key}`, rule.windowSeconds)
  return { allowed: count <= rule.limit, count, limit: rule.limit }
}
