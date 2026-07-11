# PHASE 01 REPORT — Foundation

Executed 2026-07-11, branch `eventies-next-reconstruction`. App: `eventies-next/` (Next 16.2.10, version-locked per ADR-16 — `eventies-next/docs/VERSION_LOCK.md`).

## Headline status

**Everything buildable without external access is DONE and green.** Build + lint + typecheck + 4 gates + 66 unit/contract tests + 16 E2E (incl. axe) all pass. **QG-P1 is NOT fully met**: ROUTE-010 (topology proof) and the staging-DB-dependent items are BLOCKED on owner-held access — itemized below. **P1B remains gated.**

## Deviations proposed (require acknowledgment, not silently structural)

1. **"New repo" realized as `eventies-next/` sub-project directory** — this session may only work inside the worktree. Works as a second Vercel project via Root Directory; splitting to a real repo later is a `git filter-repo` away. Ledger/report language kept as-is.
2. **D-P1-01 (H/E): no real HTTP 404s under `cacheComponents`.** Unknown paths render Next's PPR 404 fallback: HTTP 200 + `robots: noindex` meta + client-rendered 404 UI. `dynamicParams=false` is build-rejected with cacheComponents; a `[locale]` catch-all commits the 200 shell before a dynamic `notFound()` runs; `experimental.globalNotFound` is enabled but partial layout matches still route through the classic flow. **This collides with the SEO constitution's "deleted products → HTTP 404" requirement — needs an ADR at P2 (SEO-404)**. Options drafted in `e2e/foundation.spec.ts` comments + `docs/ROUTE_TOPOLOGY.md`. The E2E suite encodes today's contract explicitly so the flip is deliberate.
3. **`lib/media-frame.ts` keeps a type-only `react` import** (03 says lib has no react; the import erases at runtime; verbatim-port beat purity — flag for the P2 sweep).

## Evidence highlights

- **/ar hello SSR** (QG-P1 criterion): `<html lang="ar" dir="rtl">`, Arabic server-rendered copy, hreflang en+ar+x-default, per-locale canonical — verified on the prod build and encoded in `e2e/foundation.spec.ts` (16/16 across en/ar × desktop/mobile).
- **PROXY-INT** (blocking suite): green — cookie survival on intl redirects, same-request propagation (re-run pattern), matcher classes with rationale, single-refresh, fault pass-through, missing-env pass-through.
- **Boundary-violation demos** (required by the phase prompt): (a) `lib→server` import → ESLint `import/no-restricted-paths` error; (b) session+`'use cache'` in one file → QG-ARCH-3 gate exit 1; (c) `VITE_` read → ENV-002 gate exit 1. All three fail exactly as designed; gates return green after cleanup.
- **PII redaction test** (SEC-007, blocking): green — emails/phones/JWTs stripped, blocked keys redacted, nested payloads scrubbed, hashed identifiers.
- **I18N-004 extraction**: 1,733 entries, **100% AR coverage, 0 leftovers** (≥95% required). Drafts at `eventies-next/src/messages/extraction/`.
- **Bundle floor**: 693 KB raw client JS (12 chunks) vs the 2,847 KB Vite baseline — the P2 budget tripwire (`docs/BUNDLE_FLOOR.md`).
- **Fonts decision** (FOUND-026): next/font/google for Alexandria/Sora/IBM Plex Sans Arabic (self-hosted, swap); Zodiak remains Fontshare CSS until vendored (P2). FOUT check vs baseline pending first visual page (P2, by design).

## BLOCKED items — exactly what is needed

| Item | Needs | Ready-to-run once provided |
|---|---|---|
| ROUTE-002..010 topology proof | Vercel access (CLI login, or: deploy `eventies-next/` as a project + one test rewrite on a Vite-project preview) | specs + procedure in `docs/ROUTE_TOPOLOGY.md`; ~1 hour |
| DBMIG-002 staging DB (+ CT-RLS/CT-RPC activation, DBMIG-003 apply) | one of 3 owner options in `docs/DBMIG_PIPELINE.md` (branching token / staging project keys / Docker) | harnesses committed, env-gated with loud skip |
| FOUND-016 live Sentry event | `SENTRY_DSN` secret | track() + scrubber wired |
| FOUND-013 headers on preview | first preview deployment | emitted + E2E-verified locally |
| FOUND-005 "failure blocks merge" | GitHub branch-protection toggle (owner) | workflow committed |

## Task table

FOUND-001..015, 018..026, 029..035: **DONE** · FOUND-016 BLOCKED (DSN) · FOUND-017 IN_PROGRESS (products/categories ported with client injection + verbatim mappings; remaining 17 services deferred to owning phases per the carry-over rule — chat/notifications P5, storage/cloudinary/asset P6, forms P3, requests/quotes P4) · FOUND-027/028 BLOCKED (staging) · PROXY-001..008 DONE · ROUTE-001 DONE, 002..010 BLOCKED · ENV-002 DONE · DBMIG-001 DONE, 002 BLOCKED, 003 IN_PROGRESS · SEC-014 DONE (**ADR-18 CLOSED**: Supabase RPC atomic counters; evaluation in `docs/ADR-18-RATE-LIMIT-STORE.md`) · A11Y-010 DONE · I18N-004 DONE · DATA-001..008 DONE · CACHE-001/002/004 DONE, CACHE-003 stays TODO (P2 integration tests).

Test-port deferrals (FOUND-006, itemized): notification-migration-contract (couples to Vite migrations dir — revisit at DBMIG close-out), image-variants/asset-session/media-invariants (page-coupled, P6), React component/hook tests (their components don't exist yet).

## New tasks proposed for the ledger

- **NEW (P2/SEO-404): ADR for real-404 strategy under cacheComponents** (from D-P1-01) — owner decision required.
- **NEW (P2): vendor Zodiak font files** (removes the last runtime third-party CSS import).

## Stop-condition check

No product page was migrated; next-intl met every hard requirement; the ROUTE topology proof did not FAIL — it could not run (access), which per the gate rule keeps P1B closed rather than escalating a failure.
