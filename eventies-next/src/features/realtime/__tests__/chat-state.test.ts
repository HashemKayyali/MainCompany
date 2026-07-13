import { describe, expect, it } from 'vitest'
import type { ChatMessageRow } from '@/shared/types/database.types'
import { chatStateFromSnapshot, ingestChatMessage, reconcileChatEcho } from '../chat-state'

function row(id: string, created_at: string, extra: Partial<ChatMessageRow> = {}): ChatMessageRow {
  return {
    id,
    conversation_id: 'c',
    sender_id: 'u',
    sender_type: 'customer',
    kind: 'text',
    quick_question_id: null,
    client_message_id: null,
    body: id,
    created_at,
    ...extra,
  }
}

describe('RD-01 chat reducer', () => {
  it('converges for duplicate and out-of-order events using server time then id', () => {
    const a = row('a', '2026-07-14T10:00:00.000Z')
    const b = row('b', '2026-07-14T10:00:00.000Z')
    const c = row('c', '2026-07-14T10:01:00.000Z')
    const state = [c, b, a, b].reduce(ingestChatMessage, chatStateFromSnapshot([]))
    expect(state.ordered.map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(state.byId.size).toBe(3)
  })

  it('reconciles optimistic row and realtime echo by client message id', () => {
    const clientId = '11111111-1111-4111-8111-111111111111'
    const optimistic = row(`optimistic:${clientId}`, '2026-07-14T10:00:00.000Z', {
      client_message_id: clientId,
    })
    const echo = row('server-id', '2026-07-14T10:00:01.000Z', { client_message_id: clientId })
    const state = reconcileChatEcho(chatStateFromSnapshot([optimistic]), echo)
    expect(state.ordered.map((item) => item.id)).toEqual(['server-id'])
  })

  it('uses bounded binary insertion instead of sorting the full list', () => {
    const rows = Array.from({ length: 1000 }, (_, index) =>
      row(String(index).padStart(4, '0'), new Date(index * 1000).toISOString())
    )
    const originalSort = Array.prototype.sort
    let sorts = 0
    Array.prototype.sort = function (...args) {
      sorts += 1
      return originalSort.apply(this, args as never)
    }
    try {
      ingestChatMessage(chatStateFromSnapshot(rows), row('new', new Date(500_500).toISOString()))
    } finally {
      Array.prototype.sort = originalSort
    }
    expect(sorts).toBe(0)
  })
})
