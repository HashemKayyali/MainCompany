# PHASE 03 REPORT — Auth and Public-Form Security

Date: 2026-07-12 · Branch `eventies-next-reconstruction`

## Owner-authorized code-side status (2026-07-13)

`CODE_SIDE_COMPLETE`

`LIVE_STAGING_GATES_BLOCKED_BY_OWNER`

QG-P3 is **not passed**. The owner explicitly deferred Supabase staging setup and every mutation-based live-evidence gate. This deferral permits Phase 4 code-side work but does not convert missing evidence into a pass.

## Verdict: **CODE_SIDE_COMPLETE / LIVE_STAGING_GATES_BLOCKED_BY_OWNER — QG-P3 not passed**

The code-side Phase 3 foundation is implemented and all available local gates are green, but the phase cannot be completed or declared cutover-ready without owner-controlled preview/staging prerequisites. Phase 4 was not started.

## Live-gate continuation — 2026-07-12

- Vercel CLI identity confirmed: `hashemkayyali99-1043`.
- Linked project confirmed by project ID/name: **`eventies-next-preview`**.
- Added Cloudflare's official always-pass dummy sitekey and secret key to the Vercel **Preview environment only** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). Production environment variables were not changed.
- Preview-only deployment `dpl_9EzkQgD9DsdbdWcYeJ7SmUrVAu6Q` reached READY: `https://eventies-next-preview-qeafb6tvq-hashemkayyalis-projects.vercel.app`. No `--prod` flag or production target was used.
- Non-mutating Preview Playwright evidence: **12/12 PASS** across EN/AR × desktop/mobile (auth localized/noindex, missing Turnstile token → 403, cross-site mutation → 403).
- HTTPS curl evidence: `/login` returned 200 + HSTS + `X-Robots-Tag: noindex`; `/auth/callback?locale=ar&error=access_denied&redirect=/ar/products` returned 303 to `/ar/login?...&redirect=/ar/products`, proving locale/redirect preservation on Preview.
- Supabase CLI authentication is available, but `projects list` contains no Eventies staging project and `branches list --project-ref dqizzlcsioqykfeldtsj` returned `branches: []`. The Preview Vercel project still uses the live Eventies Supabase URL. Therefore no SQL, auth-user creation, successful public-form insert, rate-limit counter mutation, or dedup claim was executed from Preview.
- Full post-deploy local rerun: clean `npm ci --no-audit` PASS; format/typecheck/lint PASS; architecture/i18n/cycle gates PASS; unit suite 98 pass; production build PASS; local Playwright **32/32 PASS**.

## Implemented in this pass

- AUTH-004/005/I18N-014: safe redirect sanitizer, AUTH_PATHS loop blocklist, locale-preserving callback Route Handler, used-code existing-session fallback, friendly error keys, and 303 redirects.
- AUTH-001/002/003/006/008/009/010/011/012/013/014/016/017 (code-side): localized login/register/reset/update pages, enumeration-safe public responses, server auth handlers, triggered login Turnstile path, signup/reset Turnstile, progressive delay, one browser listener, password-change sign-out-others, local logout, BRIDGE-01 lifecycle mount, noindex metadata, and scrubbed auth/bridge telemetry.
- FORM-001..008/010 (code-side): contact/support/custom-build schemas and Route Handlers; JSON + Origin/Sec-Fetch-Site checks; server Turnstile verification; durable rate-limit adapter; 10-minute dedup claim; typed Expo-callable responses; localized accessible contact UI; preserved WhatsApp/email fallback.
- SEC-005/006 and A11Y-005/006 code/tests.
- Additive migration file `20260712000001_phase3_security_counters.sql` for atomic counters, dedup claims, expiry, and cleanup. It was **not applied to production**.
- Owner decision recorded: `CAT-024 = DEFERRED_BY_OWNER`; still not approved/DONE and mandatory before Phase 7 or a production-domain switch.

## Threshold snapshot (all provisional, ADR-11)

| Rule | Threshold | Window | Dimension |
|---|---:|---:|---|
| Login delay begins | after 3 attempts | 15 min | identifier |
| Login Turnstile begins | after 5 attempts | 15 min | identifier or IP |
| Public forms | 5 submissions | 10 min | identifier or IP |
| SECURITY_STRICT | halves configured limits and forces login challenge | — | — |

Progressive delay starts at 250 ms and doubles to a 4 s cap. State is designed for an atomic Supabase RPC, never process memory.

## Local verification evidence

- Clean `npm ci --no-audit`: PASS (npm exit 0; exact lockfile tree). Initial Windows watcher/ENOTEMPTY locks were cleared by stopping only workspace dev/npm-ci processes and removing the verified app `node_modules` directory before retry.
- `npm run format`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run gate:arch`: PASS (server-only, cache isolation, service-role import confinement, env prefix).
- `npm run gate:i18n`: PASS (6 domains, EN/AR in sync).
- `npm run gate:cycles`: PASS (145 files, zero cycles).
- `npm run test`: PASS — 14 files; 98 passed, 32 skipped, 2 pre-existing TODO.
- `npm run build`: PASS — Next 16.2.10 production build; BUILD_ID generated 2026-07-12.
- `npx playwright test`: PASS — 32/32 across EN/AR × desktop/mobile.
- Phase 3 Playwright coverage: auth pages localized/noindex; missing Turnstile token rejected 403; cross-site mutation rejected 403 — 12/12 across all four projects.

## Missing preview/staging evidence and blockers

1. **Preview Turnstile variables: RESOLVED.** Official Cloudflare test keys now exist on `eventies-next-preview` Preview only; missing-token rejection is live-verified. Success/failure/replay application flows remain blocked by the absent staging DB because a successful token proceeds to the durable RPC.
2. **Migration not staging-verified:** no Eventies Supabase staging project or preview branch exists. The new atomic counter/dedup migration must be applied to a newly supplied staging target through the DBMIG pipeline, then multi-instance concurrency and expiry/cleanup tests must run. It was not applied to production.
3. **Real Turnstile integration evidence incomplete:** missing-token behavior is live-verified; success, explicit failure, expiry, and replay remain blocked until Preview is pointed at staging and the migration is applied.
4. **Auth live-flow evidence missing:** AU-FLOWS, REVOKE-SEM, multi-tab logout/recovery, Google OAuth locale callback, and Secure-cookie header evidence require preview fixtures/configuration. ENV-006 remains “OAuth disabled on preview,” so password fixtures are appropriate unless the owner elects an OAuth-specific preview test.
5. **Bridge cohort evidence missing:** no real cohort telemetry exists for the `<2%` forced re-login gate. Code-side adopted/failed events are wired, but AUTH-020 cannot pass without observation.
6. **Remember-me incomplete:** AUTH-007 still needs the P1B-recommended persistent/session cookie split and the real-HTTPS `Secure` header assertion. The current form carries the choice but server cookie lifetime is still Supabase default.
7. **Session-gate and exhaustive auth E2E incomplete:** AUTH-015/018/019 and the complete AU-EN timing/diff harness need final implementation/evidence after preview prerequisites are available.
8. **Supabase native dashboard settings unavailable:** SEC-002 rate-limit values and remaining dashboard evidence require owner access.

## Group B cutover readiness

**NOT READY / BLOCKED.** Local code and regression gates are green, but QG-P3 requires server-verified Turnstile on all three forms in preview, durable multi-instance limits, live auth/revocation flows, rate-limit telemetry, and bridge forced-relogin telemetry below 2%. None may be inferred from local mocks.

## Safety confirmation

- No production migration, production deployment, production Vercel project/domain change, force push, or `npm audit fix --force` occurred.
- Phase 4 was not started.

## 2026-07-14 Staging isolation attempt

QG-P3 remains **BLOCKED**. The Staging guard stopped before build or live Auth traffic because Vercel CLI could not inject the required Preview Supabase and Turnstile values into a local `env run` child process. No registration, login, recovery, password update, session, Turnstile-success, durable-limit, deduplication, BRIDGE-01 cohort, or dashboard-native limit evidence was produced in this attempt.

## 2026-07-14 Staging live-validation continuation

The prior environment blocker is resolved. The guard returned `STAGING_ENV_CONFIRMED` for `ogfgaupebcabuoczoqcy`, and the isolated Preview contains the Staging ref with the Production ref absent.

Real disposable-fixture evidence passed for password login, profile creation, session refresh, password update, recovery-token exchange, HTTPS Secure cookies, session versus 400-day remember-me cookies, logout, global revocation, durable multi-client rate counters, concurrent form deduplication, missing-token challenge enforcement, and the Turnstile success path. Fixture cleanup was verified.

QG-P3 remains **BLOCKED** for exact live gaps: public registration returned the enumeration-safe 200 response but did not persist an Auth user; the configured always-pass Turnstile test secret cannot prove invalid-token rejection or replay rejection; no BRIDGE-01 cohort percentage or Supabase dashboard-native limit evidence exists; OAuth-provider, expired-session, and true multi-tab evidence remain incomplete. No evidence was fabricated.
