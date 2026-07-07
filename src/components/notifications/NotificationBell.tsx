import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  ClipboardList,
  FileText,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { getNotificationFallbackTarget } from '../../lib/notification-targets'
import type { AppNotification } from '../../services/notifications.service'
import { cn } from '../../utils/cn'

function iconForNotification(type: string) {
  if (type.includes('chat')) return MessageCircle
  if (type.includes('contact')) return Mail
  if (type.includes('rental')) return ClipboardList
  if (type.includes('quote')) return FileText
  if (type === 'custom') return Send
  return Bell
}

function relativeTime(value: string, locale: 'en' | 'ar') {
  const date = new Date(value)
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absolute = Math.abs(diffSeconds)
  const formatter = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', { numeric: 'auto' })

  if (absolute < 60) return formatter.format(diffSeconds, 'second')
  if (absolute < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute')
  if (absolute < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour')
  if (absolute < 604800) return formatter.format(Math.round(diffSeconds / 86400), 'day')
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function localizedCopy(notification: AppNotification, locale: 'en' | 'ar') {
  if (locale === 'ar') {
    return {
      title: notification.title_ar || notification.title,
      message: notification.message_ar || notification.message,
    }
  }
  return { title: notification.title, message: notification.message }
}

export default function NotificationBell({
  mode,
  buttonClassName,
}: {
  mode: 'admin' | 'client'
  buttonClassName?: string
}) {
  const { notifications, unreadCount, readNotification, readAllNotifications } = useNotifications()
  const { locale, dir, translateText } = useI18n()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const recent = useMemo(() => notifications.slice(0, 8), [notifications])
  const isAdmin = mode === 'admin'

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current && !rootRef.current.contains(target)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openNotification = async (notification: AppNotification) => {
    await readNotification(notification.id)
    setOpen(false)
    navigate(getNotificationFallbackTarget(notification, isAdmin))
  }

  const markAll = async () => {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)
    try {
      await readAllNotifications()
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0" dir={dir}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={translateText('Notifications')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={buttonClassName}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-extrabold leading-none text-white ring-2',
            isAdmin ? 'bg-red-500 ring-white' : 'bg-gradient-to-br from-violet-600 to-fuchsia-500 ring-white/80'
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={translateText('Notifications')}
          className={cn(
            'fixed inset-x-3 top-[calc(var(--app-header-offset)+8px)] z-[100] w-auto overflow-hidden rounded-[20px] border shadow-[0_32px_80px_-28px_rgba(46,10,114,0.5)] sm:absolute sm:inset-x-auto sm:top-[calc(100%+12px)] sm:w-[min(390px,calc(100vw-24px))]',
            // Always align the panel's right edge to the bell's right edge — the
            // bell sits in the middle-right area of the navbar in both LTR and
            // RTL, so opening leftward keeps the panel in the viewport. The
            // previous `sm:left-0` in RTL pushed the panel off-screen to the
            // right and clipped the "Notifications" title.
            'sm:right-0',
            isAdmin
              ? 'border-[var(--admin-border)] bg-[var(--admin-surface)]'
              : 'border-violet-200/80 bg-white'
          )}
        >
          <div className={cn(
            'flex items-center justify-between gap-3 border-b px-4 py-3.5',
            isAdmin ? 'border-[var(--admin-border)]' : 'border-violet-100'
          )}>
            <div>
              <div className={cn(
                'text-[13px] font-extrabold',
                isAdmin ? 'text-[var(--admin-text)]' : 'text-ink-900'
              )}>
                {translateText('Notifications')}
              </div>
              <div className={cn(
                'mt-0.5 text-[10.5px] font-semibold',
                isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-ink-500'
              )}>
                {unreadCount > 0
                  ? `${unreadCount} ${translateText('unread')}`
                  : translateText('You are all caught up')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void markAll()}
              disabled={markingAll || unreadCount === 0}
              className={cn(
                'inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10.5px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40',
                isAdmin
                  ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] hover:brightness-95'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
              )}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {translateText('Mark all as read')}
            </button>
          </div>

          <div className="max-h-[min(520px,65vh)] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className={cn(
                  'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl',
                  isAdmin
                    ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
                    : 'bg-violet-50 text-violet-600'
                )}>
                  <Bell className="h-5 w-5" />
                </span>
                <p className={cn(
                  'mt-3 text-[12px] font-semibold',
                  isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-ink-500'
                )}>
                  {translateText('No notifications yet')}
                </p>
              </div>
            ) : (
              recent.map(notification => {
                const Icon = iconForNotification(notification.type)
                const copy = localizedCopy(notification, locale)
                const unread = !notification.read_at
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b px-4 py-3.5 text-start transition last:border-b-0',
                      isAdmin ? 'border-[var(--admin-border)]' : 'border-violet-50',
                      unread
                        ? isAdmin
                          ? 'bg-[var(--admin-accent-soft)]/55 hover:bg-[var(--admin-accent-soft)]'
                          : 'bg-violet-50/70 hover:bg-violet-50'
                        : isAdmin
                          ? 'hover:bg-[var(--admin-surface-2)]'
                          : 'hover:bg-violet-50/50'
                    )}
                  >
                    <span className={cn(
                      'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]',
                      notification.priority === 'high'
                        ? 'bg-rose-50 text-rose-600'
                        : isAdmin
                          ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
                          : 'bg-violet-50 text-violet-600'
                    )}>
                      <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
                      {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-600" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn(
                        'block truncate text-[12.5px] leading-5',
                        unread ? 'font-extrabold' : 'font-bold',
                        isAdmin ? 'text-[var(--admin-text)]' : 'text-ink-900'
                      )} data-i18n-skip dir="auto">
                        {copy.title}
                      </span>
                      <span className={cn(
                        'mt-0.5 line-clamp-2 block text-[11px] leading-4.5',
                        isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-ink-500'
                      )} data-i18n-skip dir="auto">
                        {copy.message}
                      </span>
                      <span className={cn(
                        'mt-1 block text-[9.5px] font-semibold',
                        isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-violet-500'
                      )}>
                        {relativeTime(notification.created_at, locale)}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(isAdmin ? '/admin/notifications' : '/notifications')
            }}
            className={cn(
              'flex min-h-11 w-full items-center justify-center border-t text-[11.5px] font-extrabold transition',
              isAdmin
                ? 'border-[var(--admin-border)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)]'
                : 'border-violet-100 text-violet-700 hover:bg-violet-50'
            )}
          >
            {translateText('View all notifications')}
          </button>
        </div>
      )}
    </div>
  )
}
