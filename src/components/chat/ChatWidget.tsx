import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { useI18n } from '../../contexts/LanguageContext'
import { useChat } from '../../contexts/ChatContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { supabase } from '../../lib/supabase'
import { APP_ROUTE_CHANGE_EVENT } from '../../utils/route-lifecycle'
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
  const sendingRef = useRef(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [questions, setQuestions] = useState<ChatQuickQuestion[]>(FALLBACK_QUICK_QUESTIONS)
  const endRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const openRef = useRef(open)
  const previousLocationRef = useRef(`${location.key}:${location.pathname}${location.search}${location.hash}`)
  const questionsScrollerRef = useRef<HTMLDivElement | null>(null)
  const questionDragRef = useRef({
    active: false,
    dragging: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  })
  const suppressQuestionClickRef = useRef(false)
  const questionScrollFrameRef = useRef<number | null>(null)

  useBodyScrollLock(open && isMobile)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const closeChat = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) {
      active.blur()
    }
    openRef.current = false
    setOpen(false)
  }, [])

  const openChat = useCallback(() => {
    openRef.current = true
    setOpen(true)
  }, [])

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const supportChatId = useMemo(() => new URLSearchParams(location.search).get('supportChat'), [location.search])

  useEffect(() => {
    const currentLocation = `${location.key}:${location.pathname}${location.search}${location.hash}`
    if (previousLocationRef.current === currentLocation) return

    previousLocationRef.current = currentLocation
    closeChat()
  }, [closeChat, location.hash, location.key, location.pathname, location.search])

  useEffect(() => {
    window.addEventListener(APP_ROUTE_CHANGE_EVENT, closeChat)
    return () => window.removeEventListener(APP_ROUTE_CHANGE_EVENT, closeChat)
  }, [closeChat])

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
    if (isLoggedIn && !isStaff && supportChatId) openChat()
  }, [isLoggedIn, isStaff, location.key, openChat, supportChatId])

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
      if (event.key === 'Escape') closeChat()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeChat, open])

  const visibleQuestions = useMemo(
    () => questions.filter(question => question.is_active),
    [questions]
  )

  const questionsLayoutKey = useMemo(
    () => visibleQuestions
      .map(question => `${question.id}:${question.text_en}:${question.text_ar}`)
      .join('|'),
    [visibleQuestions]
  )

  useLayoutEffect(() => {
    if (!open) return undefined
    const scroller = questionsScrollerRef.current
    if (!scroller) return undefined

    const frame = window.requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
      scroller.scrollLeft = locale === 'ar' ? maxScrollLeft : 0
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isLoggedIn, locale, open, questionsLayoutKey])

  useEffect(() => () => {
    if (questionScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(questionScrollFrameRef.current)
    }
  }, [])

  const getQuickQuestionText = useCallback((question: ChatQuickQuestion) => {
    if (locale === 'ar') {
      return question.text_ar?.trim() || translateText(question.text_en)
    }
    return question.text_en?.trim() || question.text_ar
  }, [locale, translateText])

  const handleQuestionsPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const scroller = questionsScrollerRef.current
    if (!scroller) return

    if (questionScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(questionScrollFrameRef.current)
      questionScrollFrameRef.current = null
    }

    questionDragRef.current = {
      active: true,
      dragging: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    }
    suppressQuestionClickRef.current = false
  }, [])


  const handleQuestionsPointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = questionDragRef.current
    if (!drag.active || drag.dragging || drag.pointerId !== event.pointerId) return

    drag.active = false
    drag.pointerId = -1
    suppressQuestionClickRef.current = false
  }, [])

  const handleQuestionsPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = questionDragRef.current
    const scroller = questionsScrollerRef.current
    if (!drag.active || drag.pointerId !== event.pointerId || !scroller) return

    const delta = event.clientX - drag.startX
    if (!drag.dragging && Math.abs(delta) > 6) {
      drag.dragging = true
      suppressQuestionClickRef.current = true
      scroller.setPointerCapture(event.pointerId)
    }

    if (!drag.dragging) return

    event.preventDefault()
    const targetScrollLeft = drag.scrollLeft - delta

    if (questionScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(questionScrollFrameRef.current)
    }

    questionScrollFrameRef.current = window.requestAnimationFrame(() => {
      scroller.scrollLeft = targetScrollLeft
      questionScrollFrameRef.current = null
    })
  }, [])

  const endQuestionsDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = questionDragRef.current
    const scroller = questionsScrollerRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    const wasDragging = drag.dragging
    drag.active = false
    drag.dragging = false
    drag.pointerId = -1

    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }

    if (!wasDragging) {
      suppressQuestionClickRef.current = false
      return
    }

    window.requestAnimationFrame(() => {
      suppressQuestionClickRef.current = false
    })
  }, [])

  const send = useCallback(async (
    body: string,
    kind: 'text' | 'quick_question' = 'text',
    quickQuestionId?: string
  ) => {
    const cleanBody = body.trim()
    if (!cleanBody || sendingRef.current) return

    if (!isLoggedIn) {
      const redirect = `${location.pathname}${location.search}${location.hash}`
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    sendingRef.current = true
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
      sendingRef.current = false
      setSending(false)
    }
  }, [conversation, currentUser, isLoggedIn, location.hash, location.pathname, location.search, navigate, translateText])

  if (isStaff) return null

  const mobilePanelStyle: CSSProperties | undefined = isMobile
    ? {
        bottom: 'auto',
        top: 'calc(var(--app-visual-viewport-offset-top, 0px) + max(8px, env(safe-area-inset-top)))',
        height: 'calc(var(--app-visual-viewport-height, 100dvh) - max(8px, env(safe-area-inset-top)) - max(8px, env(safe-area-inset-bottom)))',
        maxHeight: 'none',
      }
    : undefined

  return (
    <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6" data-i18n-manual>
      {open && (
        <section
          ref={panelRef}
          role="dialog"
          aria-modal={isMobile}
          aria-label={translateText('Chat with Eventies')}
          className={cn(
            'fixed bottom-[max(8px,env(safe-area-inset-bottom))] left-2 right-2 top-[max(8px,env(safe-area-inset-top))] isolate flex flex-col overflow-hidden rounded-[28px] border border-violet-100/80 bg-white shadow-[0_28px_80px_-20px_rgba(49,19,92,0.52)] sm:absolute sm:inset-auto sm:bottom-[78px] sm:right-0 sm:h-[min(680px,calc(100dvh-120px))] sm:w-[420px] sm:rounded-[30px]',
            dir === 'rtl' ? 'text-right' : 'text-left'
          )}
          dir={dir}
          style={mobilePanelStyle}
        >
          <header className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#5f1fd2_0%,#7928e8_48%,#a23fe7_100%)] px-3.5 py-3.5 text-white sm:px-5 sm:py-5">
            <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 left-16 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-3xl" />

            <div className="relative z-10 flex items-center gap-3 sm:gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/20 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md sm:h-12 sm:w-12 sm:rounded-2xl">
                <MessageCircle className="h-[22px] w-[22px]" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-[#7928e8] bg-emerald-400" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <h2 className="!m-0 !text-[15px] !font-extrabold !leading-tight !text-white sm:!text-[16px]">
                    {translateText('Eventies Support')}
                  </h2>
                  <Sparkles className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
                </div>
                <p className="!m-0 max-w-[245px] text-[10.5px] font-semibold leading-[15px] text-white/85 sm:max-w-[260px] sm:text-xs sm:leading-[18px]">
                  {translateText('Send us your question and our team will reply here.')}
                </p>
              </div>

              <button
                type="button"
                onClick={closeChat}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-white transition duration-200 hover:rotate-3 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10 sm:rounded-2xl"
                aria-label={translateText('Close chat')}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {!isLoggedIn ? (
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_38%),linear-gradient(180deg,#ffffff_0%,#fcfaff_100%)] px-5 py-7 sm:px-7">
              <div className="pointer-events-none absolute -left-16 top-24 h-40 w-40 rounded-full bg-violet-100/60 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-16 h-48 w-48 rounded-full bg-fuchsia-100/50 blur-3xl" />

              <div className="relative z-10 w-full max-w-[340px] rounded-[28px] border border-violet-100/90 bg-white/90 px-6 py-7 text-center shadow-[0_24px_70px_-32px_rgba(83,38,155,0.45)] backdrop-blur-xl sm:px-7 sm:py-8">
                <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-[linear-gradient(145deg,#f7f2ff,#eee6ff)] text-violet-700 shadow-[inset_0_1px_0_#fff,0_14px_30px_-18px_rgba(109,40,217,0.65)] ring-1 ring-violet-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100/80">
                    <MessageCircle className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="!mb-0 !mt-5 !text-[22px] !font-extrabold !leading-[1.2] !tracking-[-0.02em] !text-[#1a0b3d]">
                  {translateText('Sign in to start a conversation')}
                </h3>

                <p className="!mb-0 !mt-3 text-[13.5px] font-medium leading-6 text-[#75658d]">
                  {translateText('Your chat history stays connected to your Eventies account.')}
                </p>

                <div className="my-5 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(124,58,237,0.18),transparent)]" />

                <Link
                  to={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`}
                  className="group inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6422d8,#7c2dea_55%,#9639e8)] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_-16px_rgba(109,40,217,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-16px_rgba(109,40,217,0.95)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
                >
                  <span>{translateText('Sign in')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.06),transparent_34%),#fbf9ff] px-3 py-3.5 sm:px-4 sm:py-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-violet-700">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100">
                      <Loader2 className="h-6 w-6 animate-spin" aria-label={translateText('Loading conversation')} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="relative overflow-hidden rounded-[22px] border border-violet-100 bg-white p-[18px] shadow-[0_12px_34px_-24px_rgba(86,44,145,0.55)]">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/70 blur-2xl" />
                        <div className="relative z-10 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-[#1a0b3d]">{translateText('How can we help?')}</div>
                            <div className="mt-1 text-xs leading-5 text-[#6e5d85]">
                              {translateText('Choose a quick question or write your own message. A super admin will reply here.')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.map(message => {
                      const mine = message.sender_type === 'customer'
                      return (
                        <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[88%] rounded-[18px] px-3.5 py-2.5 shadow-[0_8px_22px_-16px_rgba(50,20,90,0.55)] sm:max-w-[84%] sm:rounded-[20px]',
                              mine
                                ? 'rounded-br-md bg-[linear-gradient(135deg,#6d28d9,#7c3aed)] text-white rtl:rounded-bl-md rtl:rounded-br-[20px]'
                                : 'rounded-bl-md border border-violet-100 bg-white text-[#1a0b3d] rtl:rounded-br-md rtl:rounded-bl-[20px]'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words text-[13px] font-medium leading-[19px] sm:leading-5" data-i18n-skip dir="auto">
                              {message.body}
                            </p>
                            <div className={cn('mt-1.5 text-[10px]', mine ? 'text-white/70' : 'text-[#8a789f]')}>
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
                <div className="flex items-start gap-2 border-t border-emerald-100 bg-emerald-50/90 px-4 py-3 text-xs leading-5 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{translateText('This conversation is resolved. Sending a new message will start a new conversation.')}</span>
                </div>
              )}

              <div className="shrink-0 border-t border-violet-100/90 bg-white/95 px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_30px_-24px_rgba(64,29,110,0.4)] backdrop-blur-xl sm:p-3">
                <div className="relative -mx-0.5 mb-2 sm:mb-2.5">
                  <div
                    ref={questionsScrollerRef}
                    onPointerDown={handleQuestionsPointerDown}
                    onPointerMove={handleQuestionsPointerMove}
                    onPointerLeave={handleQuestionsPointerLeave}
                    onPointerUp={endQuestionsDrag}
                    onPointerCancel={endQuestionsDrag}
                    className="cursor-grab select-none overflow-x-auto overscroll-x-contain [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                    aria-label={translateText('Quick questions')}
                    dir="ltr"
                  >
                    <div
                      className={cn(
                        'flex w-max min-w-full gap-2 px-0.5 py-1.5',
                        locale === 'ar' && 'flex-row-reverse'
                      )}
                    >
                      {visibleQuestions.map(question => {
                        const text = getQuickQuestionText(question)
                        return (
                          <button
                            key={question.id}
                            type="button"
                            disabled={sending}
                            onClick={() => {
                              if (suppressQuestionClickRef.current) return
                              void send(text, 'quick_question', question.id)
                            }}
                            className="max-w-[82vw] min-h-[38px] shrink-0 whitespace-normal rounded-full border border-violet-200/90 bg-violet-50/80 px-3 py-2 text-center text-[10.5px] font-extrabold leading-4 text-violet-800 transition-[background-color,border-color,box-shadow] duration-150 disabled:opacity-50 sm:max-w-[320px] sm:text-[11px] sm:hover:border-violet-300 sm:hover:bg-violet-100 sm:hover:shadow-[0_6px_16px_-12px_rgba(109,40,217,0.65)]"
                            lang={locale}
                            dir={locale === 'ar' ? 'rtl' : 'ltr'}
                          >
                            {text}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-y-0 w-6 from-white/95 to-transparent',
                      locale === 'ar'
                        ? 'left-0 bg-gradient-to-r'
                        : 'right-0 bg-gradient-to-l'
                    )}
                    aria-hidden="true"
                  />
                </div>

                {error && (
                  <div className="mb-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={event => {
                    event.preventDefault()
                    void send(draft)
                  }}
                  className="flex items-end gap-1.5 sm:gap-2"
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
                    className="min-h-[44px] max-h-28 flex-1 resize-none rounded-[17px] border border-violet-200 bg-[#fcfaff] px-3.5 py-[11px] text-[16px] text-[#1a0b3d] outline-none transition placeholder:text-[#8a789f] focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:min-h-[46px] sm:rounded-2xl sm:py-3 sm:text-[13px]"
                    dir="auto"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[17px] bg-[linear-gradient(135deg,#6422d8,#8534ec)] text-white shadow-[0_12px_24px_-14px_rgba(109,40,217,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_rgba(109,40,217,0.95)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-45 sm:h-[46px] sm:w-[46px] sm:rounded-2xl"
                    aria-label={translateText('Send message')}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send
                        className="h-4 w-4"
                        style={locale === 'ar' ? { transform: 'scaleX(-1)' } : undefined}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          if (open) {
            closeChat()
            return
          }
          openChat()
        }}
        className={cn(
          open && isMobile && 'hidden',
          'group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(135deg,#6422d8,#8432eb_58%,#a23fe7)] text-white shadow-[0_18px_44px_-12px_rgba(109,40,217,0.68)] transition duration-200 hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:h-16 sm:w-16'
        )}
        aria-label={open ? translateText('Close chat') : translateText('Chat with Eventies')}
        aria-expanded={open}
      >
        <span className="absolute inset-[5px] rounded-full border border-white/10" aria-hidden="true" />
        {open ? <X className="relative z-10 h-6 w-6" /> : <MessageCircle className="relative z-10 h-6 w-6 transition-transform duration-200 group-hover:scale-110" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
