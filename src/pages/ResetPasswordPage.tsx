import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useSession } from '../contexts/SessionContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Reset Password', noIndex: true })

  const { authUser, loading: sessionLoading } = useSession()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const hasRecoveryTokens = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    return Boolean(
      hashParams.get('type') === 'recovery' ||
      hashParams.get('access_token') ||
      hashParams.get('refresh_token')
    )
  }, [])

  const [linkChecked, setLinkChecked] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const muted = isDark ? 'text-purple-300/40' : 'text-gray-400'
  const ready = !!authUser

  useEffect(() => {
    if (sessionLoading) return
    if (authUser) {
      setLinkChecked(true)
      return
    }

    const timer = window.setTimeout(() => {
      setLinkChecked(true)
      setError(
        hasRecoveryTokens
          ? 'This reset link may be expired or invalid. Please request a new one.'
          : 'Open the password reset link from your email to choose a new password.'
      )
    }, 800)

    return () => window.clearTimeout(timer)
  }, [authUser, hasRecoveryTokens, sessionLoading])

  const handleSubmit = async () => {
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      await supabase.auth.signOut()
      setDone(true)
      toast('Password updated successfully!', 'success')
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update password'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="site-section">
      <div className="site-container max-w-[32rem]">
        <div className="mb-8 text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              isDark
                ? 'border border-violet-500/20 bg-violet-500/10'
                : 'border border-violet-200 bg-violet-50'
            }`}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke={isDark ? '#a78bfa' : '#7c3aed'}
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M7 11V8a5 5 0 1 1 10 0v3" />
              <circle cx="12" cy="16" r="1.5" />
            </svg>
          </div>
          <h1 className={`mt-4 font-display text-[1.85rem] font-bold ${txt}`}>
            {done ? 'Password Updated' : 'Reset Your Password'}
          </h1>
          <p className={`mt-2 text-sm ${sub}`}>
            {done ? 'You can now sign in with your new password.' : 'Enter your new password below.'}
          </p>
        </div>

        {done ? (
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium ${
                isDark
                  ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              Redirecting you to sign in...
            </div>
            <div className="mt-5">
              <Link to="/login" className="btn-primary inline-flex">
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : sessionLoading || (!linkChecked && !error) ? (
          <div className="py-10 text-center">
            <div
              className={`mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
                isDark ? 'border-purple-400' : 'border-violet-500'
              }`}
            />
            <p className={`mt-4 text-sm ${sub}`}>Verifying reset link...</p>
          </div>
        ) : error && !ready ? (
          <div className="text-center">
            <div
              className={`rounded-2xl px-5 py-4 text-sm ${
                isDark
                  ? 'border border-red-400/20 bg-red-400/10 text-red-300'
                  : 'border border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {error}
            </div>
            <div className="mt-5 flex flex-col items-center gap-3">
              <Link to="/login" className="btn-primary inline-flex">
                Back to Sign In
              </Link>
              <Link
                to="/"
                className={`text-sm ${
                  isDark ? 'text-purple-200/50 hover:text-purple-200/80' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <label className={`mb-2 block text-[12px] font-mono uppercase tracking-wider ${muted}`}>
                New Password
              </label>
              <input
                className={`form-field ${error ? '!border-red-400/40' : ''}`}
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="At least 6 characters"
                minLength={6}
                autoFocus
              />
            </div>

            <div className="glass rounded-2xl p-5">
              <label className={`mb-2 block text-[12px] font-mono uppercase tracking-wider ${muted}`}>
                Confirm Password
              </label>
              <input
                className={`form-field ${error ? '!border-red-400/40' : ''}`}
                type="password"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value)
                  setError('')
                }}
                placeholder="Repeat your password"
                onKeyDown={(event) => event.key === 'Enter' && void handleSubmit()}
              />
            </div>

            {password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((index) => {
                  const strength =
                    password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1
                  const active = index <= strength
                  const color =
                    strength <= 1
                      ? 'bg-red-500'
                      : strength === 2
                        ? 'bg-amber-500'
                        : strength === 3
                          ? 'bg-cyan-500'
                          : 'bg-emerald-500'

                  return (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        active ? color : isDark ? 'bg-white/[0.06]' : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>
            )}

            {error && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  isDark ? 'bg-red-400/10 text-red-400' : 'bg-red-50 text-red-600'
                }`}
              >
                {error}
              </div>
            )}

            <button
              onClick={() => void handleSubmit()}
              disabled={saving || !password || !confirm}
              className="btn-primary w-full !rounded-2xl disabled:opacity-40"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>

            <div className="text-center">
              <Link
                to="/"
                className={`text-sm ${
                  isDark ? 'text-purple-200/50 hover:text-purple-200/80' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
