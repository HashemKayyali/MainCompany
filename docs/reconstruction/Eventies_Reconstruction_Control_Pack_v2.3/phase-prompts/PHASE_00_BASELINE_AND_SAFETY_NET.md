# PHASE 00 — BASELINE & SAFETY NET (Claude Code execution prompt)

## Read first (mandatory, in order)
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../11_SEO_CONSTITUTION.md` (parity procedure) · `../19_ENVIRONMENT_PARITY_MATRIX.md` · `../01_MASTER_TASK_LEDGER.md` (BASE group) · current repository state · `git status`.

## Objective
Capture the ground truth of the production Vite system and build the safety net so every later phase can prove parity or improvement. **No migration code. No Next.js code. No refactors.** The only production-affecting changes allowed are the two freeze exceptions (BASE-017, BASE-018) and the evidence-gated BASE-019.

## In-scope task IDs
BASE-001 … BASE-022 · ENV-001, ENV-003, ENV-004, ENV-005. Out of scope: everything else; any edit to src/ beyond nothing (freeze); creating a Next app (that is FOUND-001).

## Required analysis before editing
1. Run BASE-001 health check; commit the report.
2. Reconcile the 51-route inventory (BASE-002) against `src/router.tsx` and `vercel.json` — discrepancies become new ledger tasks, not silent fixes.
3. For BASE-019, grep the entire repo for `hero-bg-event.png` references and record the proof in the task note before deleting.

## Implementation sequence
BASE-001→002→(003,004,005,006 parallel)→007→008→(009,010,011 parallel)→(012,013,014)→015,016→017,018 (Vite commits, each its own PR)→019→020,021,022.

## Security checks & evidence hygiene (V2.3)
BASE-005/021 captured without printing secret values; `.env.local` values never appear in reports. **Git may contain ONLY:** sanitized Markdown reports, redacted screenshots when genuinely necessary, derived metrics, hashes/checksums, non-sensitive JSON baselines, and the scripts that generated them. **Never commit:** raw OAuth screen recordings, GSC/analytics raw exports, dashboard screenshots, environment captures, or any production-session artifacts — these live in private/access-controlled storage with a sanitized signed-off summary in git (BASE-014/015/021 rewritten accordingly). Every committed report passes a PII/secrets redaction check before commit.

## Tests
New: SAN-01, AU-RS, RD-01 harness, E2E skeleton with 2 sample specs. All must be green against the current Vite build. These are the regression contract for later phases.

## Performance checks
BASE-004 Lighthouse ×4 routes ×2 form factors committed as JSON + a drafted budget file. Do not "fix" performance issues found — record them.

## Completion report (required)
`reports/PHASE_00_REPORT.md`: task table with statuses; baseline artifact paths; discoveries (each with a new ledger task ID if actionable); the BASE-013 chat-dedup answer; open questions.

## Git
Coherent atomic change-sets; every commit references ≥1 task ID (e.g. `BASE-003: seo baseline`); freeze exceptions clearly labeled; no other Vite changes.

## Exit criteria (QG-P0)
All BASE tasks DONE or BLOCKED-with-reason; baselines committed; safety-net tests green; report delivered.

## Stop conditions
Any temptation to refactor Vite code; any missing prod access for baseline capture (mark BLOCKED, list exactly what is needed); discovery that contradicts a Decision Log entry (stop, report, await ADR amendment).
