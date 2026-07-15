# PHASE 04 REPORT — Customer transactional flows

Date: 2026-07-13 · Branch `eventies-next-reconstruction`

## Verdict

**CODE_SIDE_COMPLETE / LIVE_STAGING_GATES_BLOCKED_BY_OWNER — QG-P4 not passed.**

The owner deferred Supabase staging. No migration or successful transaction was redirected to production. Group C is not cutover-ready.

## Implemented code-side

- Behavioral spec for draft survival and timeout/idempotency semantics.
- Wave C additive migration file: nullable per-profile idempotency keys, unique indexes, missing upper/length CHECKs, and JSONB-signature-preserving RPC wrappers.
- Group-scoped rental/quote providers using the legacy storage keys; catalog add-to-draft islands; quantity/date controls.
- Shared Zod schemas and typed transaction errors.
- Single-flight double-click protection; stable idempotency key across timeout retries; drafts clear only after a confirmed result.
- Server session layouts with sanitized return paths; no-store/RLS-backed personal DAL.
- `/rental-cart`, `/checkout`, `/purchase-quote`, `/my-requests`, request detail, order summary, and profile surfaces.
- Parallel request/quote reads, status badges/journey, empty/error/loading/retry states, bfcache refresh, bidi isolation, EN/AR dictionaries, and accessible live regions/controls.
- Production-disabled safe fixture route for non-mutating EN/AR desktop/mobile UI coverage.

## Adversarial evidence

| Scenario | Code-side evidence | Live staging |
|---|---|---|
| MUT-DC double click | one promise, one RPC, one key unit test | BLOCKED_BY_OWNER_STAGING |
| MUT-TO timeout-after-success | retry reuses key unit test; unknown-result UI | BLOCKED_BY_OWNER_STAGING |
| MUT-SS stale session | typed auth-expired redirect; draft retained | BLOCKED_BY_OWNER_STAGING |
| DBT-01 timeout | typed timeout + retry/empty/error fixture | BLOCKED_BY_OWNER_STAGING |
| BFC-01 | persisted `pageshow` refresh hook | browser-auth evidence deferred |
| A11Y-012 | keyboard-reachable quantity/date controls, four projects | safe fixture PASS |

## Migration awaiting execution

`eventies-next/supabase/migrations/20260713000001_phase4_idempotency_and_checks.sql`

It was not applied to staging or production. Required next evidence: staging apply/schema diff, CT-RPC/RLS, frozen-Vite compatibility run, concurrent duplicate calls, timeout-after-commit retry, and human DBMIG approval.

## Group C readiness

**BLOCKED_BY_OWNER_STAGING.** QG-P4 is not passed and CUT-004 is not authorized.

## Final non-production validation

- Clean `npm ci --no-audit`: PASS; lockfile tree verified with `npm ls --depth=0`.
- Format, strict typecheck, ESLint: PASS.
- Architecture/service-role/cache gates: PASS.
- I18N coverage: PASS — 7 EN/AR domains synchronized.
- Circular dependency gate: PASS — 176 files, zero cycles.
- Unit/static-contract tests: PASS — 17 files; 108 passed, 32 staging-gated skips, 2 pre-existing TODO.
- Next 16.2.10 production build: PASS — authenticated customer routes are dynamic; public catalog/404/cache topology preserved.
- Full Playwright matrix: PASS — 52/52 across EN/AR × desktop/mobile, including all prior Phase 0–3 tests and 20 Phase 4 safe fixture/session-gate cases.

## Preview-safe evidence

- Isolated Vercel project: `eventies-next-preview`.
- Preview deployment: `dpl_6D5QDQRVSRHqq7sd6zaru7JWjttP` (`READY`, Preview target; no `--prod`).
- Deployment URL: `https://eventies-next-preview-2c2nmgp7i-hashemkayyalis-projects.vercel.app`.
- Phase 4 safe Preview Playwright: PASS — 20/20 across EN/AR × desktop/mobile.
- Evidence was limited to signed-out session boundaries and the production-disabled, non-mutating fixture. No Supabase mutation was attempted.

## Scope guard

Production was not mutated. Phase 5 was not started.

## 2026-07-14 Staging isolation attempt

QG-P4 remains **BLOCKED**. Environment isolation failed closed before any customer fixture or transactional request. No rental, quote, profile, RLS-persona, idempotency, concurrency, retry, or cache-invalidation mutation was executed.

## 2026-07-14 Staging live-validation continuation

Real Staging evidence now passes for own-profile update, cross-user profile isolation, concurrent rental-request idempotency, concurrent purchase-quote idempotency, and cross-user request isolation. Two independently constructed application clients returned the same committed row for each shared idempotency key. All disposable users, requests, quotes, status history, item rows, and product fixtures were removed and zero residual fixtures were verified.

QG-P4 remains **BLOCKED** because timeout-after-commit recovery, authenticated browser history/detail surfaces, post-success cache-tag invalidation observation, and a frozen-Vite live compatibility mutation were not completed. Production was not used as a substitute.

## 2026-07-15 shared live-cache evidence

**LIVE_READ_AFTER_MUTATION_CACHE_INVALIDATION=PASS**

The isolated Staging Preview test used the canonical tagged `getProducts()` DAL
through a response-no-store diagnostic boundary. It proved:

1. an original value populated the shared cached read;
2. a direct database mutation remained stale before revalidation;
3. authorized `/api/revalidate` returned the expected product/list/home tags;
4. the updated value became visible after revalidation;
5. fixture deletion, cache cleanup, and session cleanup were verified.

Cache implementation commit: `4e33e2cd`.
Preview: `https://eventies-next-preview-ayfdnvmwc-hashemkayyalis-projects.vercel.app`.
Evidence: `reports/evidence/PHASE6_LIVE_CACHE_20260715.txt`.

This closes only the cache item shared with QG-P6. QG-P4 remains pending for its
other listed evidence and is not labeled PASS here.
