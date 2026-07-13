'use client'

import { Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRealtime } from '../RealtimeProvider'

export default function NotificationBell() {
  const t = useTranslations('notifications')
  const { userId, notificationUnread } = useRealtime()
  if (!userId) return null
  return (
    <Link
      href="/notifications"
      aria-label={t('title')}
      className="fixed end-20 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-800 shadow-md"
    >
      <Bell className="h-5 w-5" />
      {notificationUnread > 0 && (
        <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold text-white">
          {notificationUnread}
        </span>
      )}
    </Link>
  )
}
