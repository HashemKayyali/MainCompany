import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import PageLoader from './ui/PageLoader'

/**
 * Hard ceiling for how long we wait on the session/profile check before
 * showing a retry UI. Without this, a slow Supabase request would freeze
 * the admin route on a blank spinner forever — that was the
 * "Admin Panel sometimes doesn't open on first try" symptom.
 */
const GUARD_TIMEOUT_MS = 10_000

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { loading, isAdmin, isLoggedIn } = useUser()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      setTimedOut(false)
      return
    }
    const id = window.setTimeout(() => setTimedOut(true), GUARD_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [loading])

  if (loading && !timedOut) return <PageLoader />

  if (loading && timedOut) {
    // We've been stuck on the session/profile check too long. Give the
    // user a clear escape route instead of an infinite spinner.
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-[#07041a]">
            Still loading your admin session…
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-[#211049]">
            We're having trouble reaching the auth service. This can happen on slow Wi-Fi or
            restrictive networks. Try refreshing — your work is safe.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary !rounded-xl !text-[12px]"
            >
              Refresh page
            </button>
            <a href="/" className="btn-outline !rounded-xl !text-[12px]">
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />
  }

  if (!isAdmin) return <Navigate to="/profile" replace />
  return <>{children}</>
}
