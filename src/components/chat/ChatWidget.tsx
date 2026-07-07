import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Send, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { useI18n } from '../../contexts/LanguageContext'
import { useChat } from '../../contexts/ChatContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { supabase } from '../../lib/supabase'
import {
  FALLBACK_QUICK_QUESTIONS,
  fetchChatConversation,
  fetchChatMessages,
  fetchChatQuickQuestions,
  fetchLatestCustomerConversation,
  getOrCreateChatConversation,
  markChatConversationRead,
  sendChatMessage,
  subscribeToConversation,
  type ChatConversation,
  type ChatMessage,
  type ChatQuickQuestion,
} from '../../services/chat.service'
import { cn } from '../../utils/cn'

function getPageContext(pathname: string) {
  const clean = pathname.replace(/\/$/, '') || '/'
  const productMatch = clean.match(/^\/products\/([^/]+)$/)
  const requestMatch = clean.match(/^\/my-requests\/([^/]+)$/)

  if (productMatch) {
    return {
      type: 'product',
      ref: productMatch[1],
      label: document.title || 'Product details',
      url: clean,
    }
  }

  if (requestMatch) {
    return {
      type: 'request',
      ref: requestMatch[1],
      label: `Request ${requestMatch[1]}`,
      url: clean,
    }
  }

  return {
    type: 'page',
    ref: clean,
    label: document.title || 'Eventies',
    url: clean,
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

export default function ChatWidget() {
  const { currentUser, isLoggedIn } = useUser()
  const { locale, dir, translateText } = useI18n()
  const { unreadCount, refreshUnread } = useChat()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [questions, setQuestions] = useState<ChatQuickQuestion[]>(FALLBACK_QUICK_QUESTIONS)
  const endRef = useRef<HTMLDivElement | null>(null)
  const openRef = useRef(open)

  useBodyScrollLock(open && isMobile)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const supportChatId = useMemo(() => new URLSearchParams(location.search).get('supportChat'), [location.search])

  const loadConversation = useCallback(async () => {
    if (!isLoggedIn || isStaff) return
    setLoading(true)
    setError('')
    try {
      const [requested, latest, nextQuestions] = await Promise.all([
        supportChatId ? fetchChatConversation(supportChatId) : Promise.resolve(null),
        fetchLatestCustomerConversation(),
        fetchChatQuickQuestions(),
      ])
      const target = requested ?? latest
      setQuestions(nextQuestions)
      setConversation(target)
      setMessages(target ? await fetchChatMessages(target.id) : [])
    } catch (cause) {
      console.error('[ChatWidget] load failed:', cause)
      setError(translateText('Could not load the conversation. Please try again.'))
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, isStaff, supportChatId, translateText])

  useEffect(() => {
    if (isLoggedIn && !isStaff) void loadConversation()
  }, [isLoggedIn, isStaff, loadConversation])

  useEffect(() => {
    if (isLoggedIn && !isStaff && supportChatId) setOpen(true)
  }, [isLoggedIn, isStaff, supportChatId])

  useEffect(() => {
    if (!conversation || isStaff) return undefined

    const channel = subscribeToConversation(
      conversation.id,
      message => {
        setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
        if (openRef.current && document.visibilityState === 'visible' && message.sender_type === 'superadmin') {
          void markChatConversationRead(conversation.id).then(() => refreshUnread())
        }
      },
      nextConversation => setConversation(nextConversation),
      () => {
        void fetchChatMessages(conversation.id)
          .then(latest => setMessages(latest))
          .catch(error => console.warn('[ChatWidget] realtime catch-up failed:', error))
      }
    )

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversation?.id, isStaff, refreshUnread])

  useEffect(() => {
    if (!open || !conversation) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    if (document.visibilityState !== 'visible') return
    void markChatConversationRead(conversation.id)
      .then(() => refreshUnread())
      .catch(error => console.warn('[ChatWidget] mark read failed:', error))
  }, [conversation, messages.length, open, refreshUnread])

  useEffect(() => {
    if (!conversation || isStaff) return undefined

    const catchUp = () => {
      if (document.visibilityState !== 'visible') return
      void fetchChatMessages(conversation.id)
        .then(latest => setMessages(latest))
        .catch(error => console.warn('[ChatWidget] catch-up failed:', error))
    }

    document.addEventListener('visibilitychange', catchUp)
    window.addEventListener('focus', catchUp)
    return () => {
      document.removeEventListener('visibilitychange', catchUp)
      window.removeEventListener('focus', catchUp)
    }
  }, [conversation?.id, isStaff])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const visibleQuestions = useMemo(
    () => questions.filter(question => question.is_active),
    [questions]
  )

  const send = useCallback(async (
    body: string,
    kind: 'text' | 'quick_question' = 'text',
    quickQuestionId?: string
  ) => {
    const cleanBody = body.trim()
    if (!cleanBody || sending) return

    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}${location.hash}`
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    setSending(true)
    setError('')
    try {
      let target = conversation
      if (!target || target.status === 'resolved') {
        const id = await getOrCreateChatConversation(getPageContext(location.pathname))
        const fresh = await fetchLatestCustomerConversation()
        target = fresh && fresh.id === id ? fresh : {
          id,
          customer_id: currentUser!.id,
          status: 'open',
          context_type: null,
          context_ref: null,
          context_label: null,
          context_url: location.pathname,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolved_at: null,
          resolved_by: null,
        }
        setConversation(target)
        setMessages([])
      }

      const message = await sendChatMessage({
        conversationId: target.id,
        body: cleanBody,
        kind,
        quickQuestionId: quickQuestionId ?? null,
      })

      setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
      setDraft('')
    } catch (cause) {
      console.error('[ChatWidget] send failed:', cause)
      setError(translateText('Your message could not be sent. Please try again.'))
    } finally {
      setSending(false)
    }
  }, [conversation, currentUser, isLoggedIn, location.hash, location.pathname, location.search, navigate, sending, translateText])

  if (isStaff) return null

  return (
    <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6" data-i18n-manual>
      {open && (
        <section
          role="dialog"
          aria-modal={isMobile}
          aria-label={translateText('Chat with Eventies')}
          className={cn(
            'fixed inset-0 flex flex-col overflow-hidden bg-white shadow-2xl sm:absolute sm:inset-auto sm:bottom-[72px] sm:right-0 sm:h-[min(640px,calc(100dvh-120px))] sm:w-[390px] sm:rounded-[24px] sm:border sm:border-violet-200',
            dir === 'rtl' ? 'text-right' : 'text-left'
          )}
          dir={dir}
        >
          <header className="flex items-center gap-3 border-b border-violet-100 bg-[linear-gradient(135deg,#7126e3,#9d4edd)] px-4 py-4 text-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-extrabold">{translateText('Eventies Support')}</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-white/80">
                {translateText('Send us your question and our team will reply here.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={translateText('Close chat')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          {!isLoggedIn ? (
            <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                <MessageCircle className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#1a0b3d]">
                {translateText('Sign in to start a conversation')}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#6b5a82]">
                {translateText('Your chat history stays connected to your Eventies account.')}
              </p>
              <Link
                to={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-violet-700 px-6 text-sm font-bold text-white transition hover:bg-violet-800"
              >
                {translateText('Sign in')}
              </Link>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbf9ff] px-4 py-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-violet-700">
                    <Loader2 className="h-6 w-6 animate-spin" aria-label={translateText('Loading conversation')} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="rounded-2xl border border-violet-100 bg-white p-4 text-sm leading-6 text-[#4f3d66] shadow-sm">
                        <div className="font-bold text-[#1a0b3d]">{translateText('How can we help?')}</div>
                        <div className="mt-1 text-xs leading-5">
                          {translateText('Choose a quick question or write your own message. A super admin will reply here.')}
                        </div>
                      </div>
                    )}

                    {messages.map(message => {
                      const mine = message.sender_type === 'customer'
                      return (
                        <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                              mine
                                ? 'rounded-br-md bg-violet-700 text-white rtl:rounded-bl-md rtl:rounded-br-2xl'
                                : 'rounded-bl-md border border-violet-100 bg-white text-[#1a0b3d] rtl:rounded-br-md rtl:rounded-bl-2xl'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-5" data-i18n-skip dir="auto">
                              {message.body}
                            </p>
                            <div className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-[#8a789f]')}>
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

              {conversation?.status === 'resolved' && (
                <div className="flex items-start gap-2 border-t border-violet-100 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{translateText('This conversation is resolved. Sending a new message will start a new conversation.')}</span>
                </div>
              )}

              <div className="border-t border-violet-100 bg-white p-3">
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {visibleQuestions.map(question => {
                    const text = locale === 'ar' ? question.text_ar : question.text_en
                    return (
                      <button
                        key={question.id}
                        type="button"
                        disabled={sending}
                        onClick={() => void send(text, 'quick_question', question.id)}
                        className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-800 transition hover:border-violet-400 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {text}
                      </button>
                    )
                  })}
                </div>

                {error && (
                  <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={event => {
                    event.preventDefault()
                    void send(draft)
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={draft}
                    onChange={event => setDraft(event.target.value.slice(0, 4000))}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void send(draft)
                      }
                    }}
                    rows={1}
                    maxLength={4000}
                    placeholder={translateText('Type your message...')}
                    className="min-h-[44px] max-h-28 flex-1 resize-none rounded-2xl border border-violet-200 bg-[#fbf9ff] px-3.5 py-3 text-[13px] text-[#1a0b3d] outline-none transition placeholder:text-[#8a789f] focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    dir="auto"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={translateText('Send message')}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={cn(open && isMobile && 'hidden', 'relative flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7126e3,#9d4edd)] text-white shadow-[0_16px_38px_-10px_rgba(113,38,227,0.65)] transition hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:h-16 sm:w-16')}
        aria-label={open ? translateText('Close chat') : translateText('Chat with Eventies')}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-extrabold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
