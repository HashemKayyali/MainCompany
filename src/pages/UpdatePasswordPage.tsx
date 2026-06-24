import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { getErrorMessage } from '../lib/errors'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export default function UpdatePasswordPage() {
  usePageMeta({ title: 'Update Password', noIndex: true })

  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [checkingLink, setCheckingLink] = useState(true)
  const [linkReady, setLinkReady] = useState(false)
  const [linkError, setLinkError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const checkedRef = useRef(false)

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [window.location.search])
  const hashParams = useMemo(() => new URLSearchParams(window.location.hash.replace(/^#/, '')), [window.location.hash])

  const hasCode = useMemo(() => Boolean(searchParams.get('code')), [searchParams])
  const hasRecoveryHash = useMemo(
    () =>
      Boolean(
        hashParams.get('type') === 'recovery' ||
        hashParams.get('access_token') ||
        hashParams.get('refresh_token')
      ),
    [hashParams]
  )

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    async function checkRecoverySession() {
      if (!isSupabaseConfigured()) {
        setLinkError(true)
        setCheckingLink(false)
        return
      }

      try {
        if (hasCode) {
          const code = searchParams.get('code')
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError) throw exchangeError
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (data.session?.user) {
          setLinkReady(true)
        } else {
          setLinkError(true)
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'This reset link is invalid or expired'))
        setLinkError(true)
      } finally {
        setCheckingLink(false)
      }
    }

    void checkRecoverySession()
  }, [hasCode, hasRecoveryHash, searchParams])

  const strength = useMemo(() => {
    if (!password) return 0
    if (password.length >= 12) return 4
    if (password.length >= 8) return 3
    if (password.length >= 6) return 2
    return 1
  }, [password])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Enter a new password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      await supabase.auth.signOut()
      setSuccess(true)

      window.setTimeout(() => {
        navigate('/login?message=password-updated', { replace: true })
      }, 1500)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update password'))
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#fbf8ff] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(217,70,239,0.10),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(124,58,237,0.08),transparent_32%)]" />

      <section className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_30px_100px_-60px_rgba(76,29,149,0.35)] sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50">
            <Lock size={22} className="text-violet-600" />
          </div>
          <h1 className="mt-4 font-display text-[1.6rem] font-black tracking-[-0.04em] text-[#12051f] sm:text-[1.85rem]">
            {success ? 'Password Updated' : linkError ? 'Link Expired' : 'Update Password'}
          </h1>
          <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-[#150628]/70">
            {success
              ? 'You can now sign in with your new password.'
              : linkError
                ? 'This reset link is invalid or expired. Please request a new one.'
                : 'Enter your new password below.'}
          </p>
        </div>

        {checkingLink ? (
          <div className="py-6 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
            <p className="mt-4 text-sm text-[#150628]/70">Verifying reset link...</p>
          </div>
        ) : linkError ? (
          <div className="space-y-4 text-center">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[12px] font-semibold text-red-600">
                {error}
              </div>
            )}
            <Link
              to="/reset-password"
              className="inline-flex h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-5 text-[12.5px] font-black text-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.65)]"
            >
              Request new link
            </Link>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              Redirecting you to sign in...
            </div>
            <Link
              to="/login"
              className="inline-flex h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-5 text-[12.5px] font-black text-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.65)]"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-[#150628]/70">New Password</label>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                autoFocus
                className={cn(
                  'h-[44px] w-full rounded-xl border bg-[#f8f5fc]/95 px-3 text-[12.5px] font-semibold text-[#150628] placeholder:text-xs placeholder:text-slate-400/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10',
                  error ? 'border-red-300 focus:border-red-400' : 'border-slate-200/90 focus:border-violet-400'
                )}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-[#150628]/70">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                className={cn(
                  'h-[44px] w-full rounded-xl border bg-[#f8f5fc]/95 px-3 text-[12.5px] font-semibold text-[#150628] placeholder:text-xs placeholder:text-slate-400/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10',
                  error ? 'border-red-300 focus:border-red-400' : 'border-slate-200/90 focus:border-violet-400'
                )}
              />
            </div>

            {password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(index => {
                  const active = index <= strength
                  const color =
                    strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-cyan-500' : 'bg-emerald-500'

                  return (
                    <div
                      key={index}
                      className={cn('h-1 flex-1 rounded-full transition-all', active ? color : 'bg-slate-200')}
                    />
                  )
                })}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password || !confirmPassword}
              className="flex h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-4 text-[12.5px] font-black text-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.65)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-5 flex items-center justify-center">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#150628]/70 transition-colors hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
