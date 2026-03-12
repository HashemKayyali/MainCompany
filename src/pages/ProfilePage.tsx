import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProfilePage() {
  usePageMeta({ title: 'Profile', noIndex: true })
  const { currentUser, isLoggedIn } = useUser()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const muted = isDark ? 'text-purple-300/40' : 'text-gray-400'

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setPhone(currentUser.phone || '')
    }
  }, [currentUser])

  if (!isLoggedIn) {
    return (
      <section className="pt-32 pb-24">
        <div className="max-w-md mx-auto px-6 text-center">
          <h1 className={`font-display text-3xl font-bold ${txt}`}>Profile</h1>
          <p className={`mt-4 ${sub}`}>Please sign in to view your profile.</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">Sign In</Link>
        </div>
      </section>
    )
  }

  const hasChanges = name !== (currentUser?.name || '') || phone !== (currentUser?.phone || '')

  const handleSave = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() || null, phone: phone.trim() || null })
        .eq('id', currentUser.id)

      if (error) throw error
      toast('Profile updated', 'success')

      // Refresh — force re-fetch by reloading session context
      window.location.reload()
    } catch (err: any) {
      toast(err?.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
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
      toast('Password reset email sent! Check your inbox.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to send reset email', 'error')
    } finally {
      setResetSending(false)
    }
  }

  const userInitial = (currentUser?.name?.trim()?.[0] || 'U').toUpperCase()

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-lg mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-2xl font-bold font-display ${
            isDark
              ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/20'
              : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700 border border-violet-200'
          }`}>
            {userInitial}
          </div>
          <h1 className={`font-display text-2xl font-bold mt-5 ${txt}`}>
            {currentUser?.name || 'Your Profile'}
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>{currentUser?.email}</p>
          <p className={`text-xs mt-1 font-mono ${muted}`}>
            Member since {new Date(currentUser?.createdAt || '').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name */}
          <div className="glass p-6">
            <label className={`block text-[12px] font-mono uppercase tracking-wider mb-2 ${muted}`}>
              Full Name
            </label>
            <input
              className="form-field"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          {/* Phone */}
          <div className="glass p-6">
            <label className={`block text-[12px] font-mono uppercase tracking-wider mb-2 ${muted}`}>
              Phone Number
            </label>
            <input
              className="form-field"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+962..."
              maxLength={20}
            />
          </div>

          {/* Email (read-only) */}
          <div className="glass p-6">
            <label className={`block text-[12px] font-mono uppercase tracking-wider mb-2 ${muted}`}>
              Email
            </label>
            <div className={`form-field opacity-60 cursor-not-allowed ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>
              {currentUser?.email}
            </div>
            <p className={`text-[11px] mt-2 ${muted}`}>Email cannot be changed.</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="btn-primary w-full !rounded-2xl disabled:opacity-40"
          >
            {saving ? '⏳ Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Password section */}
        <div className={`mt-10 rounded-2xl border p-6 ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
          <h2 className={`font-display text-lg font-bold ${txt}`}>Password</h2>
          <p className={`text-sm mt-1 mb-5 ${sub}`}>
            We'll send a password reset link to your email.
          </p>

          {resetSent ? (
            <div className={`px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
              ✅ Reset email sent to <strong>{currentUser?.email}</strong>. Check your inbox!
            </div>
          ) : (
            <button
              onClick={handleResetPassword}
              disabled={resetSending}
              className={`w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-medium border transition-all ${
                isDark
                  ? 'border-cyan-500/20 text-cyan-300/80 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-40'
                  : 'border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-40'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="12" height="9" rx="1.5" /><path d="M2 5l6 4.5L14 5" /></svg>
              {resetSending ? 'Sending...' : 'Send Password Reset Email'}
            </button>
          )}
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link to="/" className={`text-sm font-medium ${isDark ? 'text-purple-200/50 hover:text-purple-200/80' : 'text-gray-400 hover:text-gray-600'}`}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
