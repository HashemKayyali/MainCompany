'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Bidi } from '@/components/Bidi'
import { useRealtime } from '../RealtimeProvider'

export function NotificationsView() {
  const t = useTranslations('notifications')
  const locale = useLocale()
  const { notifications, notificationUnread, loading, readNotification, readAllNotifications } =
    useRealtime()
  const [unreadOnly, setUnreadOnly] = useState(false)
  const visible = unreadOnly ? notifications.filter((row) => !row.read_at) : notifications
  if (loading) return <p role="status">{t('loading')}</p>
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-950">{t('title')}</h1>
          <p className="text-sm text-ink-500">{t('unread', { count: notificationUnread })}</p>
        </div>
        <button
          type="button"
          onClick={() => void readAllNotifications()}
          disabled={!notificationUnread}
          className="rounded-full border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-800 disabled:opacity-50"
        >
          {t('markAll')}
        </button>
      </header>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
        />
        {t('unreadOnly')}
      </label>
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-violet-200 p-10 text-center text-ink-500">
          {unreadOnly ? t('emptyUnread') : t('empty')}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => void readNotification(row.id)}
                className={`w-full rounded-2xl border p-4 text-start ${row.read_at ? 'border-violet-100 bg-white' : 'border-violet-300 bg-violet-50'}`}
              >
                <strong className="block text-ink-950">
                  <Bidi>{locale === 'ar' ? row.title_ar || row.title : row.title}</Bidi>
                </strong>
                <span className="mt-1 block text-sm text-ink-600">
                  <Bidi>{locale === 'ar' ? row.message_ar || row.message : row.message}</Bidi>
                </span>
                <time className="mt-2 block text-xs text-ink-400">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(row.created_at))}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
