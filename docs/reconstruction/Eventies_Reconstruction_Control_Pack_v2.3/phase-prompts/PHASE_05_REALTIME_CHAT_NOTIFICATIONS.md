# PHASE 05 — REALTIME: CHAT + NOTIFICATIONS (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../09_REALTIME_CONSTITUTION.md` (the protocol — implement it literally) · ledger CHAT/NOTIF groups + I18N-007,016 · BASE-012/013 evidence · repo state · `git status`.

## Objective
Rebuild chat and notifications on the reliability protocol: subscription manager (stable channels), buffer→snapshot→replay, id-keyed idempotent reducers, client message ids, reconnect catchup, server-recomputed unread. The tested notification reducer is PRESERVED and extended — chat adopts its pattern, not a new invention.

## In-scope task IDs
CHAT-001…010 · NOTIF-001…005 · DBMIG-008,009 (⛔ human gates for message-id/rate wave).
Out of scope: superadmin chat inbox page (P6 ADMIN-011 — but CHAT-001's manager must already support its scope key).

## Required analysis before editing
Re-read BASE-013's dedup answer; it decides whether the optimistic path ships enabled or behind a flag initially. Map the anon quick-questions path (RLS-scoped) and preserve it exactly.

## Implementation sequence
CHAT-002/009 migration files → CHAT-001 manager (+RT-LEAK) → CHAT-003 reducer (+RD-01 chat cases) → CHAT-004 buffer/replay (+RT-RACE) → CHAT-005 optimistic/echo → CHAT-006 reconnect (+RT-RC) → CHAT-007 unread → CHAT-008 widget → CHAT-010 AR/Bidi → NOTIF-001..004 → NOTIF-005 readiness.

## Security checks
Channel scopes match RLS scopes (no broad user-side subscription); message-length limits enforced client+DB; msg-rate limit file (CHAT-009) additive and frozen-Vite-safe.

## Tests
Blocking: RT-LEAK, RD-01 (chat), RT-RACE, RT-RC (chat+notif), unread-convergence E2E. Multi-tab convergence E2E non-blocking but reported.

## Performance checks
Widget bundle lazy (not in catalog-page JS); reducer work bounded (no full-list re-sorts per event — assert in unit test).

## Completion report
`reports/PHASE_05_REPORT.md`: statuses; protocol-conformance checklist (one row per §09 rule with test evidence); flag decision for optimistic path; Group D readiness verdict.

## Exit criteria (QG-P5)
All gates green; readiness approved; cutover = CUT-005.

## Stop conditions
Any uuid-suffixed channel name appearing in new code; reducer state mutated outside the reducer; reconnect design that trusts client clocks.
