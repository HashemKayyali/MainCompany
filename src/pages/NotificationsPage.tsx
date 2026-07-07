import { Bell, LockKeyhole } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import NotificationList from '../components/notifications/NotificationList'
import { useI18n } from '../contexts/LanguageContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotificationsPage() {
  const { isLoggedIn } = useUser()
  const { translateText } = useI18n()
  const location = useLocation()
  usePageMeta({ title: 'Notifications', noIndex: true })

  if (!isLoggedIn) {
    const redirect = `${location.pathname}${location.search}${location.hash}`
    return (
      <section className="site-section">
        <div className="site-container">
          <div className="mx-auto max-w-2xl rounded-[24px] border border-violet-200/80 bg-white p-7 text-center shadow-[0_24px_60px_-36px_rgba(89,23,196,0.4)] sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 ring-1 ring-violet-200/80">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-[1.8rem] font-black tracking-[-0.035em] text-ink-900">
              {translateText('Sign in to view notifications')}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-6 text-ink-600">
              {translateText('Notifications are private and tied to your Eventies account.')}
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="btn-primary mt-6 inline-flex !rounded-[14px] !px-6 !py-3 !text-[13px]"
            >
              <Bell className="h-4 w-4" />
              {translateText('Sign In')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <NotificationList mode="client" />
}
