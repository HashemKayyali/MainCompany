'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * AUTHP-001 — BRIDGE-01 snippet v0 (auth session adoption, 16_TEMPORARY_
 * BRIDGE_LEDGER). Reads the LEGACY Vite storage (`sb-{ref}-auth-token` in
 * localStorage OR sessionStorage per the `bl-auth-persistence` mode key),
 * adopts the session onto the @supabase/ssr cookie client via setSession,
 * verifies with getUser(), and marks adoption in a cookie flag.
 *
 * HARD GUARANTEES (Q3/Q7 of 07 §P1B):
 *  - legacy keys are NEVER written, cleared, or migrated by this code;
 *  - every failure is SOFT: the caller renders a normal signed-out state
 *    with a login CTA — never a loop, never a throw.
 *
 * ⚠ P1B GATE: this snippet may only be EXERCISED on a preview deployment
 * behind the proven topology (ROUTE-010 PASS). Unit tests cover the pure
 * inference/failure logic only.
 */

const AUTH_PERSISTENCE_KEY = 'bl-auth-persistence'
const ADOPTED_COOKIE = 'ev-bridge-adopted'

export type BridgeResult =
  | { status: 'skipped'; reason: 'already-adopted' | 'no-window' }
  | { status: 'no-legacy-session' }
  | { status: 'adopted'; rememberMe: boolean; userId: string }
  | { status: 'failed'; reason: string; rememberMe: boolean | null }

export function legacyStorageKey(supabaseUrl: string): string {
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0] || 'local'
    return `sb-${ref}-auth-token`
  } catch {
    return 'sb-local-auth-token'
  }
}

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

/**
 * Remember-me inference — mirrors the legacy getStoredPersistenceMode()
 * (src/lib/supabase.ts): explicit persistent marker → true; explicit session
 * marker → false; token present in localStorage → true; default → true.
 */
export function inferRememberMe(
  local: Storage | undefined,
  session: Storage | undefined,
  tokenKey: string
): boolean {
  if (safeGet(local, AUTH_PERSISTENCE_KEY) === 'persistent') return true
  if (safeGet(session, AUTH_PERSISTENCE_KEY) === 'session') return false
  if (safeGet(local, tokenKey)) return true
  return true
}

export type LegacyTokens = { access_token: string; refresh_token: string }

/** Read + parse the legacy token blob from whichever storage holds it. */
export function readLegacyTokens(
  local: Storage | undefined,
  session: Storage | undefined,
  tokenKey: string
): LegacyTokens | null {
  const raw = safeGet(local, tokenKey) ?? safeGet(session, tokenKey)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<LegacyTokens>
    if (typeof parsed.access_token === 'string' && typeof parsed.refresh_token === 'string') {
      return { access_token: parsed.access_token, refresh_token: parsed.refresh_token }
    }
    return null
  } catch {
    return null
  }
}

function hasAdoptedFlag(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.cookie.split('; ').some((c) => c.startsWith(`${ADOPTED_COOKIE}=1`))
  )
}

function setAdoptedFlag(rememberMe: boolean): void {
  // Session-scoped when remember-me is off, one year otherwise — the flag
  // only suppresses redundant bridge runs; it is NOT an auth artifact.
  const maxAge = rememberMe ? `; max-age=${60 * 60 * 24 * 365}` : ''
  document.cookie = `${ADOPTED_COOKIE}=1; path=/; samesite=lax${maxAge}`
}

export async function runAuthBridge(): Promise<BridgeResult> {
  if (typeof window === 'undefined') return { status: 'skipped', reason: 'no-window' }
  if (hasAdoptedFlag()) return { status: 'skipped', reason: 'already-adopted' }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const tokenKey = legacyStorageKey(supabaseUrl)
  const local = window.localStorage
  const session = window.sessionStorage

  const tokens = readLegacyTokens(local, session, tokenKey)
  if (!tokens) return { status: 'no-legacy-session' }

  const rememberMe = inferRememberMe(local, session, tokenKey)

  try {
    const supabase = getSupabaseBrowserClient()

    // If the cookie client already has a session, don't disturb it (Q1: no
    // unwanted logout; adoption is only for cookie-less first visits).
    const { data: existing } = await supabase.auth.getSession()
    if (existing.session) {
      setAdoptedFlag(rememberMe)
      return { status: 'skipped', reason: 'already-adopted' }
    }

    const { data, error } = await supabase.auth.setSession(tokens)
    if (error || !data.session) {
      // Q4/Q6: expired refresh token or exchange failure → soft signed-out.
      return { status: 'failed', reason: error?.message ?? 'no session returned', rememberMe }
    }

    const { data: verified, error: verifyError } = await supabase.auth.getUser()
    if (verifyError || !verified.user) {
      return { status: 'failed', reason: verifyError?.message ?? 'verification failed', rememberMe }
    }

    setAdoptedFlag(rememberMe)
    return { status: 'adopted', rememberMe, userId: verified.user.id }
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : 'unknown bridge error',
      rememberMe,
    }
  }
}
