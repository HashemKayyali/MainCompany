import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useChat } from '../../contexts/ChatContext'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'
import {
  fetchChatMessages,
  fetchSuperAdminChatInbox,
  markChatConversationRead,
  sendChatMessage,
  setChatConversationStatus,
  type ChatInboxItem,
  type ChatMessage,
} from '../../services/chat.service'
import UserAvatar from '../../components/ui/UserAvatar'
import { cn } from '../../utils/cn'

type InboxFilter = 'all' | 'open' | 'resolved'

function formatConversationTime(value: string, locale: 'en' | 'ar') {
  const date = new Date(value)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-US', sameDay
      ? { hour: 'numeric', minute: '2-digit' }
      : { month: 'short', day: 'numeric' }
    ).format(date)
  } catch {
    return ''
  }
}

function formatMessageTime(value: string, locale: 'en' | 'ar') {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

export default function AdminChatsPage() {
  const { locale, translateText } = useI18n()
  const [searchParams] = useSearchParams()
  const deepLinkConversationId = searchParams.get('conversation')
  const { refreshUnread } = useChat()
  const { toast } = useToast()
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [inbox, setInbox] = useState<ChatInboxItem[]>([])
  const [selected, setSelected] = useState<ChatInboxItem | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const selectedIdRef = useRef<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const conversationLoadRef = useRef(0)
  const deepLinkOpenedRef = useRef<string | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 250)
    return () => window.clearTimeout(id)
  }, [search])

  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null
  }, [selected?.id])

  const loadInbox = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingInbox(true)
    try {
      const rows = await fetchSuperAdminChatInbox(filter, debouncedSearch)
      setInbox(rows)
      setSelected(current => {
        if (!current) return current
        const updated = rows.find(item => item.id === current.id)
        return updated ?? current
      })
    } catch (error) {
      console.error('[AdminChatsPage] inbox load failed:', error)
      toast('Could not load support chats.', 'error')
    } finally {
      setLoadingInbox(false)
    }
  }, [debouncedSearch, filter, toast])

  useEffect(() => {
    void loadInbox(true)
  }, [loadInbox])

  const scheduleInboxRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) return
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null
      void loadInbox(false)
    }, 120)
  }, [loadInbox])

  const openConversation = useCallback(async (item: ChatInboxItem) => {
    const loadToken = ++conversationLoadRef.current
    selectedIdRef.current = item.id
    setSelected(item)
    setMobileChatOpen(true)
    setLoadingMessages(true)
    try {
      const nextMessages = await fetchChatMessages(item.id)
      if (loadToken !== conversationLoadRef.current || selectedIdRef.current !== item.id) return
      setMessages(nextMessages)
      await markChatConversationRead(item.id)
      await Promise.all([refreshUnread(), loadInbox(false)])
    } catch (error) {
      console.error('[AdminChatsPage] conversation load failed:', error)
      toast('Could not load this conversation.', 'error')
    } finally {
      if (loadToken === conversationLoadRef.current) setLoadingMessages(false)
    }
  }, [loadInbox, refreshUnread, toast])

  useEffect(() => {
    if (!deepLinkConversationId || loadingInbox) return
    if (deepLinkOpenedRef.current === deepLinkConversationId) return
    const target = inbox.find(item => item.id === deepLinkConversationId)
    if (!target) return
    deepLinkOpenedRef.current = deepLinkConversationId
    void openConversation(target)
  }, [deepLinkConversationId, inbox, loadingInbox, openConversation])

  useEffect(() => {
    const channel = supabase
      .channel(`superadmin-chat-inbox:${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          const message = payload.new as ChatMessage
          scheduleInboxRefresh()

          if (selectedIdRef.current === message.conversation_id) {
            setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
            if (document.visibilityState === 'visible') {
              void markChatConversationRead(message.conversation_id)
                .then(() => Promise.all([refreshUnread(), loadInbox(false)]))
                .catch(error => console.warn('[AdminChatsPage] mark read failed:', error))
            } else {
              void refreshUnread()
            }
            return
          } else if (message.sender_type === 'customer') {
            void refreshUnread()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_conversations' },
        () => scheduleInboxRefresh()
      )
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') return
        scheduleInboxRefresh()
        const conversationId = selectedIdRef.current
        if (conversationId) {
          void fetchChatMessages(conversationId)
            .then(latest => {
              if (selectedIdRef.current === conversationId) setMessages(latest)
            })
            .catch(error => console.warn('[AdminChatsPage] realtime catch-up failed:', error))
        }
      })

    const onFocus = () => {
      void loadInbox(false)
      void refreshUnread()
      const conversationId = selectedIdRef.current
      if (conversationId) {
        void fetchChatMessages(conversationId)
          .then(latest => {
            if (selectedIdRef.current === conversationId) setMessages(latest)
          })
          .catch(error => console.warn('[AdminChatsPage] focus catch-up failed:', error))
      }
    }
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
      if (refreshTimerRef.current !== null) window.clearTimeout(refreshTimerRef.current)
      void supabase.removeChannel(channel)
    }
  }, [loadInbox, refreshUnread, scheduleInboxRefresh])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, selected?.id])

  const sendReply = useCallback(async () => {
    const body = draft.trim()
    if (!selected || selected.status !== 'open' || !body || sending) return

    setSending(true)
    try {
      const message = await sendChatMessage({ conversationId: selected.id, body })
      setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
      setDraft('')
      scheduleInboxRefresh()
    } catch (error) {
      console.error('[AdminChatsPage] reply failed:', error)
      toast('Reply could not be sent. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }, [draft, scheduleInboxRefresh, selected, sending, toast])

  const changeStatus = useCallback(async (status: 'open' | 'resolved') => {
    if (!selected || statusBusy) return
    setStatusBusy(true)
    try {
      const ok = await setChatConversationStatus(selected.id, status)
      if (!ok) throw new Error('Status update rejected')
      const updated = { ...selected, status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }
      setSelected(updated)
      setInbox(current => current.map(item => item.id === updated.id ? updated : item))
      toast(status === 'resolved' ? 'Conversation resolved.' : 'Conversation reopened.', 'success')
      scheduleInboxRefresh()
    } catch (error) {
      console.error('[AdminChatsPage] status update failed:', error)
      toast('Could not update conversation status.', 'error')
    } finally {
      setStatusBusy(false)
    }
  }, [scheduleInboxRefresh, selected, statusBusy, toast])

  const filters = useMemo<Array<{ value: InboxFilter; label: string }>>(() => [
    { value: 'all', label: translateText('All') },
    { value: 'open', label: translateText('Open') },
    { value: 'resolved', label: translateText('Resolved') },
  ], [translateText])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="admin-card flex min-h-0 flex-1 overflow-hidden">
        <aside className={cn(
          'min-h-0 w-full shrink-0 border-e border-[var(--admin-border)] bg-[var(--admin-surface)] md:w-[340px] lg:w-[380px]',
          mobileChatOpen ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        )}>
          <div className="shrink-0 border-b border-[var(--admin-border)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-extrabold tracking-[-0.03em] text-[var(--admin-text)]">
                  {translateText('Support Chats')}
                </h1>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                  {translateText('Live customer conversations')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadInbox(true)}
                className="admin-icon-btn"
                aria-label={translateText('Refresh chats')}
              >
                <RefreshCw className={cn('h-4 w-4', loadingInbox && 'animate-spin')} />
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" aria-hidden="true" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={translateText('Search chats...')}
                className="admin-input !ps-9"
                dir="auto"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-[var(--admin-surface-2)] p-1">
              {filters.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    'min-h-[36px] rounded-lg px-2 text-[11px] font-extrabold transition',
                    filter === item.value
                      ? 'bg-white text-[var(--admin-accent)] shadow-sm'
                      : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingInbox && inbox.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[var(--admin-accent)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : inbox.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-sm font-extrabold text-[var(--admin-text)]">
                  {translateText(search ? 'No conversations match your search.' : 'No conversations yet')}
                </h2>
              </div>
            ) : (
              inbox.map(item => {
                const active = selected?.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openConversation(item)}
                    className={cn(
                      'flex w-full gap-3 border-b border-[var(--admin-border)] px-4 py-3.5 text-start transition',
                      active ? 'bg-[var(--admin-accent-soft)]' : 'hover:bg-[var(--admin-surface-2)]'
                    )}
                  >
                    <UserAvatar
                      name={item.customer_name}
                      email={item.customer_email}
                      className="h-11 w-11 shrink-0 rounded-2xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[var(--admin-text)]" data-i18n-skip dir="auto">
                          {item.customer_name || item.customer_email || translateText('Customer')}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold text-[var(--admin-text-muted)]">
                          {formatConversationTime(item.last_message_at, locale)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-[11px] text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">
                          {item.last_message_body || translateText('Conversation started')}
                        </p>
                        {item.unread_count > 0 && (
                          <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1.5 text-[10px] font-extrabold text-white">
                            {item.unread_count > 99 ? '99+' : item.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide',
                          item.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        )}>
                          {translateText(item.status === 'open' ? 'Open' : 'Resolved')}
                        </span>
                        {item.context_label && (
                          <span className="min-w-0 truncate text-[9px] text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">
                            {item.context_label}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <section className={cn(
          'min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-surface-2)]',
          mobileChatOpen ? 'flex' : 'hidden md:flex'
        )}>
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-base font-extrabold text-[var(--admin-text)]">
                {translateText('Select a conversation')}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--admin-text-muted)]">
                {translateText('Choose a customer chat from the list to read messages and reply live.')}
              </p>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  className="admin-icon-btn md:!hidden"
                  aria-label={translateText('Back to chats')}
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <UserAvatar
                  name={selected.customer_name}
                  email={selected.customer_email}
                  className="h-11 w-11 shrink-0 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-extrabold text-[var(--admin-text)]" data-i18n-skip dir="auto">
                    {selected.customer_name || selected.customer_email || translateText('Customer')}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-[var(--admin-text-muted)]" data-i18n-skip dir="ltr">
                    {selected.customer_email}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => void changeStatus(selected.status === 'open' ? 'resolved' : 'open')}
                  className={cn(
                    'inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-[11px] font-extrabold transition disabled:opacity-50',
                    selected.status === 'open'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                  )}
                >
                  {statusBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">
                    {translateText(selected.status === 'open' ? 'Resolve' : 'Reopen')}
                  </span>
                </button>
              </header>

              {selected.context_label && (
                <div className="shrink-0 border-b border-[var(--admin-border)] bg-violet-50/70 px-4 py-2.5 text-[11px] text-violet-800">
                  <span className="font-bold">{translateText('Related to')}:</span>{' '}
                  <span data-i18n-skip dir="auto">{selected.context_label}</span>
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-[var(--admin-accent)]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="mx-auto max-w-3xl space-y-3">
                    {messages.map(message => {
                      const fromAdmin = message.sender_type === 'superadmin'
                      return (
                        <div key={message.id} className={cn('flex', fromAdmin ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                            fromAdmin
                              ? 'rounded-br-md bg-[var(--admin-accent)] text-white'
                              : 'rounded-bl-md border border-[var(--admin-border)] bg-white text-[var(--admin-text)]'
                          )}>
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-5" data-i18n-skip dir="auto">
                              {message.body}
                            </p>
                            <div className={cn('mt-1 text-[10px]', fromAdmin ? 'text-white/70' : 'text-[var(--admin-text-muted)]')}>
                              {formatMessageTime(message.created_at, locale)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={endRef} />
                  </div>
                )}
              </div>

              {selected.status === 'resolved' ? (
                <div className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 text-center text-xs text-[var(--admin-text-muted)]">
                  {translateText('This conversation is resolved. Reopen it before sending another reply.')}
                </div>
              ) : (
                <form
                  onSubmit={event => {
                    event.preventDefault()
                    void sendReply()
                  }}
                  className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 sm:p-4"
                >
                  <div className="mx-auto flex max-w-3xl items-end gap-2">
                    <textarea
                      value={draft}
                      onChange={event => setDraft(event.target.value.slice(0, 4000))}
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          void sendReply()
                        }
                      }}
                      rows={1}
                      maxLength={4000}
                      placeholder={translateText('Type a reply...')}
                      className="admin-input max-h-32 min-h-[44px] flex-1 resize-none"
                      dir="auto"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--admin-accent)] px-3 text-xs font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label={translateText('Send reply')}
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="hidden sm:inline">{translateText('Send')}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
