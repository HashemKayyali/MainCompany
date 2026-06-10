import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getErrorMessage } from '../lib/errors'
import { cn } from '../utils/cn'

function normalizeProfileValue(value?: string | null) {
  return value?.trim() || ''
}

type FeedbackTone = 'success' | 'error' | 'info'

type InlineFeedback = {
  tone: FeedbackTone
  message: string
}

type SyncedProfileSnapshot = {
  userId: string | null
  name: string
  phone: string
}

function feedbackTextClassName(tone: FeedbackTone, isDark: boolean) {
  if (tone === 'success') {
    return isDark ? 'text-emerald-300' : 'text-emerald-700'
  }

  if (tone === 'error') {
    return isDark ? 'text-rose-300' : 'text-rose-700'
  }

  return isDark ? 'text-sky-300' : 'text-sky-700'
}

export default function ProfilePage() {
  usePageMeta({ title: 'Profile', noIndex: true })

  const { currentUser, isLoggedIn, loading, updateProfile } = useUser()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<InlineFeedback | null>(null)
  const [resetSending, setResetSending] = useState(false)
  const [resetFeedback, setResetFeedback] = useState<InlineFeedback | null>(null)
  const syncedSnapshotRef = useRef<SyncedProfileSnapshot>({
    userId: null,
    name: '',
    phone: '',
  })

  const normalizedCurrentName = normalizeProfileValue(currentUser?.name)
  const normalizedCurrentPhone = normalizeProfileValue(currentUser?.phone)
  const trimmedName = name.trim()
  const trimmedPhone = phone.trim()
  const accountEmail = currentUser?.email?.trim() || ''

  const canResetPassword = accountEmail.length > 0

  const pageClassName = 'site-container py-12'
  const panelClassName = cn(
    'rounded-2xl border p-6 sm:p-8',
    isDark
      ? 'border-white/10 bg-[#0b1220]/88 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]'
      : 'border-gray-200 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.25)]'
  )
  const emptyStatePanelClassName = cn(panelClassName, 'mx-auto max-w-xl text-center')
  const titleClassName = cn('text-3xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-gray-900')
  const subtitleClassName = cn('text-sm leading-6', isDark ? 'text-white/65' : 'text-gray-600')
  const sectionTitleClassName = cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')
  const sectionBodyClassName = cn('mt-1 text-sm leading-6', isDark ? 'text-white/60' : 'text-gray-600')
  const labelClassName = cn('mb-2 block text-sm font-medium', isDark ? 'text-white/85' : 'text-gray-700')
  const inputClassName = cn(
    'block w-full rounded-xl border px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2',
    isDark
      ? 'border-white/10 bg-[#0a1120] text-white placeholder:text-white/30 focus:border-sky-300/40 focus:ring-sky-400/15'
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:ring-violet-200'
  )
  const readOnlyFieldClassName = cn(
    'rounded-xl border px-3.5 py-3 text-sm leading-6 break-all',
    isDark ? 'border-white/10 bg-white/[0.04] text-white/70' : 'border-gray-200 bg-gray-50 text-gray-600'
  )
  const secondaryButtonClassName = cn(
    'inline-flex min-h-[42px] items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    isDark
      ? 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  )
  const primaryButtonClassName = cn(
    'inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    isDark ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-gray-900 text-white hover:bg-gray-800'
  )
  const dividerClassName = cn('border-t pt-8', isDark ? 'border-white/10' : 'border-gray-200')
  const saveFeedbackClassName = saveFeedback
    ? feedbackTextClassName(saveFeedback.tone, isDark)
    : ''
  const resetFeedbackClassName = resetFeedback
    ? feedbackTextClassName(resetFeedback.tone, isDark)
    : ''

  useEffect(() => {
    if (!currentUser) return

    const nextName = normalizedCurrentName
    const nextPhone = normalizedCurrentPhone
    const previousSnapshot = syncedSnapshotRef.current
    const switchedUser = previousSnapshot.userId !== currentUser.id

    setName(previous => (switchedUser || previous === previousSnapshot.name ? nextName : previous))
    setPhone(previous => (switchedUser || previous === previousSnapshot.phone ? nextPhone : previous))

    syncedSnapshotRef.current = {
      userId: currentUser.id,
      name: nextName,
      phone: nextPhone,
    }

    if (switchedUser) {
      setSaveFeedback(null)
      setResetFeedback(null)
    }
  }, [currentUser, normalizedCurrentName, normalizedCurrentPhone])

  const hasChanges = useMemo(() => {
    if (!currentUser) return false

    return trimmedName !== normalizedCurrentName || trimmedPhone !== normalizedCurrentPhone
  }, [currentUser, normalizedCurrentName, normalizedCurrentPhone, trimmedName, trimmedPhone])

  useEffect(() => {
    if (!saveFeedback) return

    const timeoutId = window.setTimeout(() => setSaveFeedback(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [saveFeedback])

  useEffect(() => {
    if (!resetFeedback) return

    const timeoutId = window.setTimeout(() => setResetFeedback(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [resetFeedback])

  const handleSave = async () => {
    if (!currentUser) return

    if (!trimmedName) {
      const message = 'Enter your name before saving your profile.'
      setSaveFeedback({ tone: 'error', message })
      toast(message, 'error')
      return
    }

    if (!hasChanges) {
      setSaveFeedback({ tone: 'info', message: 'Your profile is already up to date.' })
      return
    }

    const nextName = trimmedName
    const nextPhone = trimmedPhone

    setSaving(true)
    setSaveFeedback(null)
    setName(nextName)
    setPhone(nextPhone)

    const result = await updateProfile({
      ...(nextName !== normalizedCurrentName ? { name: nextName } : {}),
      ...(nextPhone !== normalizedCurrentPhone ? { phone: nextPhone } : {}),
    })

    setSaving(false)

    if (result === true) {
      const message = 'Profile updated successfully.'
      setSaveFeedback({ tone: 'success', message })
      toast('Profile updated', 'success')
      return
    }

    const message = result || 'Failed to update profile'
    setSaveFeedback({ tone: 'error', message })
    toast(message, 'error')
  }

  const handleResetPassword = async () => {
    setResetFeedback(null)

    if (!canResetPassword) {
      const message = 'Add an email address to your account before requesting a password reset.'
      setResetFeedback({ tone: 'error', message })
      toast(message, 'error')
      return
    }

    setResetSending(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(accountEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      const message = `Reset email sent to ${accountEmail}.`
      setResetFeedback({ tone: 'success', message })
      toast('Password reset email sent. Check your inbox.', 'success')
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to send reset email')
      setResetFeedback({ tone: 'error', message })
      toast(message, 'error')
    } finally {
      setResetSending(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className={pageClassName}>
        <div className={emptyStatePanelClassName}>
          <h1 className={titleClassName}>Profile settings</h1>
          <p className={cn('mt-3', subtitleClassName)}>
            Sign in to manage your profile details and account security.
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent('/profile')}`}
            className={cn(primaryButtonClassName, 'mt-6 w-full sm:w-auto')}
          >
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  if (loading && !currentUser) {
    return (
      <main className={pageClassName}>
        <div className={emptyStatePanelClassName}>
          <div
            className={cn(
              'mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent',
              isDark ? 'border-sky-300' : 'border-gray-900'
            )}
          />
          <h1 className={cn('mt-5 text-2xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
            Loading profile
          </h1>
          <p className={cn('mt-3', subtitleClassName)}>
            Fetching your latest account details.
          </p>
        </div>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <main className={pageClassName}>
        <div className={emptyStatePanelClassName}>
          <h1 className={titleClassName}>Profile unavailable</h1>
          <p className={cn('mt-3', subtitleClassName)}>
            We couldn&apos;t load your account details right now. Try refreshing the page or head back home.
          </p>
          <Link to="/" className={cn(secondaryButtonClassName, 'mt-6 w-full sm:w-auto')}>
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className={pageClassName}>
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className={titleClassName}>Profile settings</h1>
            <p className={subtitleClassName}>Update your personal details and manage your account.</p>
          </header>

          <form
            className={panelClassName}
            onSubmit={event => {
              event.preventDefault()
              void handleSave()
            }}
          >
            <div className="space-y-8">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label htmlFor="profile-name" className={labelClassName}>
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    className={inputClassName}
                    value={name}
                    onChange={event => {
                      setName(event.target.value)
                      setSaveFeedback(null)
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="profile-phone" className={labelClassName}>
                    Phone number
                  </label>
                  <input
                    id="profile-phone"
                    className={inputClassName}
                    type="tel"
                    value={phone}
                    onChange={event => {
                      setPhone(event.target.value)
                      setSaveFeedback(null)
                    }}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className={labelClassName}>
                    Email
                  </label>
                  <div id="profile-email" className={readOnlyFieldClassName}>
                    {accountEmail || 'No email address on file'}
                  </div>
                </div>
              </div>

              <div className={cn('border-t pt-6', isDark ? 'border-white/10' : 'border-gray-200')}>
                {saveFeedback ? (
                  <p aria-live="polite" aria-atomic="true" className={cn('mb-3 text-sm', saveFeedbackClassName)}>
                    {saveFeedback.message}
                  </p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    className={cn(primaryButtonClassName, 'w-full sm:w-auto')}
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </div>

              <section className={dividerClassName}>
                <div className="space-y-4 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
                  <div className="min-w-0">
                    <h2 className={sectionTitleClassName}>Security</h2>
                    <p className={sectionBodyClassName}>
                      {canResetPassword ? (
                        <>
                          Send a password reset link to <span className="break-all">{accountEmail}</span>.
                        </>
                      ) : (
                        'Add an email address to use password reset.'
                      )}
                    </p>

                    {resetFeedback ? (
                      <p
                        aria-live="polite"
                        aria-atomic="true"
                        className={cn('mt-2 text-sm', resetFeedbackClassName)}
                      >
                        {resetFeedback.message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleResetPassword()}
                    disabled={resetSending || !canResetPassword}
                    aria-disabled={resetSending || !canResetPassword}
                    className={cn(secondaryButtonClassName, 'w-full sm:w-auto sm:shrink-0')}
                  >
                    {resetSending ? 'Sending...' : 'Send password reset email'}
                  </button>
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
