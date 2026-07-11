# PHASE 01B REPORT — Auth Compatibility Prototype

Date: 2026-07-11 · Branch `eventies-next-reconstruction`

## Verdict: **BLOCKED AT THE HARD GATE — not attempted, by design.**

The phase prompt is explicit: *"Prerequisite hard gate: ROUTE-010 PASS — the prototype MUST run through the proven topology; results outside it are invalid."* ROUTE-010 is **NOT PASSED** (BLOCKED on Vercel access — `eventies-next/docs/ROUTE_TOPOLOGY.md`). Running the bridge experiments against `localhost` would produce exactly the invalid evidence the gate exists to prevent (cookie/rewrite behavior differs across the rewrite layer). **No question is answered in this report, and none will be until the gate passes.**

## What WAS built (gate-independent preparation — ready to execute)

| Artifact | Status |
|---|---|
| AUTHP-001 bridge snippet v0 (`eventies-next/src/features/auth/bridge.ts`) | authored; reads `sb-dqizzlcsioqykfeldtsj-auth-token` from both storages, infers remember-me by the EXACT legacy `getStoredPersistenceMode()` rules, adopts via `setSession`, verifies via `getUser`, **never touches legacy keys**, every failure soft |
| AUTHP-002 `/bridge-test` route + client | authored; noindex; verdict display, Q5 force-refresh instrument, Vite round-trip link; tokens never rendered/logged |
| Bridge unit layer | **10 tests green** — legacy key derivation, both-storage reads, malformed blobs, all 4 remember-me inference rules, Q1/Q3/Q4/Q6/Q7-shaped soft-failure invariants (incl. "legacy keys byte-identical after adoption") |
| Q1–Q8 + AUTHP-010 runbooks | `reports/p1b-evidence/RUNBOOKS.md` — step-level, fixture definitions, evidence format, Q5 escalation rule |
| ENV-006 (OAuth preview policy, OQ-2) | **drafted recommendation, owner decision pending:** disable OAuth on previews and run P1B with password fixtures — smaller preview attack surface, no Google console churn; enabling preview callback URIs remains the alternative if OAuth-specific bridge behavior must be measured (it does not: the bridge consumes stored tokens, not the OAuth flow) |

## Ledger status set

AUTHP-001 `IN_PROGRESS` (code+units done; preview acceptance pending gate) · AUTHP-002 `IN_PROGRESS` (same) · AUTHP-003..009, AUTHP-010 `BLOCKED:ROUTE-010 gate` · ENV-006 `BLOCKED:owner decision (recommendation drafted)`.

## To unblock (same single dependency as ROUTE-010)

Vercel access → deploy `eventies-next/` preview + one test rewrite on a Vite preview → run ROUTE-002..009 (~1 h) → if PASS, execute `RUNBOOKS.md` top-to-bottom (~2 h with the two fixtures) → fill the per-question verdict table here, close ADR-17, finalize BRIDGE-01's removal spec (Q8), and if Q5 fails, draft the ADR-09 amendment for human approval.
