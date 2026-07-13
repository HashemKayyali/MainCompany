import type { ChatMessageRow } from '@/shared/types/database.types'
import { serverOrder } from './stream-protocol'

export type ChatDelivery = 'pending' | 'sent' | 'failed'
export type ChatMessageView = ChatMessageRow & { delivery?: ChatDelivery }

export type ChatState = {
  byId: ReadonlyMap<string, ChatMessageView>
  ordered: readonly ChatMessageView[]
}

export const EMPTY_CHAT_STATE: ChatState = { byId: new Map(), ordered: [] }

/** Pure, idempotent reducer. Only the affected insertion point is searched. */
export function ingestChatMessage(state: ChatState, incoming: ChatMessageView): ChatState {
  const existing = state.byId.get(incoming.id)
  if (existing && existing.delivery === incoming.delivery) return state
  const next = new Map(state.byId)
  next.set(incoming.id, existing ? { ...existing, ...incoming } : incoming)
  const ordered = existing
    ? state.ordered.map((item) => (item.id === incoming.id ? next.get(incoming.id)! : item))
    : insertOrdered(state.ordered, incoming)
  return { byId: next, ordered }
}

function insertOrdered(items: readonly ChatMessageView[], incoming: ChatMessageView) {
  let low = 0
  let high = items.length
  while (low < high) {
    const mid = (low + high) >>> 1
    if (serverOrder(items[mid]!, incoming) <= 0) low = mid + 1
    else high = mid
  }
  return [...items.slice(0, low), incoming, ...items.slice(low)]
}

export function chatStateFromSnapshot(rows: ChatMessageView[]): ChatState {
  return rows.reduce(ingestChatMessage, EMPTY_CHAT_STATE)
}

export function chatWatermark(state: ChatState): string | null {
  return state.ordered.at(-1)?.created_at ?? null
}

export function reconcileChatEcho(state: ChatState, echo: ChatMessageView): ChatState {
  const optimistic = echo.client_message_id
    ? state.ordered.find((item) => item.client_message_id === echo.client_message_id)
    : undefined
  if (!optimistic || optimistic.id === echo.id) return ingestChatMessage(state, echo)
  const without = new Map(state.byId)
  without.delete(optimistic.id)
  return ingestChatMessage(
    { byId: without, ordered: state.ordered.filter((item) => item.id !== optimistic.id) },
    { ...echo, delivery: 'sent' }
  )
}
