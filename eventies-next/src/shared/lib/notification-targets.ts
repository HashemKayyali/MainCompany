import type { NotificationRow } from '../types/database.types'

export function isSafeInternalTarget(target: string | null | undefined): target is string {
  if (!target || target.length > 500) return false
  if (!target.startsWith('/') || target.startsWith('//')) return false
  if (/^[\u0000-\u001f]/.test(target) || /[\r\n\t]/.test(target)) return false
  return true
}

export const notificationTargets = {
  adminRentalRequest: (id: string) => `/admin/requests/rental/${encodeURIComponent(id)}`,
  adminPurchaseQuote: (id: string) => `/admin/requests/purchase_quote/${encodeURIComponent(id)}`,
  adminContactSubmission: (id: string) => `/admin/contacts?submission=${encodeURIComponent(id)}`,
  clientRequest: (requestNumber: string) => `/my-requests/${encodeURIComponent(requestNumber)}`,
  superAdminChat: (conversationId: string) =>
    `/admin/chats?conversation=${encodeURIComponent(conversationId)}`,
  clientChat: (conversationId: string) => `/?supportChat=${encodeURIComponent(conversationId)}`,
} as const

export function getNotificationFallbackTarget(
  notification: NotificationRow,
  isAdmin: boolean
): string {
  if (isSafeInternalTarget(notification.target_url)) return notification.target_url

  if (isAdmin) {
    if (notification.entity_type === 'chat_conversation') return '/admin/chats'
    if (notification.entity_type === 'contact_submission') return '/admin/contacts'
    if (
      notification.entity_type === 'rental_request' ||
      notification.entity_type === 'purchase_quote'
    ) {
      return '/admin/requests'
    }
    return '/admin/notifications'
  }

  if (
    notification.entity_type === 'rental_request' ||
    notification.entity_type === 'purchase_quote'
  ) {
    return '/my-requests'
  }

  return '/notifications'
}
