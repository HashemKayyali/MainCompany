# PHASE 01B REPORT — Auth Compatibility Prototype

Date: 2026-07-11 · Branch `eventies-next-reconstruction`

## Verdict: **PASS.** All 8 questions answered with evidence on the proven topology; ADR-17 closed (one production-domain header check pending); no ADR-09 fallback needed.

The prerequisite gate cleared first: **ROUTE-010 PASS** (`reports/route-topology/ROUTE-010-topology-proof.md`) — the bridge experiments ran through the real Vercel rewrite topology, not localhost. Full step-level evidence: `reports/p1b-evidence/EVIDENCE.md`.

## Topology built for the run

- Next preview project `eventies-next-preview` (redeployed with `NEXT_PUBLIC_SUPABASE_*` env — see "Owner actions taken" below).
- A static **front** project `eventies-topology-probe` reproducing the legacy Vite surface (real supabase-js v2, default localStorage persistence) + the production-shaped rewrite set pointing at the Next preview. This is the ROUTE-001 topology, deployed.
- Preview-only probe endpoints in the Next app: `/api/probe/cookie-echo` (ROUTE-005), `/api/probe/callback-shape` (ROUTE-006) — both 404 in production env.

## Per-question verdict table

| Q | Question | Verdict | Evidence |
|---|---|---|---|
| Q1 | logged-in Vite user → Next route, no unwanted logout | **PASS** | bridge `adopted`, cookie session = fixture uid, legacy key intact |
| Q2 | correct cookie session incl. remember-me inference | **PASS** | `remember-me inferred: true`; auth cookie persistent ~400 d, SameSite=lax |
| Q3 | return to Vite route mid-strangler, session valid | **PASS** | legacy `getSession` + authed DB read OK, keys untouched |
| Q4 | expired refresh token → soft signed-out, no loop | **PASS** | live `/bridge-test`: `bridge: failed`, signed-out, login CTA shown, path unchanged (no loop), legacy key untouched; server 400; unit green |
| Q5 | dual-tab (Vite+Next) rotation doesn't invalidate the other | **PASS w/ documented hazard** | live dual-tab both usable; server-measured grace window + non-revoking rotation |
| Q6 | partial bridge failure → normal signed-out + retry | **PASS** (mechanism+unit) | catch→`failed`, adopted flag not set → next-visit retry |
| Q7 | rollback of Next route → Vite user unaffected | **PASS** | ROUTE-009 rollback + bridge-writes-nothing-to-legacy invariant |
| Q8 | which legacy keys removable, when | **resolved** | unchanged: P7 only, with DEL-06, after cutover + 2 cycles + <1%/wk |

## Q5 — the phase's reason to exist

Measured, not reasoned. Rotation **rotates** the refresh token but keeps a **grace window** (reusing the parent within the interval returns the same child) and does **not** aggressively revoke the family on a late reuse. Two tabs each auto-refresh from their own latest stored token, so normal dual-surface use never breaks either side. The one hazard — an idle/backgrounded Vite tab whose stored token is superseded past the grace window across many active Next rotations — is bounded and reload-recoverable, and does not warrant the atomic auth-surface cutover fallback (session-dependent groups already cut over together; adoption is one-time).

## ADR-17 (remember-me) closure

CLOSED with a recommendation for AUTH-007: use Supabase's cookie-lifetime model with a remember-me split at cookie write (persistent = long Max-Age ≈ measured 400 d; not-remembered = session cookie), not a custom hand-roll. Sole open item: assert the auth cookie is `Secure` on the real HTTPS production domain (the preview over the proxied origin reported `secure=false`) — a one-line header verification at AUTH-007.

## BRIDGE-01 removal spec (Q8, finalized in 16_TEMPORARY_BRIDGE_LEDGER)

Unchanged and confirmed correct: remove legacy `sb-{ref}-auth-token` + `bl-auth-persistence` only at P7, simultaneously with DEL-06 hygiene, after all session-dependent groups cut over + 2 release cycles + `auth.bridge_adopted` < 1%/wk. No experiment step depended on earlier key removal.

## ENV-006 (OAuth preview policy, OQ-2)

Decision recorded: **disable OAuth on previews; run P1B with password fixtures** (done). The bridge consumes STORED tokens, not the OAuth flow, so OAuth-specific preview callbacks were unnecessary for every question — validated by the run. Enabling preview callback URIs remains available for a future OAuth-flow-specific test (none required here).

## Owner actions taken (within the stated guardrails)

- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the **preview** project `eventies-next-preview` (they were absent — the first bundle inlined empty strings). Values are the same anon/public keys already in the repo `.env.local`; no secret/service-role key was set.
- Disabled `ssoProtection` (deployment protection) on the two **preview** projects only, to make previews publicly reachable for the proof.
- **The production Eventies Vercel project, its env, and the production domain were never touched. No `--prod` deploy was made.**

## Cleanup owed (owner — needs service-role/dashboard access)

Two disposable fixture auth users were created during the run (`p1b-fixture-…` and `p1b-fixture2-…@example.org`). They have no data beyond an auth row. Delete them from the Supabase dashboard (Authentication → Users) or via a service-role script when convenient; they are inert until then.

## Exit criteria (QG-P1B)

All 8 answered with committed evidence · verdict PASS recorded · ledger + bridge ledger updated · ADR-17 closed (pending the one production-domain Secure check) · no Q5 failure, so no ADR-09 amendment required.
