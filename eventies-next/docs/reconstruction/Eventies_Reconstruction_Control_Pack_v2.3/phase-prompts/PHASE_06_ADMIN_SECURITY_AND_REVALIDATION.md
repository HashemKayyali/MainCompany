# PHASE 06 — ADMIN: SECURITY SHELL + REVALIDATION (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../05_SECURITY_CONSTITUTION.md` (admin sections) · `../06_DATA_AND_CACHE_CONSTITUTION.md` (invalidation graph) · `../07_AUTH_CONSTITUTION.md` (MFA/recent-auth) · ledger ADMIN group + I18N-008,020 + SEC-012/013 + OBS-004 · repo state · `git status`.

## Objective
Server-gated admin shell (session → role → AAL2), TOTP MFA staged rollout, recent-auth for destructive ops, interiors PORTED as client pages (ADR-04 — the one sanctioned port), revalidation wired to every catalog mutation, Edge Fn hardened (signed constraints + quota). Interiors keep user-visible behavior; the shell is rebuilt.

## In-scope task IDs
ADMIN-001…029 (waves split into per-page tasks in V2.1) · I18N-008,020 · SEC-012,013,**018 (boundary DESIGN ⛔),016 (application implementation)** · DBMIG-010,011 (⛔ enforcement migration wave) · A11Y-011 · OBS-004 · IMG-010. Enforcement chain is strictly acyclic: SEC-018 design → DBMIG-010 migrations → SEC-016 implementation → ADMIN-003 UX integration + end-to-end verification.
Out of scope: redesigning admin UIs (explicitly banned this phase — behavior parity only).

## Required analysis before editing
Map each admin page's mutations → invalidation tags (one table in the PR before ADMIN-007). Confirm the approval advisory-lock path is untouched by the port (ADMIN-010).

## Implementation sequence
ADMIN-001 gate (+ADM-GATE) → ADMIN-004 superadmin parity → ADMIN-002 MFA (staged flag) → **SEC-018 design ⛔ → DBMIG-010/011 → SEC-016 → ADMIN-003 UX integration (+ADM-RA)** → ADMIN-005 wave 1 → ADMIN-007/008 revalidation (+ADM-INV) → ADMIN-006 forms+AR → ADMIN-009..012 waves → ADMIN-013 audit events → ADMIN-015/016 Edge Fn hardening → ADMIN-017 UPL-PF → ADMIN-014 revoked-admin → ADMIN-018 dictionaries → ADMIN-019 readiness.

## Security checks
Layout gate tested to block (early screen ONLY — explicitly non-sufficient): no session, non-admin role, AAL1 admin, revoked-mid-session. THE authoritative enforcement is the 05 §Destructive-Operation Boundary Matrix implemented by SEC-016 + DBMIG-010: every matrix row enforced at RPC/RLS/handler, proven by the **BYPASS-01..09 suite (blocking)** — direct raw calls without UI, ×4 personas, only AAL2+recent succeeds; Edge Fn diff reviewed against Preserve Ledger compatibility (request/response shape unchanged, params extended).

## Tests
Blocking: ADM-GATE, ADM-RA, **BYPASS-01..09 (staging, then prod re-probe post-DBMIG-011)**, ADM-INV per entity, ADMIN-014 E2E, UPL-PF, UPL-NEG, REVOKE-SEM (admin cases), quota-denial I-test, CT-RLS still green post-migrations.

## Performance checks
Admin interior bundles lazy per page (parity with current chunking intent); no admin JS in public bundles (bundle report assertion).

## Completion report
`reports/PHASE_06_REPORT.md`: statuses; mutation→tag coverage table (must be 100% of catalog mutations); MFA rollout state + reset runbook link; Edge Fn diff summary; Group E readiness verdict.

## Exit criteria (QG-P6)
All gates green; readiness approved; cutover = CUT-006.

## Stop conditions
Any admin redesign scope creep; any mutation discovered without a tag mapping (add ledger task, wire it, then proceed); MFA lockout without runbook (halt rollout flag).
