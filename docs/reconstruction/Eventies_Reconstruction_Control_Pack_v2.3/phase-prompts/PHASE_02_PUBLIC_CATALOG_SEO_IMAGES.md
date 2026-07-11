# PHASE 02 — PUBLIC CATALOG + SEO + IMAGES (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../06_DATA_AND_CACHE_CONSTITUTION.md` · `../08_I18N_CONSTITUTION.md` · `../10_IMAGE_CONSTITUTION.md` · `../11_SEO_CONSTITUTION.md` · ledger groups CAT/SEO/IMG/DATA/CACHE/I18N(001-005,009-013,015-020 as scoped) · repo state · `git status`.

## Objective
Rebuild every public marketing + catalog surface as RSC with ISR/tags, the custom image loader, full metadata parity, localized `/ar` twins, real 404s, and 301s. This is a **rebuild to spec** — the Vite pages are the behavioral reference; their implementation is not copied (Constitution §1). Admin stays on Vite; `*_ar` admin fields land in P6 — this phase only creates the migration FILES and the read path.

## In-scope task IDs
DATA-001..007 · CACHE-001..005 (CACHE-005 = ADR-19 conformance suite) · CAT-001..026 · SEO-001..014 · IMG-001..014 · I18N-001,002,003,005,009,010,011,012,013,015,016,017,018,019 · DBMIG-004,005 (⛔ human gates for the `*_ar` wave) · ARB-001..010 (Arabic backfill + launch gate) · A11Y-001,002,003,004,007,008,009.
Out of scope: contact form submission (island shell only — FORM is P3); auth; anything session-reading.

## Required analysis before editing
For each page, write a 5-line spec from the Vite source (data used, states, SEO fields, islands needed) into the PR description before building. For CAT-014 gallery, read the V1 audit gallery section: progressive batches, stable keys, no reshuffle on data arrival.

## Implementation sequence
DAL+tags (DATA/CACHE) → CAT-001 shell → SEO-001 builder → static pages (CAT-016,017 + SEO-002,004) → 301s (CAT-018) → catalog (CAT-005..011 + SEO-003,006,007) → builds/customers (CAT-012,013) → gallery (CAT-014,015 + IMG-011) → home last (CAT-002,003,004 — hardest visuals) → /ar pass (CAT-020 + I18N set) → sitemap (SEO-008,009) → noindex/robots (SEO-010..012) → images sweep (IMG-002..006,009,012,013) → parity + budgets (SEO-013,014 · IMG-014 · CAT-024).

## Security checks
No session import anywhere in this phase's server code (QG-ARCH-3 proves it); migration FILES (I18N-009) flow through the DBMIG pipeline — staging apply allowed per DBMIG-002, **production execution is human-gated (DBMIG-004 ⛔)**; caching strictly per ADR-19 (`use cache`+cacheTag+cacheLife in DAL only; no route revalidate constants; no unstable_cache).

## Tests
Blocking: SEO-PAR (Group A), SEO-404, AR-DL, AR-SW, RTL-G, RTL-V, CACHE-AB probe, PERF-SL, ADM-INV precursor via /api/revalidate manual call, IMG-F (nb).

## Performance checks
Per-template JS ≤ Vite baseline equivalents; LCP lab ≤2.5s mobile on /, /products, detail; image budget table (10) verified per surface; bundle report committed.

## Completion report
`reports/PHASE_02_REPORT.md`: statuses; parity diff outcome with any approved deltas listed; AR coverage % (I18N-011); perf table vs baselines; migration files listed for human execution; new tasks.

## Exit criteria (QG-P2)
All listed gates pass incl. CACHE-MODEL suite; Group A (EN) is cutover-READY (CUT-002, human-scheduled per `../20`). **/ar cutover additionally requires QG-AR-LAUNCH (ARB-010)** — EN and AR cutover readiness are tracked separately.

## Stop conditions
Parity diff shows an unexplained regression (fix or escalate, never approve-by-self); any need to touch auth/session; discovery that a catalog page needs personalization (stop — that contradicts `06`; report).
