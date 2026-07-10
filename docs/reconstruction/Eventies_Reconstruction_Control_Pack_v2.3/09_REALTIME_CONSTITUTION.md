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

---
## P0 evidence notes (BASE-012 / BASE-013 — 2026-07-11, code-level capture at f1d441a4)

**Subscription lifecycle sites found: 4 Supabase Realtime channels + 1 auth listener** (the ledger's "5 sites" reconciles only if the `supabase.auth.onAuthStateChange` listener in `SessionContext.tsx:77` is counted; there are exactly 4 `.channel(` call sites):

| # | Site | Channel key | Scope / filter | Cleanup | Catch-up |
|---|---|---|---|---|---|
| 1 | `src/contexts/ChatContext.tsx:53` | `chat-unread:{userId}` (stable — the only non-UUID key) | INSERT `chat_messages`, filter `sender_type=eq.{counterpart}` | removeChannel on effect cleanup | visibility+focus → RPC recount |
| 2 | `src/components/chat/ChatWidget.tsx:169` → `chat.service.ts:203` | `chat-conversation:{id}:{uuid}` | INSERT `chat_messages` filter conversation; UPDATE `chat_conversations` | removeChannel | full refetch on SUBSCRIBED + visibility/focus |
| 3 | `src/pages/admin/AdminChatsPage.tsx:148` | `superadmin-chat-inbox:{uuid}` | INSERT `chat_messages` (UNFILTERED — every message in the system) + UPDATE `chat_conversations` | removeChannel | inbox refresh + selected-conversation refetch on SUBSCRIBED/focus |
| 4 | `src/contexts/NotificationContext.tsx:98` → `notifications.service.ts:134` | `notifications:{userId}:{uuid}` | INSERT `notifications` filter recipient | removeChannel | (reducer merge; refetch on reconnect not observed) |

Observed semantics vs this constitution: no buffering — every site subscribes and separately fetches a snapshot; ChatWidget/AdminChats close the load-race hole by refetching AFTER `SUBSCRIBED` fires (approximation of §1, adequate but replace with buffer→replay per protocol). UUID-suffixed keys confirm DEL-09 target. Unread counts are already server-recomputed (RPC `get_chat_unread_count`) — §6 conserved.

**BASE-013 answer — does chat echo duplicate today? NO (by id-keyed guards):**
- `sendChatMessage` inserts and returns the server row (`insert(…).select().single()`); there is **no optimistic temp-id append** — the message renders only after the server responds.
- Sender append is guarded: `current.some(item => item.id === message.id) ? current : append` — `ChatWidget.tsx:172` (customer), `AdminChatsPage.tsx:158` and `:222` (superadmin). The realtime echo of one's own insert reconciles on the server id in either arrival order.
- **Residual duplicate risk (drives CHAT-002 urgency = real but bounded):** a timeout-after-success retry re-inserts with a NEW server id — two legitimate rows, invisible to id-dedup. No client message id exists today (`chat_messages` insert carries only conversation_id/body/kind/quick_question_id). CHAT-002's client-uuid + unique index is the correct fix; urgency: medium (needs a user retry during a narrow failure window), not "already broken in the happy path".
- Runtime two-account probe not performed (needs customer+superadmin test credentials — listed in PHASE_00_REPORT open items); the code paths above are unambiguous for the echo question.
