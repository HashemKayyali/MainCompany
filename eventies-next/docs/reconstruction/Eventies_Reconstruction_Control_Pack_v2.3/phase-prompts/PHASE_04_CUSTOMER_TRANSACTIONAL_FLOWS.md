# PHASE 04 — CUSTOMER TRANSACTIONAL FLOWS (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../06_DATA_AND_CACHE_CONSTITUTION.md` (personal = no-store) · `../07_AUTH_CONSTITUTION.md` · ledger REQ group + DATA-008 + I18N (account scope) · repo state · `git status`.

## Objective
Rebuild cart → checkout → rental requests, purchase quotes, my-requests, order summary, profile. The RPC contracts are PRESERVED (Preserve Ledger) — this phase treats every mutation as a distributed-reliability problem: idempotency keys, double-submit, timeout-after-success, stale-session recovery. Migration FILES only for the new columns/CHECKs; humans execute them.

## In-scope task IDs
REQ-001…019 · DATA-008 · DBMIG-006,007 (⛔ human gates for idempotency/CHECK wave) · I18N-006 application · A11Y-012 · BFC/DBT test tasks.
Out of scope: chat/notifications (P5); admin request handling (P6).

## Required analysis before editing
Trace the current request submission path end-to-end (cart context → checkout page → RPC) and write the behavioral spec incl. draft-survival semantics (REQ-008) before rebuilding. Verify which DB CHECKs already exist (REQ-005 evidence step) — do not duplicate constraints blindly.

## Implementation sequence
REQ-003/004/005 migration files first (unblock everything) → REQ-001/002 contexts scoped to (commerce) → REQ-013 schemas → REQ-006 checkout → REQ-007 quotes → REQ-008 draft semantics → REQ-009..011 my-requests set → REQ-012 profile → REQ-015..017 resilience cases → REQ-018 AR pass → REQ-014 contract extension → REQ-019 readiness.

## Security checks
Every route in this phase sits under the session-gate layout (AUTH-015); all personal fetches no-store (CACHE-AB probe re-run on this group); RPC calls carry idempotency keys; no privileged operation added client-side.

## Tests
Blocking: MUT-DC (all three flows), MUT-TO, MUT-SS, DBT-01, CT-RPC extended, CACHE-AB. Non-blocking: BFC-01.

## Performance checks
My-requests list render ≤ baseline; no request waterfall regressions (server fetch batches parallel).

## Completion report
`reports/PHASE_04_REPORT.md`: statuses; adversarial-test evidence table (double-click/timeout screenshots or logs); migration files listed for execution; Group C readiness verdict.

## Exit criteria (QG-P4)
All gates green; readiness approved; cutover = CUT-004.

## Stop conditions
Any temptation to change an RPC signature (Preserve Ledger violation — propose a new optional param via ADR note instead); idempotency wave not yet STAGING-VERIFIED (DBMIG-006) when integration tests need it — staging tests may proceed after DBMIG-002 staging apply; production-dependent steps stay BLOCKED until DBMIG-007.
