# PHASE 01B — AUTH COMPATIBILITY PROTOTYPE (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../07_AUTH_CONSTITUTION.md` (§PHASE 1B — the spec) · `../16_TEMPORARY_BRIDGE_LEDGER.md` · ledger AUTHP group · repo state · `git status`.

## Objective
Answer the eight strangler-auth questions AND close ADR-17 (remember-me semantics) via AUTHP-010 measurements **experimentally** with the smallest possible proof. No auth UI redesign, no login pages, no production traffic. Preview deployments only. This phase exists to de-risk R-01 (the single highest-scored auth risk) before expensive work.

## In-scope task IDs
AUTHP-001…010 · ENV-006 (OAuth preview policy). Prerequisite hard gate: ROUTE-010 PASS — the prototype MUST run through the proven topology (bridge/cookie behavior differs across rewrite layers; results outside it are invalid).

## Required analysis before editing
Read the legacy storage layout in `src/lib/supabase.ts` (key names `sb-{ref}-auth-token`, mode key `bl-auth-persistence`, both storages). The bridge must infer remember-me from which storage held the token.

## Implementation sequence
AUTHP-001 → 002 → 003 → 004 → 005 → 006 → 010 (ADR-17 measurements: ssr cookie behavior, lifetimes, browser-close, rotation, local sign-out vs server session, bridge compat, multi-tab) (**Q5 is the phase's reason to exist — measure refresh-token rotation across a real Vite tab + Next tab; do not reason from docs**) → 007 → 008 → 009.

## Security checks
Prototype routes are noindex + preview-only; no legacy keys are ever cleared (Q3/Q7 guarantee); tokens never logged.

## Tests
AU-BR suite drafted from the eight questions; each question's evidence = recorded steps + observed result committed under `reports/p1b-evidence/`.

## Completion report
`reports/PHASE_01B_REPORT.md`: per-question verdict table with evidence links; BRIDGE-01 removal spec finalized (Q8); **explicit PASS/FAIL** + ADR-17 closure text (evidence-based remember-me design for AUTH-007); if Q5 FAIL → drafted ADR-09 amendment (atomic auth-surface cutover) for human approval — do not self-approve.

## Exit criteria (QG-P1B)
All 8 answered with evidence; verdict recorded; ledger + bridge ledger updated.

## Stop conditions
Any answer requiring production traffic (design a preview-safe substitute or mark BLOCKED); Q5 ambiguous after two experiment designs → stop and escalate with data.
