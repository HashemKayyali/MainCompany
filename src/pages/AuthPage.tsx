import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useUser } from '../contexts/UserContext'
import { useTheme } from '../contexts/ThemeContext'
import AnimatedBackground from '../components/theme/AnimatedBackground'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  // ✅ المنطق الحقيقي (حسب الراوت)
  const routeMode: Mode = pathname.includes('register') ? 'register' : 'login'
  const routeIsLogin = routeMode === 'login'

  // ✅ منطق الـ UI للأنيميشن (موحّد)
  const [uiIsLogin, setUiIsLogin] = useState(routeIsLogin)

  // ✅ مدة السويتش (لازم تطابق transition)
  const SWITCH_MS = reduceMotion ? 0 : 450

  const { login, register, isLoggedIn, isAdmin } = useUser()

  // login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // register fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const pendingRedirectRef = useRef(false)
  const pendingNavTimerRef = useRef<number | null>(null)

  // ✅ حافظ تزامن UI مع الراوت (لو المستخدم دخل من URL مباشرة أو رجع Back)
  useEffect(() => {
    setUiIsLogin(routeIsLogin)
  }, [routeIsLogin])

  // بعد login: اعرض success شوي وبعدين روح حسب الدور
  useEffect(() => {
    if (!isLoggedIn) return

    if (pendingRedirectRef.current) {
      const t = window.setTimeout(() => {
        navigate(isAdmin ? '/admin' : '/', { replace: true })
      }, 650)
      return () => window.clearTimeout(t)
    }

    navigate(isAdmin ? '/admin' : '/', { replace: true })
  }, [isLoggedIn, isAdmin, navigate])

  useEffect(() => {
    return () => {
      if (pendingNavTimerRef.current) window.clearTimeout(pendingNavTimerRef.current)
    }
  }, [])

  if (isLoggedIn) return <Navigate to={isAdmin ? '/admin' : '/'} replace />

  // ✅ سويتش موحّد: أنيميشن أولاً، ثم تغيير الراوت
  const switchTo = (next: Mode) => {
    setError('')
    setSuccess('')

    if (pendingNavTimerRef.current) window.clearTimeout(pendingNavTimerRef.current)

    const nextIsLogin = next === 'login'
    setUiIsLogin(nextIsLogin)

    pendingNavTimerRef.current = window.setTimeout(() => {
      navigate(nextIsLogin ? '/user-login' : '/register', { replace: false })
    }, SWITCH_MS)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) return setError('Enter your email')
    if (!password.trim()) return setError('Enter your password')

    setBusy(true)
    const res = await login(email.trim(), password)
    setBusy(false)

    if (res === true) {
      pendingRedirectRef.current = true
      setSuccess('Signed in successfully ✅')
      return
    }

    pendingRedirectRef.current = false
    setError(res || 'Login failed')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim()) return setError('Name and email are required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')

    setBusy(true)
    const r = await register(name.trim(), email.trim(), phone.trim(), password)
    setBusy(false)

    if (r === true) {
      setSuccess('Account created successfully ✅')
      window.setTimeout(() => navigate('/', { replace: true }), 750)
      return
    }

    setError(r || 'Register failed')
  }

  // ✅ حركة التبديل (desktop) حسب UI state (موحّد)
  const leftX = uiIsLogin ? '0%' : '100%'
  const rightX = uiIsLogin ? '0%' : '-100%'

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }

  const cardIntro = reduceMotion
    ? { initial: { opacity: 1, y: 0, scale: 1 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 14, scale: 0.99 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28 } }

  const inputClass =
    'w-full rounded-2xl px-4 py-3 text-[15px] font-medium ' +
    'bg-gray-50 text-gray-900 placeholder:text-gray-500 ' +
    'border border-gray-300 shadow-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 ' +
    'transition'

  const labelClass = 'block text-[13px] mb-2 font-semibold text-gray-800'

  return (
    <section className="min-h-[100dvh] relative overflow-hidden">
      <div className={`absolute inset-0 ${isDark ? 'bg-black/30' : 'bg-black/5'}`} />

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-5 py-10">
        <motion.div {...cardIntro} className="w-full max-w-6xl">
          <div className={`relative overflow-hidden rounded-[28px] shadow-2xl ${isDark ? 'shadow-black/50' : 'shadow-black/20'}`}>
            <div className="relative h-[720px] lg:h-[640px]">
              {/* LEFT PANEL */}
              <motion.div
                className="absolute inset-y-0 left-0 w-full lg:w-1/2 will-change-transform"
                animate={{ x: leftX }}
                transition={panelTransition}
              >
                <div className="relative h-full overflow-hidden">
                  {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" />}
                  <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/35 to-black/55" />

                  <div className="relative z-[2] h-full p-8 lg:p-10 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/30">
                        <span className="text-white font-black text-sm font-display">BL</span>
                      </div>
                      <div>
                        <div className="text-white text-lg font-extrabold font-display tracking-wide">Bike Land</div>
                        <div className="text-white/80 text-sm font-medium">Portal</div>
                      </div>
                    </div>

                    <div className="max-w-md">
                      <div className="text-white text-2xl lg:text-3xl font-display font-extrabold leading-tight drop-shadow">
                        {uiIsLogin ? 'Hello! Have a good day.' : 'Welcome! Create your account.'}
                      </div>
                      <p className="text-white/85 text-sm mt-3 leading-relaxed font-medium">
                        {uiIsLogin
                          ? 'Sign in to manage products, events, gallery, and bookings.'
                          : 'Join Bike Land to order parts, request quotes, and follow updates.'}
                      </p>

                      <button
                        type="button"
                        onClick={() => switchTo(uiIsLogin ? 'register' : 'login')}
                        className="mt-6 inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold text-white
                                   bg-white/15 border border-white/25 hover:bg-white/20 active:bg-white/25 transition"
                      >
                        {uiIsLogin ? 'Create an account →' : 'Already have an account? Sign in →'}
                      </button>
                    </div>

                    <div className="text-white/70 text-xs font-medium">© {new Date().getFullYear()} Bike Land</div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT PANEL */}
              <motion.div
                className="absolute inset-y-0 right-0 w-full lg:w-1/2 will-change-transform"
                animate={{ x: rightX }}
                transition={panelTransition}
              >
                {/* ✅ زودنا padding فوق/تحت + scroll لو الشاشة قصيرة */}
                <div className="h-full bg-white/95 backdrop-blur-sm px-8 lg:px-10 pt-10 pb-10 border-l border-black/5">
                  <div className="h-full overflow-y-auto pr-1">
                    <div className="min-h-full flex flex-col justify-center py-6">
                      <div className="mb-6">
                        <h1 className="font-display text-3xl font-extrabold text-gray-950">
                          {uiIsLogin ? 'Login' : 'Create Account'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1.5 font-medium">
                          {uiIsLogin ? 'Sign in to continue' : 'Join Bike Land to order parts and request quotes'}
                        </p>
                      </div>

                      {success && (
                        <div className="mb-4 px-3 py-2.5 rounded-2xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                          {success}
                        </div>
                      )}
                      {error && (
                        <div className="mb-4 px-3 py-2.5 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-700 font-semibold">
                          {error}
                        </div>
                      )}

                      {uiIsLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <label className={labelClass}>Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              autoComplete="email"
                              inputMode="email"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Password</label>
                            <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Your password"
                              autoComplete="current-password"
                              className={inputClass}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={busy || !!success}
                            className="btn-primary w-full !rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {busy ? 'Signing in…' : success ? 'Redirecting…' : 'Login'}
                          </button>

                          <div className="text-center text-sm text-gray-600 font-medium">
                            Don&apos;t have an account?{' '}
                            <button
                              type="button"
                              onClick={() => switchTo('register')}
                              className="font-extrabold text-violet-700 hover:underline"
                            >
                              Create an account
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <label className={labelClass}>Full Name *</label>
                            <input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className={inputClass}
                              placeholder="Your full name"
                              autoComplete="name"
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Email *</label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className={inputClass}
                              placeholder="you@example.com"
                              autoComplete="email"
                              inputMode="email"
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Phone</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              className={inputClass}
                              placeholder="+962..."
                              autoComplete="tel"
                              inputMode="tel"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Password *</label>
                            <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className={inputClass}
                              placeholder="At least 6 characters"
                              autoComplete="new-password"
                              required
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Confirm Password *</label>
                            <input
                              type="password"
                              value={confirm}
                              onChange={e => setConfirm(e.target.value)}
                              className={inputClass}
                              placeholder="Repeat password"
                              autoComplete="new-password"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={busy || !!success}
                            className="btn-primary w-full !rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {busy ? 'Creating Account…' : success ? 'Redirecting…' : 'Sign Up'}
                          </button>

                          <div className="text-center text-sm text-gray-600 font-medium">
                            Have an account?{' '}
                            <button
                              type="button"
                              onClick={() => switchTo('login')}
                              className="font-extrabold text-violet-700 hover:underline"
                            >
                              Sign In
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}