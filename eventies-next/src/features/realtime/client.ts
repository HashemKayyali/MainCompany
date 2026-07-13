import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type {
  ChatConversationRow,
  ChatMessageRow,
  ChatQuickQuestionRow,
  NotificationRow,
} from '@/shared/types/database.types'
import { SubscriptionManager, type RealtimeScopeKey } from './subscription-manager'

const supabase = getSupabaseBrowserClient()
export const subscriptions = new SubscriptionManager(supabase)

export async function getRealtimeUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function fetchLatestConversation() {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as ChatConversationRow | null
}

export async function fetchQuickQuestions() {
  const { data, error } = await supabase
    .from('chat_quick_questions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as ChatQuickQuestionRow[]
}

export async function fetchChatSnapshot(conversationId: string, since?: string | null) {
  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (since) query = query.gte('created_at', since)
  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as ChatMessageRow[]).reverse()
}

export async function startConversation(context: {
  type: string
  ref: string
  label: string
  url: string
}) {
  const { data, error } = await supabase.rpc('get_or_create_chat_conversation', {
    p_context_type: context.type,
    p_context_ref: context.ref,
    p_context_label: context.label,
    p_context_url: context.url,
  })
  if (error) throw error
  return String(data)
}

export async function sendMessage(input: {
  conversationId: string
  body: string
  kind?: 'text' | 'quick_question'
  quickQuestionId?: string | null
  clientMessageId: string
}) {
  const optimisticEnabled = process.env.NEXT_PUBLIC_CHAT_OPTIMISTIC_ENABLED === 'true'
  const payload = {
    conversation_id: input.conversationId,
    body: input.body,
    kind: input.kind ?? 'text',
    quick_question_id: input.quickQuestionId ?? null,
    ...(optimisticEnabled ? { client_message_id: input.clientMessageId } : {}),
  }
  const { data, error } = await supabase.from('chat_messages').insert(payload).select('*').single()
  if (error) {
    // 23505 means an earlier timeout/retry already committed the same client id.
    if (error.code === '23505' && optimisticEnabled) {
      const existing = await supabase
        .from('chat_messages')
        .select('*')
        .eq('client_message_id', input.clientMessageId)
        .single()
      if (!existing.error) return existing.data as ChatMessageRow
    }
    throw error
  }
  return data as ChatMessageRow
}

export async function getChatUnreadCount() {
  const { data, error } = await supabase.rpc('get_chat_unread_count')
  if (error) throw error
  return Number(data ?? 0)
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc('mark_chat_conversation_read', {
    p_conversation_id: conversationId,
  })
  if (error) throw error
  return getChatUnreadCount()
}

export async function fetchNotifications(since?: string | null) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (since) query = query.gte('created_at', since)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as NotificationRow[]
}

export async function getNotificationUnreadCount() {
  const { data, error } = await supabase.rpc('get_notification_unread_count')
  if (error) throw error
  return Number(data ?? 0)
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.rpc('mark_notification_read', { p_notification_id: id })
  if (error) throw error
  return getNotificationUnreadCount()
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc('mark_all_notifications_read')
  if (error) throw error
  return getNotificationUnreadCount()
}

export function acquireConversationChannel(
  conversationId: string,
  handlers: { onMessage: (row: ChatMessageRow) => void; onStatus: (status: string) => void }
) {
  const key: RealtimeScopeKey = `chat:${conversationId}`
  return subscriptions.acquire(
    key,
    () =>
      supabase
        .channel(key)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => handlers.onMessage(payload.new as ChatMessageRow)
        )
        .subscribe((status) => handlers.onStatus(status)) as RealtimeChannel
  )
}

export function acquireNotificationChannel(
  userId: string,
  handlers: { onRow: (row: NotificationRow) => void; onStatus: (status: string) => void }
) {
  const key: RealtimeScopeKey = `notifications:${userId}`
  return subscriptions.acquire(
    key,
    () =>
      supabase
        .channel(key)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_user_id=eq.${userId}`,
          },
          (payload) => handlers.onRow(payload.new as NotificationRow)
        )
        .subscribe((status) => handlers.onStatus(status)) as RealtimeChannel
  )
}
