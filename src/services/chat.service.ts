import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'

export type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatQuickQuestion = Database['public']['Tables']['chat_quick_questions']['Row']

export type ChatInboxItem = {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  status: 'open' | 'resolved'
  context_type: string | null
  context_ref: string | null
  context_label: string | null
  context_url: string | null
  last_message_at: string
  created_at: string
  resolved_at: string | null
  last_message_body: string
  last_message_sender_type: string
  unread_count: number
}

export type ChatContextInput = {
  type?: string | null
  ref?: string | null
  label?: string | null
  url?: string | null
}

export const FALLBACK_QUICK_QUESTIONS: ChatQuickQuestion[] = [
  {
    id: 'product_availability',
    text_en: 'I would like to check product availability for my event date.',
    text_ar: 'أود التحقق من توفر المنتج في تاريخ فعاليتي.',
    sort_order: 10,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'delivery_setup',
    text_en: 'I have a question about delivery and setup.',
    text_ar: 'لدي سؤال حول التوصيل والتركيب.',
    sort_order: 20,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'request_status',
    text_en: 'I would like to ask about the status of my request.',
    text_ar: 'أود الاستفسار عن حالة طلبي.',
    sort_order: 30,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'customization',
    text_en: 'Can this service or product be customized for my event?',
    text_ar: 'هل يمكن تخصيص هذه الخدمة أو المنتج لفعاليتي؟',
    sort_order: 40,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export async function fetchChatQuickQuestions(): Promise<ChatQuickQuestion[]> {
  const { data, error } = await supabase
    .from('chat_quick_questions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('[chat] quick questions unavailable:', error)
    return FALLBACK_QUICK_QUESTIONS
  }

  return data?.length ? data : FALLBACK_QUICK_QUESTIONS
}

export async function fetchLatestCustomerConversation(): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function getOrCreateChatConversation(context: ChatContextInput): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_chat_conversation', {
    p_context_type: context.type ?? null,
    p_context_ref: context.ref ?? null,
    p_context_label: context.label ?? null,
    p_context_url: context.url ?? null,
  })

  if (error) throw error
  if (!data) throw new Error('Could not start the conversation.')
  return data
}

export async function fetchChatConversation(id: string): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return (data ?? []).reverse()
}

export async function sendChatMessage(input: {
  conversationId: string
  body: string
  kind?: 'text' | 'quick_question'
  quickQuestionId?: string | null
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: input.conversationId,
      body: input.body,
      kind: input.kind ?? 'text',
      quick_question_id: input.quickQuestionId ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function markChatConversationRead(conversationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('mark_chat_conversation_read', {
    p_conversation_id: conversationId,
  })
  if (error) throw error
  return Boolean(data)
}

export async function fetchChatUnreadCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_chat_unread_count')
  if (error) throw error
  return Number(data ?? 0)
}

export async function fetchSuperAdminChatInbox(
  status: 'all' | 'open' | 'resolved',
  search: string
): Promise<ChatInboxItem[]> {
  const { data, error } = await supabase.rpc('get_superadmin_chat_inbox', {
    p_status: status,
    p_search: search.trim(),
  })

  if (error) throw error
  return (data ?? []).map(row => ({ ...row, unread_count: Number(row.unread_count ?? 0) })) as ChatInboxItem[]
}

export async function setChatConversationStatus(
  conversationId: string,
  status: 'open' | 'resolved'
): Promise<boolean> {
  const { data, error } = await supabase.rpc('set_chat_conversation_status', {
    p_conversation_id: conversationId,
    p_status: status,
  })
  if (error) throw error
  return Boolean(data)
}

export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: ChatMessage) => void,
  onConversationChange?: (conversation: ChatConversation) => void,
  onReady?: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`chat-conversation:${conversationId}:${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      payload => onMessage(payload.new as ChatMessage)
    )

  if (onConversationChange) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      },
      payload => onConversationChange(payload.new as ChatConversation)
    )
  }

  channel.subscribe(status => {
    if (status === 'SUBSCRIBED') onReady?.()
  })
  return channel
}
