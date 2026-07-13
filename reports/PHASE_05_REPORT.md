# PHASE 05 REPORT — Realtime chat and notifications

Date: 2026-07-14 · Branch `eventies-next-reconstruction`

## Verdict

**CODE_SIDE_COMPLETE / LIVE_STAGING_GATES_BLOCKED_BY_OWNER — QG-P5 not passed.**

Group D is not cutover-ready. No Phase 5 migration was applied and no production user, message, notification, project, or domain was mutated.

## Code-side delivery

- Stable scope-key subscription manager for `chat:{conversationId}`, `chat-unread:{userId}`, `notifications:{userId}`, and future `admin-chat-inbox`; no UUID-suffixed channel names.
- Pure chat reducer keyed by row ID, ordered by server `created_at` with ID tiebreak, binary insertion, duplicate no-op, and client-ID echo reconciliation.
- Literal subscribe-first buffer→snapshot→replay protocol plus reconnect catch-up from server watermark minus 60 seconds.
- Server-recomputed chat and notification unread counts at LIVE entry and after mark-read operations.
- Additive, frozen-Vite-compatible migration files for nullable client message IDs and durable per-user message rate counters.
- Retry-safe send contract handles unique violation as already delivered after DBMIG-008 is enabled.
- Lazy chat widget, anonymous active-quick-question reads, authenticated send boundary, 4,000-character client limit, draft retention on failure, Bidi bubbles, and EN/AR/RTL UI.
- Preserved notification reducer extended with deterministic ID tiebreak; authenticated `/notifications` route, bell/badge island, filtering, mark-one/all contracts, empty/loading states.
- Production-disabled Phase 5 fixture and EN/AR desktop/mobile Playwright coverage.

## Realtime constitution conformance

| §09 rule | Code-side evidence | Live staging evidence |
|---|---|---|
| Stable scoped transport keys | `SubscriptionManager`; RT-LEAK tests | BLOCKED_BY_OWNER_STAGING |
| Subscribe→buffer→snapshot→replay | `BufferedStream`; RT-RACE duplicate/race tests | BLOCKED_BY_OWNER_STAGING |
| Pure ID reducer + server ordering | RD-01 out-of-order/duplicate/tiebreak tests | BLOCKED_BY_OWNER_STAGING |
| Client message ID and echo reconcile | nullable migration, unique sender/key index, echo test | BLOCKED_BY_OWNER_STAGING |
| Server-authoritative timestamps | reducer/server watermark only; invalid watermark test | BLOCKED_BY_OWNER_STAGING |
| Reconnect watermark−60s | RT-RC overlap/buffer tests | BLOCKED_BY_OWNER_STAGING |
| Server-recomputed unread | recount after LIVE and mark-read | BLOCKED_BY_OWNER_STAGING |
| Multi-tab convergence | shared dedup key and server recount contracts | BLOCKED_BY_OWNER_STAGING (non-blocking E2E absent) |
| Cleanup on final scope disposal | two-cycle RT-LEAK test | BLOCKED_BY_OWNER_STAGING |

## Optimistic-send flag decision

BASE-013 found no happy-path echo duplicate in the legacy client, but a real timeout-after-success retry gap. The production-ready client-ID/unique-violation path is implemented. `NEXT_PUBLIC_CHAT_OPTIMISTIC_ENABLED` remains **disabled by default** until DBMIG-008 is applied and verified on staging. This avoids sending an unknown column to the current schema and does not weaken the frozen Vite client.

## Staging/live blockers

- Apply and review `20260714000001_phase5_chat_client_message_id.sql` on Supabase staging.
- Apply and review `20260714000002_phase5_chat_message_rate_limit.sql` on Supabase staging.
- Verify RLS scope isolation with two customer accounts and a superadmin; prove no cross-conversation or cross-recipient leakage.
- Verify timeout-after-commit retry, concurrent duplicate sends, durable rate limiting, and multi-instance behavior.
- Verify initial race, forced disconnect/reconnect, retention fallback, unread convergence, mark-read races, and multi-tab convergence for chat and notifications.
- Verify authenticated quick-question/text sending, live replies, live notification insert/update, bell/page convergence, and message-rate responses.
- Human DBMIG/readiness approval and CUT-005 authorization.

## Code-side evidence at report creation

- Focused realtime and notification tests: 36 passed.
- Typecheck, ESLint, architecture/service-role gates: PASS.
- I18N coverage: PASS — 9 EN/AR domains synchronized.
- Circular dependency gate: PASS — 193 files, zero cycles.
- Production build: PASS; `/notifications` is dynamic and prior public route/cache topology is preserved.
- Phase 5 local Playwright: PASS — 16/16 across EN/AR desktop/mobile.

## Scope guard

Production was not mutated. QG-P5 is not passed. Phase 6 was not started.
