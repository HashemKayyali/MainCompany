'use client'

import { useEffect, useState } from 'react'
import { runAuthBridge, type BridgeResult } from '@/features/auth/bridge'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

/**
 * AUTHP-002 client — runs the bridge once, shows the verdict + live session
 * state, and exposes the experiment controls the Q1–Q7 runbooks reference.
 * Tokens are NEVER rendered or logged (05 security check).
 */
export function BridgeTestClient() {
  const [result, setResult] = useState<BridgeResult | null>(null)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    void (async () => {
      const bridgeResult = await runAuthBridge()
      setResult(bridgeResult)
      const { data } = await getSupabaseBrowserClient().auth.getUser()
      setSessionUserId(data.user?.id ?? null)
    })()
  }, [])

  async function forceRefresh() {
    // Q5 instrument: force a token rotation in THIS tab, then check the other
    // (Vite) tab per the runbook.
    const { error } = await getSupabaseBrowserClient().auth.refreshSession()
    if (!error) setRefreshCount((c) => c + 1)
  }

  return (
    <section>
      <p data-testid="bridge-status">bridge: {result ? result.status : 'running…'}</p>
      {result?.status === 'adopted' && (
        <p data-testid="bridge-remember">remember-me inferred: {String(result.rememberMe)}</p>
      )}
      {result?.status === 'failed' && <p data-testid="bridge-reason">reason: {result.reason}</p>}
      <p data-testid="session-user">cookie-session user: {sessionUserId ?? 'none (signed out)'}</p>
      {!sessionUserId && (
        // Deliberate full-page anchor: /login lives on the VITE side of the
        // strangler topology until P3 — a Next <Link> would client-route into
        // the 404 fallback instead of crossing the rewrite boundary.
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/login">Log in on the main site</a>
      )}
      <hr />
      <button type="button" onClick={forceRefresh} data-testid="force-refresh">
        Force token refresh (Q5 probe) — done {refreshCount}×
      </button>
      <p>
        <a href="https://www.eventiesjo.com/profile" rel="noreferrer">
          Return to a Vite route (Q3/Q7 round-trip)
        </a>
      </p>
    </section>
  )
}
