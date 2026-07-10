import type { NotificationRow } from '../database.types'
import {
  countUnreadNotificationRows,
  markAllNotificationRowsRead,
  markNotificationRowRead,
  mergeNotificationRows,
} from '../notification-state'
import {
  runStreamReducerContract,
  type StreamReducerAdapter,
} from '../../test-utils/stream-reducer-harness'

/**
 * RD-01 (BASE-011) — the existing notification reducer running on the
 * reusable stream-reducer harness. The chat reducer (CHAT-003, P5) plugs into
 * the SAME contract with duplicatePolicy 'first-write-wins' and gains the
 * whole scenario set (duplicate echo, out-of-order, buffer-replay, watermark)
 * for free. This file proves the harness against known-good behavior.
 */

const NOTIFICATION_CAP = 50

type State = NotificationRow[]

const adapter: StreamReducerAdapter<State, NotificationRow> = {
  empty: () => [],
  ingest: (state, item) => mergeNotificationRows(state, item, NOTIFICATION_CAP),
  items: state => state,
  id: item => item.id,
  timestamp: item => item.created_at,
  // mergeNotificationRows replaces the stored row with the incoming copy.
  duplicatePolicy: 'last-write-wins',
  capacity: NOTIFICATION_CAP,
  read: {
    markRead: (state, id, readAt) => markNotificationRowRead(state, id, readAt),
    markAllRead: (state, readAt) => markAllNotificationRowsRead(state, readAt),
    unreadCount: state => countUnreadNotificationRows(state),
    isRead: item => item.read_at !== null,
    withReadAt: (item, readAt) => ({ ...item, read_at: readAt }),
  },
}

function makeItem(seq: number, overrides: Partial<NotificationRow> = {}): NotificationRow {
  return {
    id: `n-${seq}`,
    recipient_user_id: 'user-a',
    type: 'custom',
    priority: 'normal',
    title: `Title ${seq}`,
    title_ar: null,
    message: `Message ${seq}`,
    message_ar: null,
    entity_type: null,
    entity_id: null,
    target_url: null,
    metadata: {},
    read_at: null,
    created_at: `2026-07-06T10:00:00.${String(seq).padStart(3, '0')}Z`,
    created_by: null,
    dedupe_key: null,
    ...overrides,
  }
}

runStreamReducerContract('notification rows (mergeNotificationRows)', adapter, { makeItem })
