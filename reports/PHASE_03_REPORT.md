# PHASE 03 REPORT — Auth and Public-Form Security

Date: 2026-07-12 · Branch `eventies-next-reconstruction`

## Verdict: **BLOCKED — QG-P3 not passed**

The code-side Phase 3 foundation is implemented and all available local gates are green, but the phase cannot be completed or declared cutover-ready without owner-controlled preview/staging prerequisites. Phase 4 was not started.

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

1. **Turnstile keys unavailable:** `.env.local` contains no `NEXT_PUBLIC_TURNSTILE_SITE_KEY` or `TURNSTILE_SECRET_KEY`. The linked project is `eventies-next-preview`, but Vercel CLI has no credentials in this session, so preview env presence could not be inspected. This is an explicit Phase 3 stop condition.
2. **Migration not staging-verified:** the new atomic counter/dedup migration must be reviewed and applied through the branch/staging DBMIG pipeline, then multi-instance concurrency and expiry/cleanup tests must run. It was not applied to production.
3. **Real Turnstile integration evidence missing:** FORM-TS success/expiry/replay cases cannot run without preview test keys and staging RPCs.
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
