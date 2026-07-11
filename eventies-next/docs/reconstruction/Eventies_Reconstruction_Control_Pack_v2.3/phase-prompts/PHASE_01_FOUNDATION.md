# PHASE 01 — FOUNDATION (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../03_TARGET_FOLDER_STRUCTURE.md` · `../05_SECURITY_CONSTITUTION.md` (headers) · `../06_DATA_AND_CACHE_CONSTITUTION.md` · `../08_I18N_CONSTITUTION.md` · `../01_MASTER_TASK_LEDGER.md` (FOUND + I18N-004/005 prep + DATA/CACHE foundations) · repo state · `git status`.

## Objective
Stand up the Next.js 16 architecture skeleton (current stable 16.x, version-locked per ADR-16/FOUND-035) with every guardrail active BEFORE product pages exist: boundaries, CI, clients, i18n plumbing, schemas, headers (report-only), observability, DAL/tag scaffolding. **Do not migrate product pages.** A page exists only as needed to prove plumbing (`/ar` hello, sample error page).

## In-scope task IDs
FOUND-001…035 · ROUTE-001…010 (topology proof — a P1 exit requirement) · PROXY-001…008 · ENV-002 · DBMIG-001..003 · SEC-014 (ADR-18 closure) · A11Y-010 · DATA-001..008 & CACHE-001..004 scaffolds (implementations may carry into P2 where page-coupled) · I18N-004 extraction script (data prep only).
Out of scope: any (marketing)/(catalog) real page; auth UI; forms.

## Required analysis before editing
Confirm the folder plan against `03` before generating; list any deviation as a proposal in the report, not as silent structure. Verify preserved test files (FOUND-006) are framework-free before porting; page-coupled ones are deferred with a note.

## Implementation sequence
FOUND-001..005 (skeleton+CI) → 007,019 (boundaries) → 008,009 (clients) → 010,011,029 (i18n [locale] architecture per 03) → PROXY-001..008 + 012 (composed proxy.ts) → ROUTE-001..010 (topology proof) → 013 (headers RO) → 014,031 (schemas/env) → 015,016 (errors/obs) → 017,018 (services port + contracts) → 020,021 (tags+revalidate) → 022,023,024,025,026,032 (loader/Bidi/UI/tailwind/fonts) → 027,028 (RLS/RPC suites) → 030,033,034 → I18N-004 → DATA/CACHE scaffolds.

## Security checks
`server-only` in every server/ file; QG-ARCH-3/4 gates wired and demonstrably failing on a deliberate violation (include the demo in the report); PII redaction test green; no secret values in code or logs.

## Tests
Preserved 17-file suite green in new repo (or itemized deferrals); CT-RLS + CT-RPC harnesses green; I18N-COV wired; unit tests for sanitizer-port pending P3 (do not port auth yet).

## Performance checks
Empty-app bundle report committed (the floor for later budgets); font strategy decision recorded with FOUT check vs baseline.

## Completion report
`reports/PHASE_01_REPORT.md`: task statuses; boundary-violation demo evidence; extraction-script coverage % (I18N-004); deviations proposed; new tasks added.

## Exit criteria (QG-P1)
Build+CI green end-to-end; `/ar` hello SSR correct lang/dir/hreflang through the [locale] segment; PROXY-INT suite green; **ROUTE-010 topology report PASS** (P1B is blocked without it); ADR-18 CLOSED via SEC-014; FOUND-035 version-lock committed; DBMIG pipeline + staging DB live; headers report-only on preview with zero happy-path violations; Sentry test event received; deliberate boundary violation fails CI.

## Stop conditions
Any product-page migration urge; next-intl blocking a hard requirement (stop → ADR-03 revisit note); ROUTE topology proof failing on any dimension (stop → escalate with evidence; P1B must not start); attempting rate-limit store implementation before ADR-18 closes; missing env access for preview.
