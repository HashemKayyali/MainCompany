import { describe, expect, it } from 'vitest'
import type { NotificationRow } from '../../types/database.types'
import {
  countUnreadNotificationRows,
  markAllNotificationRowsRead,
  markNotificationRowRead,
  mergeNotificationRows,
} from '../notification-state'
import {
  getNotificationFallbackTarget,
  isSafeInternalTarget,
  notificationTargets,
} from '../notification-targets'

function row(id: string, overrides: Partial<NotificationRow> = {}): NotificationRow {
  return {
    id,
    recipient_user_id: 'user-a',
    type: 'custom',
    priority: 'normal',
    title: `Title ${id}`,
    title_ar: null,
    message: `Message ${id}`,
    message_ar: null,
    entity_type: null,
    entity_id: null,
    target_url: null,
    metadata: {},
    read_at: null,
    created_at: `2026-07-06T10:00:0${id === 'b' ? '2' : id === 'c' ? '3' : '1'}.000Z`,
    created_by: null,
    dedupe_key: null,
    ...overrides,
  }
}

describe('notification state helpers', () => {
  it('merges a new realtime row at the correct chronological position', () => {
    expect(mergeNotificationRows([row('a')], row('b')).map(item => item.id)).toEqual(['b', 'a'])
  })

  it('does not double-count a duplicate realtime delivery', () => {
    const current = [row('a'), row('b')]
    const updated = row('b', { read_at: '2026-07-06T10:10:00.000Z' })
    const merged = mergeNotificationRows(current, updated)
    expect(merged.filter(item => item.id === 'b')).toHaveLength(1)
    expect(merged.find(item => item.id === 'b')?.read_at).toBe(updated.read_at)
  })

  it('marks only the selected recipient row read', () => {
    const rows = [row('a'), row('b')]
    const next = markNotificationRowRead(rows, 'a', '2026-07-06T11:00:00.000Z')
    expect(next.find(item => item.id === 'a')?.read_at).not.toBeNull()
    expect(next.find(item => item.id === 'b')?.read_at).toBeNull()
  })

  it('preserves an existing read timestamp', () => {
    const original = '2026-07-06T09:00:00.000Z'
    const next = markNotificationRowRead([row('a', { read_at: original })], 'a', '2026-07-06T11:00:00.000Z')
    expect(next[0].read_at).toBe(original)
  })

  it('mark-all affects only the supplied current-recipient rows', () => {
    const next = markAllNotificationRowsRead([row('a'), row('b')], '2026-07-06T11:00:00.000Z')
    expect(next.every(item => item.read_at !== null)).toBe(true)
  })

  it('counts unread rows correctly', () => {
    expect(countUnreadNotificationRows([row('a'), row('b', { read_at: '2026-07-06T11:00:00.000Z' })])).toBe(1)
  })
})

describe('notification targets', () => {
  it.each([
    '/notifications',
    '/admin/requests/rental/123',
    '/admin/chats?conversation=abc',
    '/?supportChat=abc',
  ])('accepts safe internal target %s', target => {
    expect(isSafeInternalTarget(target)).toBe(true)
  })

  it.each([
    'https://example.com',
    '//example.com/path',
    'javascript:alert(1)',
    '/safe\njavascript:alert(1)',
    '',
  ])('rejects unsafe target %s', target => {
    expect(isSafeInternalTarget(target)).toBe(false)
  })

  it('builds exact admin chat deep links', () => {
    expect(notificationTargets.superAdminChat('abc def')).toBe('/admin/chats?conversation=abc%20def')
  })

  it('builds exact client chat deep links', () => {
    expect(notificationTargets.clientChat('abc def')).toBe('/?supportChat=abc%20def')
  })

  it('falls back safely when a stored target is unsafe', () => {
    const notification = row('a', {
      target_url: 'https://evil.example',
      entity_type: 'rental_request',
    })
    expect(getNotificationFallbackTarget(notification, true)).toBe('/admin/requests')
    expect(getNotificationFallbackTarget(notification, false)).toBe('/my-requests')
  })
})
