# PHASE 07 — CUTOVER + DECOMMISSION (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../20_CUTOVER_AND_ROLLBACK_PLAN.md` (the procedure — follow literally) · `../15_DELETION_LEDGER.md` · `../16_TEMPORARY_BRIDGE_LEDGER.md` · ledger CUT/DELX groups · all phase readiness reports · repo state · `git status`.

## Objective
Execute remaining route-group cutovers per `20`, flip the catch-all + 301s, enforce CSP after the zero-violation window, execute the Deletion Ledger with per-item verification, remove BRIDGE-01 on its trigger, decommission Vite. Cutover timing decisions are human-scheduled; this phase prepares, verifies, and executes on approval.

## In-scope task IDs
CUT-002…011 (CUT-001 superseded by ROUTE group in P1) · DELX-001…005 · SEC-003 close-out · SEC-017 (CSP 'unsafe-inline' decision ⛔) · DBMIG-012 · CUT-008.

## Required analysis before editing
Verify every group's readiness report exists and its gate set passed; verify BRIDGE-01 removal trigger telemetry (adoption <1%/wk); re-run the full E2E matrix on the final preview before CUT-007.

## Implementation sequence
Verify ROUTE-009 rollback rehearsal evidence exists → group cutovers in `20` order as approved (CUT-002..006, each with smoke + 72h window) → CUT-007 catch-all + 301s + prerender-hook removal → SEC-003 close-out → SEC-017 inline audit + ⛔ decision → CUT-008 CSP enforce (final policy per SEC-017) → DELX-002 bridge removal → DELX-001 deletion ledger (item-by-item, each with its verification command output pasted into the report) → DELX-004 final GC → DELX-005 dead-code sweep → DELX-003 Vite archive/park → CUT-009 GSC close-outs → CUT-011 runbooks → CUT-010 kick FINAL.

## Security checks
CSP enforce only after 72h zero unexplained violations; 301 set reviewed against SEO constitution; deletion of DEL-06 only together with bridge removal; archive tag created BEFORE Vite decommission.

## Tests
Blocking: SMOKE per cutover; full E2E matrix at CUT-007; per-deletion verification greps/E2E from `15`; ROLL-01 rehearsal evidence exists from pre-P2.

## Completion report
`reports/PHASE_07_REPORT.md`: cutover log (timestamps, windows, alarms), deletion ledger checklist 100% with verification outputs, bridge removal evidence, CSP enforcement evidence, archive tag reference.

## Exit criteria (QG-P7)
Everything above; FINAL phase unblocked.

## Stop conditions
Any monitoring-window alarm (execute rollback per `20`, report, await re-approval); any deletion whose verification fails (restore, investigate, new task); bridge trigger not met (defer DELX-002, do not force).
