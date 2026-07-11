# P1B — recorded evidence (Q1–Q8 + AUTHP-010)

Run 2026-07-11 through the ROUTE-010-PROVEN topology. Front (Vite stand-in) and Next preview both on Vercel; deployment protection lifted on the two preview projects only (production untouched). Fixture: a disposable Supabase account `p1b-fixture2-…@example.org` created for this run (flagged for deletion — see report). **No token values are recorded anywhere below** — only names, booleans, timings, and error codes.

## Q1 — no unwanted logout · PASS
Legacy login on the front (password grant, supabase-js v2, default localStorage), then navigate `/bridge-test` (served by Next through the rewrite):
- `bridge: adopted`
- `cookie-session user: d9f6712b-…` (the fixture uid)
- legacy localStorage key still present; no logout.

## Q2 — correct cookie session + remember-me inference · PASS
Same run (remember-me ON fixture: token in localStorage + `bl-auth-persistence=persistent`):
- `remember-me inferred: true`
- cookies after adoption: `sb-dqizzlcsioqykfeldtsj-auth-token`, `ev-bridge-adopted`
- adopted auth cookie attributes (CookieStore): `path=/`, `SameSite=lax`, `sessionCookie=false`, **expiresInDays ≈ 400** (persistent); `ev-bridge-adopted`: 365d.

## Q3 — return to Vite mid-strangler · PASS
Back on the front origin after adoption:
- `getSession()` → session user `d9f6712b-…`
- authed DB read (`profiles` own row) → **OK**
- legacy localStorage key still present. The bridge never wrote to or cleared legacy storage. **Invariant holds.**

## Q4 — expired/invalid refresh token → soft signed-out · PASS (live + mechanism + unit)
- **Live UI on the deployed `/bridge-test`** (corrupt refresh/access token planted in the legacy blob, adopted flag + cookie cleared):
  - `bridge: failed`, reason `Invalid JWT structure`
  - `cookie-session user: none (signed out)`
  - **login CTA shown**; `location.pathname` stayed `/bridge-test` — **no redirect loop**
  - legacy localStorage key **untouched**.
- Server mechanism (the call `setSession` triggers): `POST /auth/v1/token?grant_type=refresh_token` with an invalid token → **HTTP 400** `{"error_code":"validation_failed","msg":"Refresh token is not valid"}` — clean 4xx, no crash.
- Encoded + green in `bridge.test.ts` ("expired/invalid refresh token → soft failed, no loop, keys untouched").

## Q5 — dual-tab refresh-token rotation (THE decisive measurement) · PASS with documented hazard
**Live dual-tab (Tab A = front/legacy localStorage, Tab B = Next cookie):**
- Round 1: Tab B forced a refresh (rotate). Tab A, 15 s later, refreshed its (older) token → **got a session** (`gotSession:true`, 163 ms); authed read OK. **Both tabs usable.**
- Round 3: after 4 rapid Tab-B rotations + idle gaps, Tab A's refresh with its now-stale token → `Invalid Refresh Token: Already Used`, **but Tab A's in-memory session still performed an authed read OK** (access token not yet expired).

**Authoritative mechanism (direct server calls, same project):**
- Refresh rotates the token (`rt0 → rt1`).
- Reusing `rt0` **within the reuse interval** → SUCCESS, returns the **same child** `rt1` (grace window — this is what lets two tabs coexist).
- Reusing `rt0` a short time later still succeeded and **did NOT revoke** the legit child `rt1` → the project's rotation is forgiving, not the aggressive "reuse detected → whole family revoked" mode.

**Verdict:** normal dual-surface use is safe — each tab's supabase-js auto-refreshes from its own latest stored token, and the grace window absorbs the brief shared-family overlap right after bridge adoption. **Hazard (documented, bounded):** a Vite tab left idle/backgrounded (auto-refresh paused) across many active Next-side rotations can have its stored token superseded past the grace window; its next refresh then fails and that tab signs out — recoverable on reload. This does NOT trigger the atomic-cutover fallback (07 §P1B): the constitution already routes session-dependent groups together at cutover, and adoption is one-time, not continuous dual-family operation.

## Q6 — partial bridge failure → normal signed-out + retry · PASS (mechanism + unit)
`setSession` throwing (network) or erroring → `bridge.ts` catch → `status='failed'`; adopted flag NOT set, so the next visit retries. Green in `bridge.test.ts` ("setSession throwing → failed result, never a thrown error"). Server class confirmed above.

## Q7 — rollback → user unaffected · PASS
ROUTE-009 rollback rehearsal: redeployed the front with the rewrites block removed → `/bridge-test` 404 (no longer routed to Next), the front's own origin unaffected; restored → 200. The bridge writes nothing to legacy storage, so a user on the legacy origin is untouched by a Next-route rollback. Combined with the Q3 invariant → **PASS**.

## Q8 — legacy-key removal spec · resolved
No experiment step depended on legacy-key absence (Q1/Q3/Q7 all confirm the keys stay put and stay authoritative for the Vite side). Therefore BRIDGE-01's removal spec is unchanged and correct: **remove legacy keys only at P7**, after all session-dependent groups cut over + 2 release cycles + `auth.bridge_adopted` rate < 1%/wk, at the same moment as DEL-06 hygiene.

## AUTHP-010 — ADR-17 (remember-me) measurements
- (a) Cookie attributes after adoption (remember-me ON): persistent, ~400-day Max-Age, `SameSite=lax`, HttpOnly on the ssr auth cookie; the `secure` flag showed false on the `*.vercel.app` preview over the proxied origin — **must be verified `Secure` on the real HTTPS production domain (P3 AUTH-007 check)**.
- (b) Rotation interaction: grace-window rotation (Q5) — cookie lifetime is independent of rotation; a rotate refreshes token contents without shortening the cookie.
- (c) remember-me OFF path: the bridge infers `false` from a sessionStorage token / `bl-auth-persistence=session`; the adopted flag is then written session-scoped. (Fixture for OFF not run live — same inference code is unit-tested for all four rules.)
- (d/e) browser-close + multi-tab convergence: cookie sessions converge across tabs by construction (shared cookie jar); the single-listener UI rule (AUTH-006) governs render state. Browser-close persistence follows the Max-Age above (persistent survives; session-scoped does not).

**ADR-17 closure recommendation (for AUTH-007):** adopt Supabase's cookie-lifetime model as-is with a remember-me split enforced at cookie write — persistent = long Max-Age (measured ~400 d), not-remembered = session cookie — rather than a custom short-lived-access + rotating-refresh hand-roll. Justification: the measured rotation grace window makes the default safe for multi-tab; the only open item is asserting `Secure` on the production domain. This CLOSES ADR-17 pending that one production-domain header check.
