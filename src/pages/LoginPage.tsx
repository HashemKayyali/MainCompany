import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function LoginPage() {
  const { login, isAuth } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuth) return <Navigate to="/admin" replace />

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Enter your email')
      return
    }
    if (!password.trim()) {
      setError('Enter your password')
      return
    }

    setBusy(true)
    const res = await login(email.trim(), password)
    setBusy(false)

    if (res.ok) navigate('/admin')
    else setError(res.message || 'Login failed')
  }

  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-6 relative">
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,_rgba(124,58,237,0.04),_transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,_rgba(124,58,237,0.06),_transparent_70%)]'
        }`}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center mx-auto mb-3 shadow-lg shadow-prism-violet/30">
            <span className="text-white font-black text-sm font-display">BL</span>
          </div>
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Login</h1>
          <p className={`text-sm mt-1.5 ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>Sign in to manage Bike Land</p>
        </div>

        <div className="glass p-6">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bike-jo.com" className="form-field" />
            </div>

            <div>
              <label className={`block text-[13px] mb-2 font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="form-field" />
            </div>

            {error && (
              <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-red-400/15 border border-red-400/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full !rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  )
}
