import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database, Json, NotificationRow } from '../lib/database.types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export type AppNotification = NotificationRow

export type NotificationAudience = {
  clients: boolean
  admins: boolean
  superadmins: boolean
}

export type NotificationAudienceCounts = {
  clients: number
  admins: number
  superadmins: number
  total: number
}

export type SendCustomNotificationInput = {
  title: string
  message: string
  audience: NotificationAudience
  targetUrl?: string | null
  type?: string
}

export type SendCustomNotificationResult = {
  ok: boolean
  broadcastId: string
  recipientCount: number
}

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

export async function fetchRecentNotifications(limit = 30): Promise<AppNotification[]> {
  ensureSupabase()
  const safeLimit = Math.max(1, Math.min(limit, 100))
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(safeLimit)
    .returns<NotificationRow[]>()

  if (error) throw error
  return data ?? []
}

export async function fetchNotificationUnreadCount(): Promise<number> {
  ensureSupabase()
  const { data, error } = await supabase.rpc('get_notification_unread_count')
  if (error) throw error
  return Number(data ?? 0)
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  ensureSupabase()
  const { data, error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  })
  if (error) throw error
  return Boolean(data)
}

export async function markAllNotificationsRead(): Promise<number> {
  ensureSupabase()
  const { data, error } = await supabase.rpc('mark_all_notifications_read')
  if (error) throw error
  return Number(data ?? 0)
}

function asCount(value: unknown) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

export async function previewNotificationAudience(
  audience: NotificationAudience
): Promise<NotificationAudienceCounts> {
  ensureSupabase()
  const { data, error } = await supabase.rpc('preview_notification_audience', {
    p_clients: audience.clients,
    p_admins: audience.admins,
    p_superadmins: audience.superadmins,
  })
  if (error) throw error

  const result = (data ?? {}) as Record<string, unknown>
  return {
    clients: asCount(result.clients),
    admins: asCount(result.admins),
    superadmins: asCount(result.superadmins),
    total: asCount(result.total),
  }
}

export async function sendCustomNotification(
  input: SendCustomNotificationInput
): Promise<SendCustomNotificationResult> {
  ensureSupabase()
  const { data, error } = await supabase.rpc('send_custom_notification', {
    p_title: input.title.trim(),
    p_message: input.message.trim(),
    p_clients: input.audience.clients,
    p_admins: input.audience.admins,
    p_superadmins: input.audience.superadmins,
    p_target_url: input.targetUrl?.trim() || null,
    p_type: input.type?.trim() || 'custom',
  })
  if (error) throw error

  const result = (data ?? {}) as Record<string, Json | undefined>
  return {
    ok: result.ok === true,
    broadcastId: typeof result.broadcast_id === 'string' ? result.broadcast_id : '',
    recipientCount: asCount(result.recipient_count),
  }
}

export function subscribeToNotifications(
  recipientUserId: string,
  handlers: {
    onInsert: (notification: AppNotification) => void
    onUpdate: (notification: AppNotification) => void
    onReady?: () => void
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`notifications:${recipientUserId}:${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_user_id=eq.${recipientUserId}`,
      },
      payload => handlers.onInsert(payload.new as AppNotification)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_user_id=eq.${recipientUserId}`,
      },
      payload => handlers.onUpdate(payload.new as AppNotification)
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') handlers.onReady?.()
    })

  return channel
}
