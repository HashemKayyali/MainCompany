import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'

export default function UserLoginPage() {
  const { login, isLoggedIn } = useUser()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) return setError('Enter your email')
    if (!password.trim()) return setError('Enter your password')

    setBusy(true)
    const result = await login(email.trim(), password, rememberMe)
    setBusy(false)

    if (result === true) navigate('/')
    else setError(result)
  }

  return (
    <section className="site-section">
      <div className="site-container max-w-[30rem]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="mb-6 text-center">
            <h1 className={`font-display text-[1.9rem] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome Back
            </h1>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>
              Sign in to your account
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`mb-2 block text-[13px] font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-field"
                  required
                />
              </div>

              <div>
                <label className={`mb-2 block text-[13px] font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="form-field"
                  required
                />
              </div>

              <label
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]'
                    : 'border-violet-200/80 bg-white/72 hover:bg-white/84'
                }`}
              >
                <div>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Remember Me
                  </div>
                  <div className={`mt-1 text-xs ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
                    Keep me signed in on this device.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4.5 w-4.5 rounded border-white/25 bg-white/10 text-violet-500 focus:ring-2 focus:ring-violet-400/35 focus:ring-offset-0"
                />
              </label>

              {error && (
                <div
                  className={`rounded-xl px-3 py-2.5 text-sm ${
                    isDark
                      ? 'border border-red-400/20 bg-red-400/15 text-red-400'
                      : 'border border-red-200 bg-red-50 text-red-600'
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className={`mt-4 text-center text-sm ${isDark ? 'text-purple-300/80' : 'text-gray-500'}`}>
            No account?{' '}
            <Link
              to="/register"
              className={`font-semibold ${isDark ? 'text-prism-violet' : 'text-violet-600'}`}
            >
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
