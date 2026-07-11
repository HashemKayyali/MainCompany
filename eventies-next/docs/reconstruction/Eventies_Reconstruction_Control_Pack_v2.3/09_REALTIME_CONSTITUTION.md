# 09 — REALTIME CONSTITUTION

## Transport & channels
Postgres Changes (ADR-06). Channel names are **stable per scope**: `chat:{conversationId}`, `chat-unread:{userId}`, `notifications:{userId}`, `admin-chat-inbox`. The `crypto.randomUUID()` suffixes are removed (DEL-09). A subscription-manager hook owns lifecycle: exactly one live channel per key across remounts/StrictMode; unsubscribe on last consumer.

## Reconciliation protocol (chat + notifications; the tested notification reducer is the template)
```
IDLE ─ subscribe ─▶ BUFFERING ─ snapshot fetched ─▶ REPLAY(buffer→reducer) ─▶ LIVE
LIVE ─ channel error/close ─▶ RECONNECTING ─ resubscribed ─▶ CATCHUP(refetch since watermark−60s → reducer) ─▶ LIVE
```
1. Subscribe FIRST; buffer incoming events; then fetch snapshot; then replay buffer through the reducer (closes the event-during-initial-load hole).
2. Reducers are pure + idempotent, keyed by row id; ordering by server `created_at` with id tiebreak; duplicate delivery = no-op by construction. Out-of-order unit tests are blocking.
3. Client-generated message id: uuid column on chat messages (unique index; migration file CHAT-002). Optimistic append and realtime echo reconcile on the same id; retry-safe sends (unique violation = already delivered → mark sent).
4. Timestamps: server-authoritative; client clocks never order state.
5. Reconnect recovery: watermark = max(created_at) seen; on resubscribe refetch `since watermark − 60s`, replay. Missed events beyond retention → full snapshot refetch fallback.
6. Unread counts: recomputed from server counts at LIVE entry and after mark-read; never incremented locally across reconnects; mark-all-read races resolved by reducer (event older than read-watermark = read).
7. Multi-tab: duplicate read-only streams accepted; counters converge via server counts; sends deduped by message id.
8. Cleanup: manager removes channels on scope disposal; leak test (two mount/unmount cycles → one active channel) is blocking.
