import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Save, Undo2, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import AvatarPicker from '../components/ui/AvatarPicker'
import UserAvatar from '../components/ui/UserAvatar'
import {
  avatarIdentitySeed,
  buildDefaultAvatarSelection,
  isAvatarSelectionEqual,
  normalizeAvatarSelection,
  type AvatarSelection,
} from '../lib/avatar'
import { getErrorMessage } from '../lib/errors'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

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
  avatarSelection: AvatarSelection
}

export default function ProfilePage() {
  usePageMeta({ title: 'Profile', noIndex: true })

  const { currentUser, isLoggedIn, loading, updateProfile } = useUser()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarSelection, setAvatarSelection] = useState<AvatarSelection>(() =>
    buildDefaultAvatarSelection('guest-profile')
  )
  const [saving, setSaving] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<InlineFeedback | null>(null)
  const [resetSending, setResetSending] = useState(false)
  const [resetFeedback, setResetFeedback] = useState<InlineFeedback | null>(null)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const syncedSnapshotRef = useRef<SyncedProfileSnapshot>({
    userId: null,
    name: '',
    phone: '',
    avatarSelection: buildDefaultAvatarSelection('guest-profile'),
  })

  const profileIdentitySeed = useMemo(
    () => avatarIdentitySeed([currentUser?.name, currentUser?.email, currentUser?.id]),
    [currentUser?.email, currentUser?.id, currentUser?.name]
  )
  const pickerIdentitySeed = useMemo(
    () => avatarIdentitySeed([currentUser?.id, currentUser?.email, currentUser?.name || name]),
    [currentUser?.email, currentUser?.id, currentUser?.name, name]
  )
  const currentAvatar = useMemo(
    () => normalizeAvatarSelection(currentUser),
    [
      currentUser?.avatarStyle,
      currentUser?.avatarSeed,
      JSON.stringify(currentUser?.avatarOptions || {}),
    ]
  )
  const baselineAvatarSelection = useMemo(
    () => currentAvatar || buildDefaultAvatarSelection(profileIdentitySeed),
    [currentAvatar, profileIdentitySeed]
  )

  const normalizedCurrentName = normalizeProfileValue(currentUser?.name)
  const normalizedCurrentPhone = normalizeProfileValue(currentUser?.phone)
  const trimmedName = name.trim()
  const trimmedPhone = phone.trim()
  const accountEmail = currentUser?.email?.trim() || ''

  const canResetPassword = accountEmail.length > 0

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-100/62' : 'text-gray-600'
  const muted = isDark ? 'text-cyan-100/42' : 'text-violet-600/54'

  useEffect(() => {
    if (!currentUser) return

    const nextName = normalizedCurrentName
    const nextPhone = normalizedCurrentPhone
    const nextAvatarSelection = baselineAvatarSelection
    const previousSnapshot = syncedSnapshotRef.current
    const switchedUser = previousSnapshot.userId !== currentUser.id

    setName(previous => (switchedUser || previous === previousSnapshot.name ? nextName : previous))
    setPhone(previous => (switchedUser || previous === previousSnapshot.phone ? nextPhone : previous))
    setAvatarSelection(previous =>
      switchedUser || isAvatarSelectionEqual(previous, previousSnapshot.avatarSelection)
        ? isAvatarSelectionEqual(previous, nextAvatarSelection)
          ? previous
          : nextAvatarSelection
        : previous
    )

    syncedSnapshotRef.current = {
      userId: currentUser.id,
      name: nextName,
      phone: nextPhone,
      avatarSelection: nextAvatarSelection,
    }

    if (switchedUser) {
      setSaveFeedback(null)
      setResetFeedback(null)
    }
  }, [baselineAvatarSelection, currentUser, normalizedCurrentName, normalizedCurrentPhone])

  const hasChanges = useMemo(() => {
    if (!currentUser) return false

    return (
      trimmedName !== normalizedCurrentName ||
      trimmedPhone !== normalizedCurrentPhone ||
      !isAvatarSelectionEqual(baselineAvatarSelection, avatarSelection)
    )
  }, [
    avatarSelection,
    baselineAvatarSelection,
    currentUser,
    normalizedCurrentName,
    normalizedCurrentPhone,
    trimmedName,
    trimmedPhone,
  ])

  const saveFeedbackClassName = useMemo(() => {
    if (!saveFeedback) return ''
    if (saveFeedback.tone === 'success') {
      return isDark
        ? 'border-emerald-400/16 bg-emerald-400/10 text-emerald-200'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }
    if (saveFeedback.tone === 'error') {
      return isDark
        ? 'border-red-400/18 bg-red-400/10 text-red-200'
        : 'border-red-200 bg-red-50 text-red-700'
    }
    return isDark
      ? 'border-cyan-300/16 bg-cyan-400/10 text-cyan-100'
      : 'border-cyan-200 bg-cyan-50 text-cyan-700'
  }, [isDark, saveFeedback])

  const resetFeedbackClassName = useMemo(() => {
    if (!resetFeedback) return ''
    if (resetFeedback.tone === 'success') {
      return isDark ? 'text-emerald-200' : 'text-emerald-700'
    }
    if (resetFeedback.tone === 'error') {
      return isDark ? 'text-red-200' : 'text-red-700'
    }
    return isDark ? 'text-cyan-100' : 'text-cyan-700'
  }, [isDark, resetFeedback])

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

  const resetDraft = () => {
    setName(normalizedCurrentName)
    setPhone(normalizedCurrentPhone)
    setAvatarSelection(baselineAvatarSelection)
    setSaveFeedback(null)
  }

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

    const normalizedAvatarChanged = !isAvatarSelectionEqual(baselineAvatarSelection, avatarSelection)
    const nextName = trimmedName
    const nextPhone = trimmedPhone

    setSaving(true)
    setSaveFeedback(null)
    setName(nextName)
    setPhone(nextPhone)

    const result = await updateProfile({
      ...(nextName !== normalizedCurrentName ? { name: nextName } : {}),
      ...(nextPhone !== normalizedCurrentPhone ? { phone: nextPhone } : {}),
      ...(normalizedAvatarChanged ? { avatar: avatarSelection } : {}),
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
      <section className="site-section">
        <div className="site-container max-w-[34rem]">
          <div className="section-shell site-shell-pad-lg text-center">
            <div
              className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-[22px]',
                isDark
                  ? 'bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(34,211,238,0.16))] ring-1 ring-inset ring-cyan-300/16'
                  : 'bg-violet-50 ring-1 ring-inset ring-violet-200'
              )}
            >
              <UserRound className={cn('h-7 w-7', isDark ? 'text-cyan-100/80' : 'text-violet-700')} />
            </div>
            <h1 className={cn('mt-5 font-display text-3xl font-bold', txt)}>Your account</h1>
            <p className={cn('mt-3 text-sm leading-7', sub)}>
              Sign in to manage your profile, avatar, and account details.
            </p>
            <Link
              to={`/login?redirect=${encodeURIComponent('/profile')}`}
              className="btn-primary mt-6 inline-flex"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (loading && !currentUser) {
    return (
      <section className="site-section">
        <div className="site-container max-w-[34rem]">
          <div className="section-shell site-shell-pad-lg text-center">
            <div
              className={cn(
                'mx-auto h-9 w-9 animate-spin rounded-full border-2 border-t-transparent',
                isDark ? 'border-cyan-300' : 'border-violet-500'
              )}
            />
            <h1 className={cn('mt-5 font-display text-2xl font-bold', txt)}>Loading profile</h1>
            <p className={cn('mt-2 text-sm leading-7', sub)}>
              Syncing your account details and avatar preferences.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!currentUser) {
    return (
      <section className="site-section">
        <div className="site-container max-w-[36rem]">
          <div className="section-shell site-shell-pad-lg text-center">
            <div
              className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-[22px]',
                isDark
                  ? 'bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(34,211,238,0.16))] ring-1 ring-inset ring-cyan-300/16'
                  : 'bg-violet-50 ring-1 ring-inset ring-violet-200'
              )}
            >
              <UserRound className={cn('h-7 w-7', isDark ? 'text-cyan-100/80' : 'text-violet-700')} />
            </div>
            <h1 className={cn('mt-5 font-display text-2xl font-bold', txt)}>Profile unavailable</h1>
            <p className={cn('mt-2 text-sm leading-7', sub)}>
              We couldn&apos;t load your profile details right now. Try refreshing the page or signing in again.
            </p>
            <Link to="/" className="btn-primary mt-6 inline-flex">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container max-w-[38rem]">
        <form
          className="section-shell site-shell-pad-lg"
          onSubmit={event => {
            event.preventDefault()
            void handleSave()
          }}
        >
          <div>
            <h1 className={cn('font-display text-[1.45rem] font-semibold', txt)}>Profile settings</h1>
            <p className={cn('mt-2 text-sm leading-6', sub)}>Manage your account details.</p>
          </div>

          {saveFeedback ? (
            <div
              aria-live="polite"
              aria-atomic="true"
              className={cn('mt-4 rounded-[16px] border px-4 py-3 text-sm transition', saveFeedbackClassName)}
            >
              {saveFeedback.message}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <div
                className={cn(
                  'relative overflow-hidden rounded-[18px] p-[2px]',
                  isDark
                    ? 'bg-[linear-gradient(145deg,rgba(34,211,238,0.24),rgba(168,85,247,0.14),rgba(236,72,153,0.18))]'
                    : 'bg-[linear-gradient(145deg,rgba(124,58,237,0.14),rgba(236,72,153,0.1))]'
                )}
              >
                <div
                  className={cn(
                    'rounded-[16px] p-1',
                    isDark
                      ? 'bg-[linear-gradient(180deg,rgba(9,13,26,0.96),rgba(7,9,20,0.98))]'
                      : 'bg-white'
                  )}
                >
                  <UserAvatar
                    name={trimmedName || currentUser.name || currentUser.email}
                    email={accountEmail}
                    avatarUrl={currentUser.avatarUrl}
                    avatarStyle={avatarSelection.avatarStyle}
                    avatarSeed={avatarSelection.avatarSeed}
                    avatarOptions={avatarSelection.avatarOptions}
                    alt={`${trimmedName || currentUser.name || currentUser.email || 'User'} avatar preview`}
                    className="h-14 w-14 rounded-[14px]"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className={cn('text-sm font-semibold', txt)}>Avatar</div>
                <p className={cn('mt-1 text-[12px] leading-5.5', sub)}>
                  Choose the portrait shown across your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAvatarPickerOpen(open => !open)}
                aria-expanded={avatarPickerOpen}
                aria-controls="profile-avatar-picker"
                className="btn-outline !w-full !rounded-[16px] !px-4 sm:!w-auto"
              >
                {avatarPickerOpen ? 'Hide avatar options' : 'Change avatar'}
              </button>
            </div>

            {avatarPickerOpen ? (
              <div id="profile-avatar-picker">
                <AvatarPicker
                  value={avatarSelection}
                  onChange={selection => {
                    setAvatarSelection(selection)
                    setSaveFeedback(null)
                  }}
                  identitySeed={pickerIdentitySeed}
                  title="Choose an avatar"
                  description="Pick the portrait you want to use across the app."
                  compact={true}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-3.5">
            <div className="space-y-2">
              <label
                htmlFor="profile-name"
                className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}
              >
                Full name
              </label>
              <div className="relative">
                <UserRound
                  className={cn(
                    'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2',
                    muted
                  )}
                  strokeWidth={1.9}
                />
                <input
                  id="profile-name"
                  className="form-field !pl-11"
                  value={name}
                  onChange={event => {
                    setName(event.target.value)
                    setSaveFeedback(null)
                  }}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-phone"
                className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}
              >
                Phone number
              </label>
              <div className="relative">
                <Phone
                  className={cn(
                    'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2',
                    muted
                  )}
                  strokeWidth={1.9}
                />
                <input
                  id="profile-phone"
                  className="form-field !pl-11"
                  type="tel"
                  value={phone}
                  onChange={event => {
                    setPhone(event.target.value)
                    setSaveFeedback(null)
                  }}
                  placeholder="+962..."
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="profile-email"
                className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}
              >
                Email address
              </label>
              <div
                id="profile-email"
                className={cn(
                  'flex min-h-[46px] items-center gap-3 rounded-[16px] px-4',
                  isDark
                    ? 'bg-[#0e1430]/92 text-purple-100/76 ring-1 ring-inset ring-cyan-400/10'
                    : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200'
                )}
              >
                <Mail className={cn('h-4 w-4 shrink-0', muted)} strokeWidth={1.9} />
                <span className="min-w-0 break-all text-sm font-medium">
                  {accountEmail || 'No email address on file'}
                </span>
              </div>
              <p className={cn('text-[11px] leading-5.5', muted)}>
                Email is managed by your sign-in account and cannot be changed here.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetDraft}
              disabled={saving || !hasChanges}
              className="btn-outline !w-full !rounded-[16px] !px-4 disabled:opacity-40 sm:!w-auto"
            >
              <Undo2 className="h-4 w-4" strokeWidth={1.9} />
              Reset changes
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="btn-primary !w-full !rounded-[16px] !px-5 disabled:opacity-40 sm:!w-auto"
            >
              <Save className="h-4 w-4" strokeWidth={1.9} />
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>

          <div className={cn('mt-6 border-t pt-5', isDark ? 'border-white/[0.06]' : 'border-gray-100')}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={cn('text-sm font-semibold', txt)}>Security</h2>
                <p className={cn('mt-1 text-[12px] leading-5.5', sub)}>
                  {canResetPassword
                    ? `Send a password reset link to ${accountEmail}.`
                    : 'Add an email address to use password reset.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleResetPassword()}
                disabled={resetSending || !canResetPassword}
                aria-disabled={resetSending || !canResetPassword}
                className="btn-outline !w-full !rounded-[16px] !px-4 disabled:opacity-40 sm:!w-auto"
              >
                <Mail className="h-4 w-4" strokeWidth={1.9} />
                {resetSending ? 'Sending...' : 'Send password reset email'}
              </button>
            </div>

            {resetFeedback ? (
              <p
                aria-live="polite"
                aria-atomic="true"
                className={cn('mt-3 text-sm leading-6', resetFeedbackClassName)}
              >
                {resetFeedback.message}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  )
}
