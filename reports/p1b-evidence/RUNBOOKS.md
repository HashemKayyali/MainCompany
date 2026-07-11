# P1B evidence runbooks — Q1–Q8 + AUTHP-010 (ADR-17 measurements)

**Precondition for EVERY run: ROUTE-010 PASS.** Execute on the preview topology (Vite preview with the test rewrite → Next preview). Record each run as `reports/p1b-evidence/Qn-<date>.md`: exact steps, browser, observed storage/cookie states (KEY NAMES AND SHAPES ONLY — never token values), verdict. The instrument is `/bridge-test` (noindex, both locales).

Common fixtures: one test account with remember-me ON (token in localStorage + `bl-auth-persistence=persistent`), one with remember-me OFF (sessionStorage + `bl-auth-persistence=session` in sessionStorage). Log in on the VITE preview to create each state.

## Q1 — no unwanted logout
Vite preview login (remember-me ON) → navigate to `/bridge-test` through the rewrite → EXPECT `bridge: adopted`, `cookie-session user: <uuid>`; devtools: legacy localStorage keys UNCHANGED; `sb-*` auth COOKIES now present.

## Q2 — correct cookie session incl. remember-me inference
Repeat Q1 with both fixtures → EXPECT `remember-me inferred: true` / `false` respectively; inspect cookie attributes (session-cookie vs Max-Age) and record ACTUAL values — this is also AUTHP-010 input.

## Q3 — return to Vite mid-strangler
After Q1 adoption, click "Return to a Vite route" → EXPECT still signed in on Vite (its localStorage token untouched). Record.

## Q4 — expired refresh token
Fixture: corrupt the refresh_token INSIDE the legacy blob (edit JSON value to `rt-invalid`) → `/bridge-test` → EXPECT `bridge: failed`, reason like "Invalid Refresh Token", login CTA visible, NO redirect loop, legacy keys untouched.

## Q5 — dual-tab rotation (THE decisive measurement — never reasoned from docs)
1. Tab A: Vite preview, signed in (remember-me ON). Tab B: `/bridge-test`, adopted.
2. Tab B: press "Force token refresh" (rotation instrument).
3. Tab A: perform an authed action (open /profile, send a chat message).
4. EXPECT under rotation-with-reuse-interval: Tab A recovers via its own refresh. FAIL = Tab A signed out or 401 loop.
5. Repeat inverted (refresh in A, act in B). Repeat ×3 each direction; also with a 6-minute idle gap (past access-token expiry).
6. Ambiguous after two designs → STOP, escalate with raw observations (phase stop condition).
FAIL consequence: draft ADR-09 amendment (atomic auth-surface cutover) — do NOT self-approve.

## Q6 — partial bridge failure
Block `*.supabase.co` via devtools request blocking → `/bridge-test` → EXPECT `bridge: failed` + normal signed-out page; unblock → reload → EXPECT adoption succeeds (retry-on-next-visit).

## Q7 — rollback
Remove the test rewrite (restore per ROLL-01) → user returns to Vite route → EXPECT Vite session intact. Record alongside ROUTE-009.

## Q8 — legacy-key removal spec (analysis, fed by Q1–Q7)
Expected outcome per BRIDGE-01: keys removable only at P7 (all groups cut over + 2 cycles + adopted-rate <1%/wk). The runs must confirm no earlier step depends on key absence.

## AUTHP-010 — ADR-17 measurements (remember-me)
On the Q2 fixtures record: (a) exact Set-Cookie attributes @supabase/ssr writes after setSession + after a refresh; (b) browser-close behavior per fixture (close/reopen → still authed?); (c) rotation interaction with cookie lifetime; (d) `signOut()` in Next tab → effect on Vite tab's localStorage session (scope 'local' vs 'global' — record actual); (e) multi-tab cookie convergence timing. Output: ADR-17 closure text proposing the AUTH-007 design (cookie-lifetime split vs Supabase default), justified line-by-line from these observations.
