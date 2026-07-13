'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Bidi } from '@/components/Bidi'
import { fetchQuickQuestions } from '../client'
import { useRealtime } from '../RealtimeProvider'
import type { ChatQuickQuestionRow } from '@/shared/types/database.types'

export default function ChatWidget() {
  const t = useTranslations('chat')
  const locale = useLocale()
  const router = useRouter()
  const { userId, chat, chatUnread, send, readConversation } = useRealtime()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [questions, setQuestions] = useState<ChatQuickQuestionRow[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetchQuickQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [])
  useEffect(() => {
    if (open && userId) void readConversation()
  }, [open, userId, readConversation])
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])

  const submit = async (event: FormEvent, body = draft, quickQuestionId?: string) => {
    event.preventDefault()
    const clean = body.trim()
    if (!clean || clean.length > 4000 || sending) return
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }
    setSending(true)
    setError('')
    try {
      await send(clean, quickQuestionId)
      setDraft('')
    } catch {
      setError(t('sendError'))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
        className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-violet-700 text-white shadow-xl hover:bg-violet-800"
      >
        <MessageCircle aria-hidden className="h-6 w-6" />
        {chatUnread > 0 && (
          <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-xs font-bold">
            {chatUnread}
          </span>
        )}
      </button>
      {open && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
          className="fixed bottom-4 end-4 z-50 flex h-[min(680px,calc(100dvh-2rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-violet-700 px-5 py-4 text-white">
            <h2 className="font-display text-lg font-bold">{t('title')}</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('close')}>
              <X />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {!userId && (
              <p className="rounded-2xl bg-violet-50 p-3 text-sm text-ink-700">
                {t('signInPrompt')}
              </p>
            )}
            {chat.ordered.map((message) => (
              <article
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.sender_type === 'customer' ? 'ms-auto bg-violet-700 text-white' : 'me-auto bg-violet-50 text-ink-900'}`}
              >
                <Bidi>{message.body}</Bidi>
                <time className="mt-1 block text-[10px] opacity-70">
                  {new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
                    new Date(message.created_at)
                  )}
                </time>
              </article>
            ))}
            {chat.ordered.length === 0 && (
              <p className="text-center text-sm text-ink-500">{t('empty')}</p>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-violet-100 p-3">
            {questions.map((q) => {
              const text = locale === 'ar' ? q.text_ar || q.text_en : q.text_en
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={(e) => void submit(e, text, q.id)}
                  className="shrink-0 rounded-full border border-violet-200 px-3 py-1.5 text-xs text-violet-800"
                >
                  <Bidi>{text}</Bidi>
                </button>
              )
            })}
          </div>
          <form onSubmit={submit} className="border-t border-violet-100 p-3">
            <label className="sr-only" htmlFor="chat-message">
              {t('message')}
            </label>
            <div className="flex gap-2">
              <input
                ref={input}
                id="chat-message"
                maxLength={4000}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('placeholder')}
                className="min-w-0 flex-1 rounded-full border border-violet-200 px-4 py-2 text-sm"
              />
              <button
                disabled={sending || !draft.trim()}
                aria-label={t('send')}
                className="rounded-full bg-violet-700 p-2.5 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-xs text-rose-700">
                {error}
              </p>
            )}
          </form>
        </section>
      )}
    </>
  )
}
