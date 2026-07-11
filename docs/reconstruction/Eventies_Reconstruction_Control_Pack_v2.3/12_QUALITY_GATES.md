# 12 — QUALITY GATES
A gate FAILS the phase; no partial credit. "Blocking" = CI-enforced where possible.

## Universal (every phase, blocking)
- QG-ARCH-1: typecheck clean (`tsc --noEmit`, strict).
- QG-ARCH-2: ESLint clean incl. import-boundary zones (`03`) + madge: zero circular deps.
- QG-ARCH-3: cache-leak grep gate — no `revalidate`/`force-cache`/`unstable_cache` in files importing session helpers; `server-only` present in every `server/` file.
- QG-ARCH-4: `scripts/audit-import-graph.mjs` — no service-role import outside `scripts/`.
- QG-TEST-1: all unit + contract tests green; new code in scope has its ledger-specified tests written.
- QG-GIT: conventional commits; one task-ID per commit message; ledger statuses updated in the same PR.

## Per-phase
| Gate set | Blocking criteria |
|---|---|
| QG-P0 | Baselines committed (SEO JSON, Lighthouse JSON ×4 routes ×2 form factors, headers curl log, env inventory, route inventory = 51 router entries reconciled); safety-net tests green (sanitizer, auth ref-stability, reducer prep); E2E skeleton runs against prod build |
| QG-P1 | Next app builds; CI pipeline green end-to-end; `/ar` hello SSR with correct lang/dir/hreflang; headers report-only live on preview (zero CSP violations in happy-path E2E); Sentry receives a test event; boundary lint proves a deliberate violation fails |
| QG-P1B | All 8 auth questions answered with recorded evidence; Q5 (dual-tab refresh rotation) measured, not reasoned; verdict + any ADR amendment written |
| QG-P2 | SEO parity gate clean for catalog group; sitemap valid XML incl. `/custom-builds`; deleted-product E2E returns HTTP 404; admin-edit→fresh-HTML E2E green (tags); LCP ≤2.5s p75 mobile on /, /products, detail (lab proxy in CI + Speed Insights post-cutover); no above-fold image >150 KB; `*_ar` migration files reviewed (NOT executed by Code) |
| QG-P3 | Auth test list (07) green incl. enumeration diff-test + redirect suite; Turnstile server-verified on 3 forms (E2E asserts server 403 without token); bridge cohort telemetry: forced re-login <2%; rate-limit events flowing |
| QG-P4 | Adversarial mutation E2Es green: double-click single-row, timeout-after-success no-dup, stale-session mid-checkout recovery; idempotency-key migrations reviewed; RPC contract tests green |
| QG-P5 | Reducer suite (out-of-order, duplicate echo, buffer-replay) green; reconnect E2E (kill socket → catchup) green; channel-leak test green; unread convergence E2E green |
| QG-P6 | Admin layout blocks non-AAL2 admin (test); recent-auth enforced on destructive ops (test); every catalog mutation fires revalidation (integration test per entity); revoked-admin mid-session denied at layout AND RPC |
| QG-P7 | Deletion ledger 100% executed with verifications; bridge removed per BRIDGE-01 trigger; CSP enforced with zero violation reports over 72h; full E2E matrix green; Vite decommission checklist done |
| QG-FINAL | Independent re-audit report (FINAL prompt) with zero Critical/High open findings; GSC stable; alert rules tested by synthetic fault |

## Specialized recurring gates
QG-SEO (parity, per cutover) · QG-RTL (AR visual snapshots ×6 templates at 360/390, tablet, 1440 widths × ar/en + gesture E2E) · QG-A11Y (axe: zero critical on top 8 templates; dialog focus order) · QG-PERF (route JS ≤ Vite baseline for the equivalent page; Lighthouse budget file) · QG-ENV (parity matrix `19` diff clean before each cutover) · QG-ROLLBACK (rewrite-restore rehearsed once on preview before first production cutover).

---
# V2.1 GATE AMENDMENTS
- **QG-GIT (replaced):** one coherent atomic change-set per commit; every commit references ≥1 task ID; no unrelated task domains in one commit; task Status updated in the same PR; checkpoint tag at every passed phase; clean rollback commits for cutover/config changes. Artificial micro-commits to satisfy task counts are a violation.
- **QG-P1 additions:** ROUTE-010 topology report PASS; PROXY-INT suite green; ADR-18 CLOSED (SEC-014); FOUND-035 version-lock committed; DBMIG pipeline + staging environment live (DBMIG-001/002); axe CI wired (A11Y-010).
- **QG-P1B additions:** prototype ran through the proven topology; ADR-17 CLOSED with runtime evidence (AUTHP-010).
- **QG-P2 amendments:** cache assertions now target the ADR-19 model — CACHE-MODEL suite green (tag attach in DAL, cacheLife TTL, new-slug on-demand, delete→404, admin-fresh vs SWR semantics). `*_ar` wave gate = DBMIG-004 STAGING-VERIFIED (not merely files written). **/ar public cutover additionally requires QG-AR-LAUNCH.**
- **QG-AR-LAUNCH (new, blocking for /ar route cutover):** 100% active category names AR; 100% active product names AR; every indexable /ar route has AR SEO title+description; description-coverage threshold met per ⛔ product-owner decision (ARB-006); human QA sample signed (ARB-009). Report: ARB-010.
- **QG-P3 amendments:** app-level limits implemented on the ADR-18 store (SEC-015) with a multi-instance concurrency test; ENV-006 OAuth-preview decision executed.
- **QG-P6 amendments:** **BYPASS suite (01..09) green on staging AND re-probed post-DBMIG-011 on prod** — direct RPC/REST calls without UI are denied per the 05 matrix; layout-gate tests remain but are explicitly non-sufficient.
- **QG-P7 amendments:** SEC-017 CSP inline decision executed (drop 'unsafe-inline' or documented exception); UPL-NEG green.
- **QG-PERF split (lab vs field):** PRE-CUTOVER (blocking): Lighthouse lab budgets, bundle analysis, image byte budgets (10-table), synthetic slow-network E2E. POST-CUTOVER (asynchronous, non-blocking for the cutover itself): Speed Insights p75 per route once traffic is sufficient — targets LCP ≤2.5s, **INP ≤200ms**, CLS ≤0.1 (Master Plan §15 adopted); regression >20% triggers the 20-plan alarm path. GSC 2-week watch is asynchronous after public cutover; it blocks only on severe indexing regression.
