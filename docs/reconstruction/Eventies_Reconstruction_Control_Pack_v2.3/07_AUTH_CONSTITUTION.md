# 07 — AUTH CONSTITUTION

## Clients & sessions
- `@supabase/ssr`: `lib/supabase-browser.ts` (singleton, cookie storage) + `server/supabase/server-client.ts` (per-request, cookies from Next). The legacy dual-storage adapter and `bl-auth-persistence` are deleted (DEL-06); the manual `detectSessionInUrl:false` + hand-rolled exchange pages are replaced.
- proxy.ts (Next 16 Proxy): cookie refresh + locale negotiation ONLY, composed per 05 §Proxy Composition. Authorization never lives there (Constitution §3).
- Server identity per ADR-20: `getClaims()` (locally verified) for session-presence gates and reads; `getUser()` only where the fresh Auth record is required (AAL/MFA assertions, destructive-op recency); role ALWAYS from the `profiles` row — never from JWT claims.
- Remember-me: **ADR-17 OPEN** — semantics are decided by P1B measurement (AUTHP-010), not assumed. Candidate designs (cookie-lifetime split, Supabase-default persistence, hybrid) are evaluated against measured ssr-cookie + rotation behavior. AUTH-007 blocked until CLOSED.
- Multi-tab: cookie sessions converge; one browser-client listener updates UI state; the legacy reference-stability requirement (open modal survives TOKEN_REFRESHED) is preserved **as a test** (AUTH-006) not as a hack.
- Refresh/expiry: middleware refresh; expired refresh token → clean signed-out state + return-to path preserved via sanitizer.
- Revocation: role change effective next server request; direct-to-Supabase client calls bounded by token TTL — documented, accepted.
- Password change: revoke other sessions (`signOut({scope:'others'})`).
- Logout: server-aware sign-out clears cookies; legacy keys cleared by bridge hygiene.

## Flows
- Login/signup/reset/update: canonical pipeline — normalize → Zod → abuse gate (05) → Supabase call → enumeration-safe error map → cookie session → server role resolve → sanitized redirect → audit event.
- Google OAuth: initiation carries locale-aware sanitized `redirect`; `/auth/callback` Route Handler performs `exchangeCodeForSession`; **used-code → existing-session fallback is ported** (also covers refresh-mid-callback); errors render a friendly page with retry (port `getFriendlyCallbackError` copy).
- Admin: TOTP MFA enrollment flow; AAL2 asserted in admin layout; recent-auth ≤15 min for destructive ops (assertion helper `server/supabase/admin-guard.ts`); recovery: superadmin can reset an admin's MFA via documented Supabase dashboard procedure (no custom recovery codes UI in v1 — logged tradeoff).
- Telemetry: auth.* events per 05.

## PHASE 1B PROTOTYPE (blocking experiment — ADR-09)
Smallest possible proof: one Next route (`/bridge-test`) + the bridge snippet + one protected Next page + links back to a Vite route. No auth UI redesign. It must experimentally answer:
1. Logged-in Vite user enters a Next route → no unwanted logout? (bridge reads legacy `sb-{ref}-auth-token` from localStorage → `setSession` on cookie client → verify `getUser()`.)
2. Next establishes correct cookie session (both tokens, correct Max-Age per remember-me inference)?
3. User returns to a legacy Vite route mid-strangler → Vite session still valid? (bridge must NOT clear legacy keys until P7 — hygiene deferred, logged in BRIDGE-01.)
4. Expired refresh token in legacy storage → bridge fails soft to signed-out + login CTA (no loop)?
5. Two tabs (one Vite, one Next) → both usable; token refresh in one doesn't invalidate the other? (Supabase refresh-token rotation: MEASURE — this is the riskiest unknown.)
6. Partial bridge failure (setSession throws) → user sees normal logged-out Next page; event logged; retry on next visit?
7. Rollback of the Next route to Vite → user unaffected (legacy keys untouched)?
8. Which legacy keys are safe to remove and when → answer becomes BRIDGE-01's removal spec (expected: only at P7, after cutover completes + 2 cycles).
Additionally P1B closes ADR-17 via AUTHP-010 (remember-me semantics: ssr cookie behavior, lifetimes, browser-close, rotation, local sign-out vs server session, bridge compat, multi-tab). Prerequisite: ROUTE-010 topology PASS — running the prototype outside the real rewrite topology invalidates every answer. Pass = all questions answered with evidence in the P1B report + ADR-17 CLOSED. Fail on Q5 → fallback design: forced single-surface auth (auth routes cut over atomically with all session-dependent routes) — a Decision Log amendment, not improvisation.
