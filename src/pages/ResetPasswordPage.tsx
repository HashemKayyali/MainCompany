import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { getErrorMessage } from '../lib/errors'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Reset Password', noIndex: true })

  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Enter your email address')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured')
      return
    }

    setSaving(true)

    try {
      const redirectTo = `${window.location.origin}/update-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

      if (resetError) throw resetError

      setSent(true)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to send reset link'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#fbf8ff] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(217,70,239,0.10),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(124,58,237,0.08),transparent_32%)]" />

      <section className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_30px_100px_-60px_rgba(76,29,149,0.35)] sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50">
            <Mail size={22} className="text-violet-600" />
          </div>
          <h1 className="mt-4 font-display text-[1.6rem] font-black tracking-[-0.04em] text-[#12051f] sm:text-[1.85rem]">
            {sent ? 'Check Your Inbox' : 'Forgot Password'}
          </h1>
          <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-[#150628]/70">
            {sent
              ? `If this email exists in our system, we sent a reset link to ${email}.`
              : 'Enter your email and we will send you a reset link.'}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-[12px] font-semibold text-emerald-700">
              If this account exists, you will receive a reset link shortly.
            </div>
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setEmail('')
                setError('')
              }}
              className="text-[12.5px] font-semibold text-[#150628]/70 hover:text-violet-700 hover:underline"
            >
              Send another link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-[#150628]/70">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={event => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  className={cn(
                    'h-[44px] w-full rounded-xl border bg-[#f8f5fc]/95 pl-9 pr-3 text-[12.5px] font-semibold text-[#150628] placeholder:text-xs placeholder:text-slate-400/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10',
                    error ? 'border-red-300 focus:border-red-400' : 'border-slate-200/90 focus:border-violet-400'
                  )}
                />
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-violet-500/70">
                  <Mail size={15} />
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !email.trim()}
              className="flex h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-4 text-[12.5px] font-black text-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.65)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Send reset link'}
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
