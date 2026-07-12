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

## Scope guard

Production was not mutated. Phase 5 was not started.
