import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useUser } from '../contexts/UserContext'
import { useTheme } from '../contexts/ThemeContext'
import AnimatedBackground from '../components/theme/AnimatedBackground'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const { login, register, isLoggedIn, isAdmin } = useUser()

  // ✅ المنطق الحقيقي حسب الراوت
  const routeMode: Mode = pathname.includes('register') ? 'register' : 'login'
  const routeIsLogin = routeMode === 'login'

  // ✅ UI state (حتى نخلي الأنيميشن سلس)
  const [uiMode, setUiMode] = useState<Mode>(routeMode)

  // ✅ مدة الفيد (لازم تطابق)
  const FADE_MS = reduceMotion ? 0 : 260

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const pendingRedirectRef = useRef(false)
  const pendingTimerRef = useRef<number | null>(null)
  const isSwitchingRef = useRef(false)

  // ✅ مزامنة UI مع الراوت (لكن مش أثناء السويتش)
  useEffect(() => {
    if (isSwitchingRef.current) return
    setUiMode(routeMode)
  }, [routeMode])

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)
    }
  }, [])

  // ✅ بعد تسجيل الدخول: روح للصفحة المناسبة
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

  if (isLoggedIn) return <Navigate to={isAdmin ? '/admin' : '/'} replace />

  // ✅ سويتش Fade: أولاً غيّر UI (ليصير خروج/دخول)، بعدين غيّر الراوت
  const switchTo = (next: Mode) => {
    setError('')
    setSuccess('')
    if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)

    isSwitchingRef.current = true
    setUiMode(next)

    pendingTimerRef.current = window.setTimeout(() => {
      navigate(next === 'login' ? '/user-login' : '/register', { replace: false })
      window.setTimeout(() => {
        isSwitchingRef.current = false
      }, 60)
    }, FADE_MS)
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

const inputClass =
  'w-full rounded-2xl px-4 py-3 text-[15px] font-semibold ' +
  // ✅ glass input
  'bg-white/12 backdrop-blur-xl text-white placeholder:text-white/55 ' +
  'border border-white/18 shadow-[0_10px_30px_rgba(0,0,0,0.25)] ' +
  // ✅ focus
  'focus:outline-none focus:ring-2 focus:ring-violet-400/35 focus:border-violet-300/35 ' +
  'transition'

const labelClass = 'block text-[13px] mb-2 font-extrabold text-violet-100/90'
  const card =
    'relative w-full max-w-[460px] rounded-[28px] overflow-hidden ' +
    'bg-white/14 backdrop-blur-2xl border border-white/18 ' +
    (isDark ? 'shadow-[0_20px_80px_rgba(0,0,0,0.55)]' : 'shadow-[0_18px_60px_rgba(0,0,0,0.18)]')

  const fadeVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -6 },
  }

  return (
    <section className="min-h-[100dvh] relative overflow-hidden">
      {/* ✅ نفس الخلفية المستوردة */}
      {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" />}

      {/* طبقة تباين خفيفة عشان الكارد يبين */}
      <div className={`absolute inset-0 z-[1] ${isDark ? 'bg-black/35' : 'bg-black/10'}`} />

      <div className="relative z-[2] min-h-[100dvh] flex items-center justify-center px-5 py-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className={card}
        >
          {/* رأس الكارد */}
          <div className="p-6 sm:p-7 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/25">
                <span className="text-white font-black text-sm font-display">BL</span>
              </div>
              <div>
                <div className="text-white text-lg font-extrabold font-display tracking-wide">Bike Land</div>
                <div className="text-white/75 text-sm font-semibold">Portal</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-white text-2xl font-display font-extrabold leading-tight drop-shadow">
                {uiMode === 'login' ? 'Welcome back' : 'Create your account'}
              </div>
              <p className="text-white/80 text-sm mt-2 leading-relaxed font-semibold">
                {uiMode === 'login'
                  ? 'Sign in to continue to your dashboard and services.'
                  : 'Join Bike Land to order parts, request quotes, and track updates.'}
              </p>
            </div>
          </div>

          {/* Alerts */}
          <div className="px-6 sm:px-7">
            {success && (
              <div className="mb-4 px-3 py-2.5 rounded-2xl text-sm bg-emerald-200/20 border border-emerald-200/30 text-emerald-50 font-bold">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-2xl text-sm bg-red-200/15 border border-red-200/25 text-red-50 font-bold">
                {error}
              </div>
            )}
          </div>

          {/* ✅ محتوى يتبدّل بفيد */}
          <div className="px-6 sm:px-7 pb-7">
            <AnimatePresence mode="wait" initial={false}>
              {uiMode === 'login' ? (
                <motion.div
                  key="login"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
                >
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

                    {/* ✅ زر تحت ليفتح register */}
                    <button
                      type="button"
                      onClick={() => switchTo('register')}
                      className="w-full rounded-2xl px-4 py-3 text-sm font-extrabold
                                 bg-white/15 text-white border border-white/20
                                 hover:bg-white/20 active:bg-white/25 transition"
                    >
                      Create an account
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
                >
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

                    {/* ✅ زر تحت يرجع ل login */}
                    <button
                      type="button"
                      onClick={() => switchTo('login')}
                      className="w-full rounded-2xl px-4 py-3 text-sm font-extrabold
                                 bg-white/15 text-white border border-white/20
                                 hover:bg-white/20 active:bg-white/25 transition"
                    >
                      Back to login
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-white/70 text-xs font-semibold">
              © {new Date().getFullYear()} Bike Land
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}