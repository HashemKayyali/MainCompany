import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../contexts/UserContext'
import { useTheme } from '../contexts/ThemeContext'

export default function RegisterPage() {
  const { register, isLoggedIn } = useUser()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) return <Navigate to="/" replace />

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setBusy(true)
    const r = await register(name.trim(), email.trim(), phone.trim(), password)
    setBusy(false)

    if (r === true) navigate('/')
    else setError(r)
  }

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-600'

  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-6 py-20 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
          <p className={`text-sm mt-1.5 ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>Join Bike Land to order parts and request quotes</p>
        </div>
        <div className="glass p-6">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="form-field" required />
            </div>
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-field" required />
            </div>
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="form-field" placeholder="+962..." />
            </div>
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-field" required />
            </div>
            <div>
              <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Confirm Password *</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="form-field" required />
            </div>
            {error && (
              <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-red-400/15 border border-red-400/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {error}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full !rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className={`text-center text-sm mt-4 ${isDark ? 'text-purple-300/80' : 'text-gray-500'}`}>
          Have an account? <Link to="/user-login" className={`font-semibold ${isDark ? 'text-prism-violet' : 'text-violet-600'}`}>Sign In</Link>
        </p>
      </motion.div>
    </section>
  )
}
