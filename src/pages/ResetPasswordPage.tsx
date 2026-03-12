import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Reset Password', noIndex: true })
  const { isDark } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const muted = isDark ? 'text-purple-300/40' : 'text-gray-400'

  // Wait for Supabase to pick up the recovery session from the URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if we already have a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    // Timeout — if after 5s still not ready, probably invalid/expired link
    const timer = setTimeout(() => {
      setReady(prev => {
        if (!prev) setError('This reset link may be expired or invalid. Please request a new one.')
        return prev
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

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

      setDone(true)
      toast('Password updated successfully!', 'success')

      // Redirect to home after 2s
      setTimeout(() => navigate('/'), 2000)
    } catch (err: any) {
      setError(err?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-md mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
            isDark ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200'
          }`}>
            <svg width="28" height="28" fill="none" stroke={isDark ? '#a78bfa' : '#7c3aed'} strokeWidth="1.8" strokeLinecap="round">
              <rect x="5" y="11" width="18" height="12" rx="2" />
              <path d="M8 11V8a6 6 0 1 1 12 0v3" />
              <circle cx="14" cy="17" r="1.5" />
            </svg>
          </div>
          <h1 className={`font-display text-2xl font-bold mt-5 ${txt}`}>
            {done ? 'Password Updated!' : 'Reset Your Password'}
          </h1>
          <p className={`text-sm mt-2 ${sub}`}>
            {done ? 'You can now sign in with your new password.' : 'Enter your new password below.'}
          </p>
        </div>

        {done ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium ${
              isDark ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}>
              ✅ Redirecting you to the home page...
            </div>
            <div className="mt-6">
              <Link to="/" className="btn-primary inline-flex">Go to Home</Link>
            </div>
          </div>
        ) : !ready && !error ? (
          /* ── Loading state ── */
          <div className="text-center py-12">
            <div className={`animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto ${isDark ? 'border-purple-400' : 'border-violet-500'}`} />
            <p className={`text-sm mt-4 ${sub}`}>Verifying reset link...</p>
          </div>
        ) : error && !ready ? (
          /* ── Error state (expired link) ── */
          <div className="text-center">
            <div className={`px-5 py-4 rounded-2xl text-sm ${isDark ? 'bg-red-400/10 border border-red-400/20 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {error}
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link to="/profile" className="btn-primary inline-flex">Request New Reset</Link>
              <Link to="/" className={`text-sm ${isDark ? 'text-purple-200/50 hover:text-purple-200/80' : 'text-gray-400 hover:text-gray-600'}`}>
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <div className="space-y-5">
            <div className="glass p-6">
              <label className={`block text-[12px] font-mono uppercase tracking-wider mb-2 ${muted}`}>
                New Password
              </label>
              <input
                className={`form-field ${error ? '!border-red-400/40' : ''}`}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="At least 6 characters"
                minLength={6}
                autoFocus
              />
            </div>

            <div className="glass p-6">
              <label className={`block text-[12px] font-mono uppercase tracking-wider mb-2 ${muted}`}>
                Confirm Password
              </label>
              <input
                className={`form-field ${error ? '!border-red-400/40' : ''}`}
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                placeholder="Repeat your password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => {
                  const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1
                  const active = i <= strength
                  const color = strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-cyan-500' : 'bg-emerald-500'
                  return (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${active ? color : isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`} />
                  )
                })}
              </div>
            )}

            {error && (
              <div className={`px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-red-400/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || !password || !confirm}
              className="btn-primary w-full !rounded-2xl disabled:opacity-40"
            >
              {saving ? '⏳ Updating...' : 'Update Password'}
            </button>

            <div className="text-center">
              <Link to="/" className={`text-sm ${isDark ? 'text-purple-200/50 hover:text-purple-200/80' : 'text-gray-400 hover:text-gray-600'}`}>
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
