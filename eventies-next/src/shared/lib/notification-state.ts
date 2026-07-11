import type { NotificationRow } from '../types/database.types'

export function mergeNotificationRows(
  current: NotificationRow[],
  incoming: NotificationRow,
  limit = 50
): NotificationRow[] {
  const withoutIncoming = current.filter((item) => item.id !== incoming.id)
  return [incoming, ...withoutIncoming]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, Math.max(1, limit))
}

export function markNotificationRowRead(
  current: NotificationRow[],
  notificationId: string,
  readAt: string
): NotificationRow[] {
  return current.map((item) =>
    item.id === notificationId && !item.read_at ? { ...item, read_at: readAt } : item
  )
}

export function markAllNotificationRowsRead(
  current: NotificationRow[],
  readAt: string
): NotificationRow[] {
  return current.map((item) => (item.read_at ? item : { ...item, read_at: readAt }))
}

export function countUnreadNotificationRows(rows: NotificationRow[]): number {
  return rows.reduce((count, item) => count + (item.read_at ? 0 : 1), 0)
}
