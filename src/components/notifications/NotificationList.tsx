import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ClipboardList, FileText, Mail, MessageCircle, Send } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { getNotificationFallbackTarget } from '../../lib/notification-targets'
import type { AppNotification } from '../../services/notifications.service'
import { cn } from '../../utils/cn'

type Filter = 'all' | 'unread'

function iconForType(type: string) {
  if (type.includes('chat')) return MessageCircle
  if (type.includes('contact')) return Mail
  if (type.includes('rental')) return ClipboardList
  if (type.includes('quote')) return FileText
  if (type === 'custom') return Send
  return Bell
}

function localized(notification: AppNotification, locale: 'en' | 'ar') {
  return locale === 'ar'
    ? {
        title: notification.title_ar || notification.title,
        message: notification.message_ar || notification.message,
      }
    : { title: notification.title, message: notification.message }
}

function formatDate(value: string, locale: 'en' | 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function NotificationList({ mode }: { mode: 'admin' | 'client' }) {
  const { notifications, unreadCount, readNotification, readAllNotifications, loading } = useNotifications()
  const { locale, translateText } = useI18n()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const isAdmin = mode === 'admin'

  const visible = useMemo(
    () => filter === 'unread' ? notifications.filter(item => !item.read_at) : notifications,
    [filter, notifications]
  )

  const openItem = async (notification: AppNotification) => {
    await readNotification(notification.id)
    navigate(getNotificationFallbackTarget(notification, isAdmin))
  }

  return (
    <div className={cn(isAdmin ? 'flex min-h-0 flex-1 flex-col' : 'site-section')}>
      <div className={cn(isAdmin ? 'flex min-h-0 flex-1 flex-col' : 'site-container')}>
        <div className={cn(
          'flex flex-wrap items-end justify-between gap-4',
          isAdmin ? 'mb-5' : 'mb-6'
        )}>
          <div>
            <div className={cn(
              'font-display font-black tracking-[-0.035em]',
              isAdmin ? 'text-[1.55rem] text-[var(--admin-text)]' : 'text-[2rem] text-ink-900 sm:text-[2.5rem]'
            )}>
              {translateText('Notifications')}
            </div>
            <p className={cn(
              'mt-1 text-[12.5px]',
              isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-ink-500'
            )}>
              {unreadCount > 0
                ? `${unreadCount} ${translateText('unread notification(s)')}`
                : translateText('You are all caught up')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void readAllNotifications()}
            disabled={unreadCount === 0}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[11.5px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40',
              isAdmin
                ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] hover:brightness-95'
                : 'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50'
            )}
          >
            <CheckCheck className="h-4 w-4" />
            {translateText('Mark all as read')}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {(['all', 'unread'] as Filter[]).map(value => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-full px-4 py-2 text-[11px] font-extrabold transition',
                filter === value
                  ? isAdmin
                    ? 'bg-[var(--admin-accent)] text-white'
                    : 'bg-violet-600 text-white'
                  : isAdmin
                    ? 'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)]'
                    : 'border border-violet-200 bg-white text-ink-600 hover:text-violet-700'
              )}
            >
              {translateText(value === 'all' ? 'All' : 'Unread')}
            </button>
          ))}
        </div>

        <div className={cn(
          'overflow-hidden rounded-[22px] border',
          isAdmin
            ? 'border-[var(--admin-border)] bg-[var(--admin-surface)]'
            : 'border-violet-200/80 bg-white shadow-[0_24px_60px_-36px_rgba(89,23,196,0.4)]'
        )}>
          {loading ? (
            <div className="space-y-3 p-5" aria-busy="true">
              {[0, 1, 2, 3].map(index => (
                <div key={index} className={cn(
                  'h-20 animate-pulse rounded-2xl',
                  isAdmin ? 'bg-[var(--admin-surface-2)]' : 'bg-violet-50'
                )} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className={cn(
                'mx-auto flex h-14 w-14 items-center justify-center rounded-3xl',
                isAdmin
                  ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
                  : 'bg-violet-50 text-violet-600'
              )}>
                <Bell className="h-6 w-6" />
              </span>
              <h2 className={cn(
                'mt-4 text-[15px] font-extrabold',
                isAdmin ? 'text-[var(--admin-text)]' : 'text-ink-900'
              )}>
                {translateText(filter === 'unread' ? 'No unread notifications' : 'No notifications yet')}
              </h2>
            </div>
          ) : (
            visible.map(notification => {
              const Icon = iconForType(notification.type)
              const copy = localized(notification, locale)
              const unread = !notification.read_at
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void openItem(notification)}
                  className={cn(
                    'flex w-full items-start gap-3.5 border-b px-4 py-4 text-start transition last:border-b-0 sm:px-5',
                    isAdmin ? 'border-[var(--admin-border)]' : 'border-violet-100',
                    unread
                      ? isAdmin
                        ? 'bg-[var(--admin-accent-soft)]/50 hover:bg-[var(--admin-accent-soft)]'
                        : 'bg-violet-50/55 hover:bg-violet-50'
                      : isAdmin
                        ? 'hover:bg-[var(--admin-surface-2)]'
                        : 'hover:bg-violet-50/40'
                  )}
                >
                  <span className={cn(
                    'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                    notification.priority === 'high'
                      ? 'bg-rose-50 text-rose-600'
                      : isAdmin
                        ? 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
                        : 'bg-violet-50 text-violet-600'
                  )}>
                    <Icon className="h-5 w-5" />
                    {unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-violet-600" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn(
                      'block text-[13.5px] leading-5',
                      unread ? 'font-black' : 'font-bold',
                      isAdmin ? 'text-[var(--admin-text)]' : 'text-ink-900'
                    )} data-i18n-skip dir="auto">
                      {copy.title}
                    </span>
                    <span className={cn(
                      'mt-1 block text-[12px] leading-5',
                      isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-ink-500'
                    )} data-i18n-skip dir="auto">
                      {copy.message}
                    </span>
                    <span className={cn(
                      'mt-1.5 block text-[10px] font-semibold',
                      isAdmin ? 'text-[var(--admin-text-muted)]' : 'text-violet-500'
                    )}>
                      {formatDate(notification.created_at, locale)}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
