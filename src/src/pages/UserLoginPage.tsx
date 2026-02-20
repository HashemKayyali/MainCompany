import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../contexts/UserContext'
import { useTheme } from '../contexts/ThemeContext'

export default function UserLoginPage() {
  const { login, isLoggedIn } = useUser()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) return <Navigate to="/" replace />

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
    const r = await login(email.trim(), password)
    setBusy(false)

    if (r === true) navigate('/')
    else setError(r)
  }

  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-6 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
          <p className={`text-sm mt-1.5 ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>Sign in to your account</p>
        </div>
        <div className="glass p-6">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-field" required />
            </div>
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-field" required />
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
        <p className={`text-center text-sm mt-4 ${isDark ? 'text-purple-300/80' : 'text-gray-500'}`}>
          No account? <Link to="/register" className={`font-semibold ${isDark ? 'text-prism-violet' : 'text-violet-600'}`}>Register</Link>
        </p>
      </motion.div>
    </section>
  )
}
