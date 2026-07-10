# Eventies Reconstruction Control Pack

**Purpose:** the single engineering source of truth for rebuilding Eventies from the frozen Vite SPA into the target Next.js App Router architecture. It exists to eliminate improvisation during implementation.

**Provenance:** reconciles the repository evidence, `EVENTIES_NEXTJS_MIGRATION_ADVERSARIAL_AUDIT.md` (V1), and `EVENTIES SECOND-PASS PRINCIPAL ARCHITECTURE REVIEW` (V2). Where the two audits disagreed, the final ruling is recorded in `17_DECISION_LOG.md` and every other file conforms to it.
> `Eventies_Nextjs_Migration_Master_Plan.md` was received and fully reconciled at V2.2 — see `21_MASTER_PLAN_RECONCILIATION.md` and ADR-15 (CLOSED). **Authority order:** 1. Architecture Constitution → 2. Decision Log / ADRs → 3. Specialized Constitutions → 4. Master Task Ledger → 5. Current Phase Prompt → 6. Master Plan as historical/original planning input where not superseded. The Master Plan never overrides a newer explicit ADR.

## Division of labor
- **Claude Chat** = architecture review and planning. Owns this pack's content.
- **Claude Code** = implementation. Follows this pack. Never replaces a phase prompt with a generic "continue migration" instruction.

## Execution workflow (every session)
1. Read `00_ARCHITECTURE_CONSTITUTION.md` (short by design — re-read fully).
2. Read the current phase prompt in `phase-prompts/`.
3. Read the specialized constitutions the phase prompt lists.
4. Open `01_MASTER_TASK_LEDGER.md`; identify in-scope task IDs and their dependency state.
5. Execute ONLY the current phase. Out-of-scope work is a stop condition.
6. Run the phase's tests and gates (`12_QUALITY_GATES.md`).
7. Update the Status column in the ledger (TODO → IN_PROGRESS → DONE / BLOCKED:<reason>) — the ledger Status column is the single source of truth for progress.
8. Produce the completion report the phase prompt specifies.
9. Do not start the next phase until every exit criterion passes.

## Hard rules
- Never silently skip a task. If a task is impossible as written, mark BLOCKED with evidence and stop.
- If new work is discovered: add a task to the ledger with an ID, phase, dependencies, and a one-line justification — then continue.
- Migration execution policy: Claude Code may AUTHOR migration files; may APPLY them to local/branch/staging ONLY when the phase prompt explicitly allows (DBMIG-002); must NEVER apply production migrations — production execution is human-controlled after review + staging gates (DBMIG pipeline), with Code preparing commands/checklists; dependent features are not marked enabled until production verification is recorded.
- Legacy Vite app is in freeze: bugfix-only, no features, throughout Phases 0–6.

## Git policy (V2.1)
One coherent atomic change-set per commit; every commit references ≥1 task ID; no unrelated domains in one commit; Status updated in the same PR; checkpoint tag per passed phase; clean rollback commits for cutover/config changes. No artificial micro-commits.

## File map
`00` constitution · `01` task ledger (progress tracker) · `02` target architecture · `03` folder structure & import boundaries · `04` phase dependency map · `05`–`11` specialized constitutions (security, data/cache, auth, i18n, realtime, image, SEO) · `12` quality gates · `13` risk register · `14` preserve ledger · `15` deletion ledger · `16` bridge ledger · `17` decision log · `18` test master matrix · `19` environment parity · `20` cutover & rollback · `21` Master Plan reconciliation · `PACK_VALIDATION_REPORT.md` consistency proof · `phase-prompts/` executable phase instructions.
