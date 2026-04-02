import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Mail, Phone, Save, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
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

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function roleLabel(role?: string | null) {
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Administrator'
  return 'Member'
}

export default function ProfilePage() {
  usePageMeta({ title: 'Profile', noIndex: true })

  const { currentUser, isLoggedIn, updateProfile } = useUser()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarSelection, setAvatarSelection] = useState<AvatarSelection>(() =>
    buildDefaultAvatarSelection('guest-profile')
  )
  const [saving, setSaving] = useState(false)
  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const profileIdentitySeed = useMemo(
    () => avatarIdentitySeed([currentUser?.name, currentUser?.email, currentUser?.id]),
    [currentUser?.email, currentUser?.id, currentUser?.name]
  )
  const pickerIdentitySeed = useMemo(
    () => avatarIdentitySeed([name, currentUser?.email, currentUser?.id]),
    [currentUser?.email, currentUser?.id, name]
  )
  const currentAvatar = useMemo(
    () => normalizeAvatarSelection(currentUser),
    [
      currentUser?.avatarStyle,
      currentUser?.avatarSeed,
      JSON.stringify(currentUser?.avatarOptions || {}),
    ]
  )

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-100/62' : 'text-gray-600'
  const muted = isDark ? 'text-cyan-100/42' : 'text-violet-600/54'

  useEffect(() => {
    if (!currentUser) return
    const nextName = currentUser.name || ''
    const nextPhone = currentUser.phone || ''
    const nextAvatarSelection =
      currentAvatar || buildDefaultAvatarSelection(profileIdentitySeed)

    setName(previous => (previous === nextName ? previous : nextName))
    setPhone(previous => (previous === nextPhone ? previous : nextPhone))
    setAvatarSelection(previous =>
      isAvatarSelectionEqual(previous, nextAvatarSelection) ? previous : nextAvatarSelection
    )
  }, [currentAvatar, currentUser, profileIdentitySeed])

  const hasChanges = useMemo(() => {
    if (!currentUser) return false
    const avatarChanged =
      !isAvatarSelectionEqual(currentAvatar, avatarSelection)

    return (
      name !== (currentUser.name || '') ||
      phone !== (currentUser.phone || '') ||
      avatarChanged
    )
  }, [avatarSelection, currentUser, name, phone])

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

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile({
      name,
      phone,
      avatar: avatarSelection,
    })
    setSaving(false)

    if (result === true) {
      toast('Profile updated', 'success')
      return
    }

    toast(result || 'Failed to update profile', 'error')
  }

  const handleResetPassword = async () => {
    if (!currentUser?.email) return
    setResetSending(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setResetSent(true)
      toast('Password reset email sent. Check your inbox.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to send reset email', 'error')
    } finally {
      setResetSending(false)
    }
  }

  return (
    <section className="site-section">
      <div className="site-container max-w-[72rem]">
        <div className="grid gap-3 xl:grid-cols-[292px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="section-shell site-shell-pad-lg">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'relative overflow-hidden rounded-[24px] p-[3px]',
                    isDark
                      ? 'bg-[linear-gradient(145deg,rgba(34,211,238,0.32),rgba(168,85,247,0.18),rgba(236,72,153,0.22))]'
                      : 'bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(236,72,153,0.14))]'
                  )}
                >
                  <div
                    className={cn(
                  'rounded-[20px] p-1.25',
                      isDark
                        ? 'bg-[linear-gradient(180deg,rgba(9,13,26,0.96),rgba(7,9,20,0.98))]'
                        : 'bg-white'
                    )}
                  >
                    <UserAvatar
                      name={currentUser?.name}
                      email={currentUser?.email}
                      avatarUrl={currentUser?.avatarUrl}
                      avatarStyle={avatarSelection.avatarStyle}
                      avatarSeed={avatarSelection.avatarSeed}
                      avatarOptions={avatarSelection.avatarOptions}
                      className="h-[96px] w-[96px] rounded-[16px] sm:h-[104px] sm:w-[104px]"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]',
                      isDark
                        ? 'bg-cyan-400/10 text-cyan-100/82 ring-1 ring-inset ring-cyan-300/14'
                        : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Account center
                  </div>
                  <h1 className={cn('mt-3 font-display text-[1.5rem] font-bold leading-tight', txt)}>
                    {currentUser?.name || 'Your profile'}
                  </h1>
                  <p className={cn('mt-2 text-sm', sub)}>{currentUser?.email}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset',
                        isDark
                          ? 'bg-fuchsia-400/10 text-fuchsia-100/86 ring-fuchsia-300/16'
                          : 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200'
                      )}
                    >
                      {roleLabel(currentUser?.role)}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset',
                        isDark
                          ? 'bg-[#0f1630]/92 text-purple-100/72 ring-cyan-400/10'
                          : 'bg-gray-50 text-gray-600 ring-gray-200'
                      )}
                    >
                      Joined{' '}
                      {new Date(currentUser?.createdAt || '').toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'mt-3.5 grid gap-2 rounded-[16px] p-2.5 sm:grid-cols-2',
                  isDark
                    ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]'
                    : 'bg-violet-50/60 ring-1 ring-inset ring-violet-100'
                )}
              >
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Profile identity
                  </div>
                  <div className={cn('mt-2 text-sm font-medium', txt)}>DiceBear portrait avatar</div>
                </div>
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Sync status
                  </div>
                  <div className={cn('mt-2 text-sm font-medium', txt)}>Database-backed & reusable</div>
                </div>
              </div>
            </div>

            <AvatarPicker
              value={avatarSelection}
              onChange={setAvatarSelection}
              identitySeed={pickerIdentitySeed}
              description="This portrait avatar is rendered deterministically from saved style, seed, and options so it stays consistent everywhere."
            />
          </aside>

          <div className="space-y-4">
            <div className="section-shell site-shell-pad-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Identity settings
                  </div>
                  <h2 className={cn('mt-2 font-display text-[1.22rem] font-semibold', txt)}>
                    Profile details
                  </h2>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="btn-primary !rounded-[16px] !px-5 disabled:opacity-40"
                >
                  <Save className="h-4 w-4" strokeWidth={1.9} />
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              </div>

              <div className="mt-4 grid gap-3.5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', muted)} strokeWidth={1.9} />
                    <input
                      className="form-field !pl-11"
                      value={name}
                      onChange={event => setName(event.target.value)}
                      placeholder="Your full name"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', muted)} strokeWidth={1.9} />
                    <input
                      className="form-field !pl-11"
                      type="tel"
                      value={phone}
                      onChange={event => setPhone(event.target.value)}
                      placeholder="+962..."
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', muted)}>
                    Email address
                  </label>
                  <div
                    className={cn(
                      'flex min-h-[46px] items-center gap-3 rounded-[16px] px-4',
                      isDark
                        ? 'bg-[#0e1430]/92 text-purple-100/76 ring-1 ring-inset ring-cyan-400/10'
                        : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200'
                    )}
                  >
                    <Mail className={cn('h-4 w-4 shrink-0', muted)} strokeWidth={1.9} />
                    <span className="truncate text-sm font-medium">{currentUser?.email}</span>
                  </div>
                  <p className={cn('text-[11px]', muted)}>
                    Email is managed by your sign-in account and cannot be changed here.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div className="section-shell site-shell-pad">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]',
                      isDark
                        ? 'bg-cyan-400/10 text-cyan-100 ring-1 ring-inset ring-cyan-300/14'
                        : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                    )}
                  >
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <div>
                    <h3 className={cn('font-display text-[1.1rem] font-semibold', txt)}>
                      Account overview
                    </h3>
                    <p className={cn('mt-1 text-sm leading-6', sub)}>
                      Your chosen avatar, identity fields, and account role are all kept in sync
                      with the same profile record used across the app.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div
                    className={cn(
                      'rounded-[18px] p-3',
                      isDark
                        ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]'
                        : 'bg-violet-50/50 ring-1 ring-inset ring-violet-100'
                    )}
                  >
                    <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', muted)}>
                      Avatar style
                    </div>
                    <div className={cn('mt-2 text-sm font-medium', txt)}>
                      {avatarSelection.avatarStyle}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'rounded-[18px] p-3',
                      isDark
                        ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]'
                        : 'bg-violet-50/50 ring-1 ring-inset ring-violet-100'
                    )}
                  >
                    <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', muted)}>
                      Profile record
                    </div>
                    <div className={cn('mt-2 text-sm font-medium', txt)}>Synced to database</div>
                  </div>
                </div>
              </div>

              <div className="section-shell site-shell-pad">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]',
                      isDark
                        ? 'bg-fuchsia-400/10 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-300/14'
                        : 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-200'
                    )}
                  >
                    <KeyRound className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <div>
                    <h3 className={cn('font-display text-[1.1rem] font-semibold', txt)}>Security</h3>
                    <p className={cn('mt-1 text-sm leading-6', sub)}>
                      Send yourself a secure password reset email whenever you want to rotate your
                      credentials.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {resetSent ? (
                    <div
                      className={cn(
                        'rounded-[18px] px-4 py-3 text-sm',
                        isDark
                          ? 'border border-emerald-400/16 bg-emerald-400/10 text-emerald-200'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      )}
                    >
                      Reset email sent to <strong>{currentUser?.email}</strong>.
                    </div>
                  ) : (
                    <button
                      onClick={handleResetPassword}
                      disabled={resetSending}
                      className={cn(
                        'flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-semibold transition disabled:opacity-45',
                        isDark
                          ? 'bg-[linear-gradient(180deg,rgba(26,44,69,0.96),rgba(17,31,52,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/18 shadow-[0_16px_34px_-26px_rgba(34,211,238,0.32)] hover:brightness-110'
                          : 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 hover:bg-cyan-100'
                      )}
                    >
                      <Mail className="h-4 w-4" strokeWidth={1.9} />
                      {resetSending ? 'Sending...' : 'Send password reset email'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className={cn(
                  'text-sm font-medium transition',
                  isDark ? 'text-purple-100/50 hover:text-purple-100/82' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
