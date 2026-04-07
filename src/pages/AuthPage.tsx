import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AnimatedBackground from '../components/theme/AnimatedBackground'
import AvatarPicker from '../components/ui/AvatarPicker'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { getSafeRedirectPath } from '../lib/auth-routing'
import {
  avatarIdentitySeed,
  buildDefaultAvatarSelection,
  type AvatarSelection,
} from '../lib/avatar'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reduceMotion = useReducedMotion()
  const { login, register, isLoggedIn, isAdmin, loading: userLoading } = useUser()
  const redirectParam = searchParams.get('redirect')
  const redirectTarget = redirectParam ? getSafeRedirectPath(redirectParam, '/') : null
  const authError = searchParams.get('authError') || ''
  const notice = searchParams.get('notice') || ''
  const defaultDestination = redirectTarget || (isAdmin ? '/admin' : '/')

  const routeMode: Mode = pathname.includes('register') ? 'register' : 'login'
  const [uiMode, setUiMode] = useState<Mode>(routeMode)
  const fadeMs = reduceMotion ? 0 : 240

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState('')
  const [avatarSelection, setAvatarSelection] = useState<AvatarSelection>(() =>
    buildDefaultAvatarSelection('guest')
  )
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const registerAvatarIdentitySeed = useMemo(
    () => avatarIdentitySeed([name, email]),
    [email, name]
  )

  const pendingRedirectRef = useRef(false)
  const pendingTimerRef = useRef<number | null>(null)
  const isSwitchingRef = useRef(false)

  useEffect(() => {
    if (isSwitchingRef.current) return
    setUiMode(routeMode)
  }, [routeMode])

  useEffect(() => {
    if (authError) { setError(authError); setSuccess(''); return }
    if (notice) { setSuccess(notice); setError('') }
  }, [authError, notice])

  useEffect(
    () => () => {
      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)
    },
    []
  )

  useEffect(() => {
    if (!isLoggedIn || userLoading) return
    if (pendingRedirectRef.current) {
      const timer = window.setTimeout(() => {
        navigate(defaultDestination, { replace: true })
      }, 650)
      return () => window.clearTimeout(timer)
    }
    navigate(defaultDestination, { replace: true })
  }, [defaultDestination, isLoggedIn, navigate, userLoading])

  if (isLoggedIn && !userLoading) return <Navigate to={defaultDestination} replace />

  const switchTo = (next: Mode) => {
    setError('')
    setSuccess('')
    pendingRedirectRef.current = false
    if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)
    isSwitchingRef.current = true
    setUiMode(next)
    pendingTimerRef.current = window.setTimeout(() => {
      const nextPath = next === 'login' ? '/login' : '/register'
      const suffix = redirectTarget && redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''
      navigate(`${nextPath}${suffix}`, { replace: false })
      window.setTimeout(() => { isSwitchingRef.current = false }, 60)
    }, fadeMs)
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) return setError('Enter your email')
    if (!password.trim()) return setError('Enter your password')
    setBusy(true)
    const result = await login(email.trim(), password, rememberMe)
    setBusy(false)
    if (result.ok) { pendingRedirectRef.current = true; setSuccess(result.message); return }
    pendingRedirectRef.current = false
    setError(result.message || 'Login failed')
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!name.trim() || !email.trim()) return setError('Name and email are required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setBusy(true)
    const result = await register(name.trim(), email.trim(), phone.trim(), password, avatarSelection)
    setBusy(false)
    if (result.ok) {
      pendingRedirectRef.current = result.sessionReady
      setSuccess(result.message)
      if (result.requiresEmailConfirmation) { setPassword(''); setConfirm('') }
      return
    }
    pendingRedirectRef.current = false
    setError(result.message || 'Register failed')
  }

  const inputClass =
    'w-full rounded-[14px] border border-white/[0.16] bg-white/[0.09] px-4 py-3 text-[13.5px] font-medium text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 focus:border-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:bg-white/[0.12]'

  const labelClass = 'mb-2 block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/60'

  const cardMaxWidth = uiMode === 'register' ? 'max-w-[900px]' : 'max-w-[440px]'

  const fadeVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -8 },
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" />}

      {/* Overlay */}
      <div className={`absolute inset-0 z-[1] ${isDark ? 'bg-black/40' : 'bg-black/15'}`} />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute left-[-10%] top-[-5%] z-[1] h-[50vh] w-[50vh] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-8%] bottom-[-6%] z-[1] h-[40vh] w-[40vh] rounded-full bg-cyan-500/15 blur-[100px]" />

      <div className="relative z-[2] flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-5">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full ${cardMaxWidth} overflow-hidden rounded-[28px] border border-white/[0.14] ${
            isDark ? 'bg-white/[0.08] shadow-[0_28px_80px_rgba(0,0,0,0.65)]' : 'bg-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.22)]'
          } backdrop-blur-2xl`}
        >
          {/* Inner glow at top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Card header */}
          <div className="px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber shadow-[0_8px_24px_rgba(124,58,237,0.4)]">
                <span className="font-display text-sm font-black text-white">BL</span>
              </div>
              <div>
                <div className="font-display text-[1.02rem] font-extrabold text-white">Bike Land</div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {uiMode === 'login' ? 'Member Access' : 'New Account'}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h1 className="font-display text-[1.9rem] font-extrabold leading-tight text-white">
                {uiMode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-white/65">
                {uiMode === 'login'
                  ? 'Sign in to manage requests, track rentals, and access your dashboard.'
                  : 'Join Bike Land to request quotes, track orders, and manage your event gear.'}
              </p>
            </div>
          </div>

          {/* Alerts */}
          <div className="px-6 sm:px-7">
            {success && (
              <div className="mb-4 rounded-[14px] border border-emerald-300/25 bg-emerald-400/15 px-4 py-3 text-[13px] font-semibold text-emerald-100">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-[14px] border border-red-300/22 bg-red-400/12 px-4 py-3 text-[13px] font-semibold text-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Forms */}
          <div className="px-6 pb-7 sm:px-7 sm:pb-8">
            <AnimatePresence mode="wait" initial={false}>
              {uiMode === 'login' ? (
                <motion.div
                  key="login"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={{ duration: fadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
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
                        required
                        className={inputClass}
                      />
                    </div>

                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-white/[0.10] bg-black/[0.16] px-4 py-3 backdrop-blur-sm transition-all hover:border-white/[0.18] hover:bg-black/[0.2]">
                      <div>
                        <div className="text-[13px] font-semibold text-white">Remember Me</div>
                        <div className="mt-0.5 text-[11.5px] font-medium text-white/55">
                          Keep this session signed in on this device.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-4.5 w-4.5 rounded-[5px] border-white/20 bg-white/10 text-violet-500 focus:ring-2 focus:ring-violet-400/30 focus:ring-offset-0"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={busy || !!success}
                      className="btn-primary w-full !min-h-[48px] !rounded-[14px] !text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? 'Signing in…' : success ? 'Redirecting…' : 'Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTo('register')}
                      className="w-full rounded-[14px] border border-white/[0.18] bg-white/[0.10] px-4 py-3 text-[13px] font-semibold text-white transition-all hover:bg-white/[0.15] active:bg-white/[0.2]"
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
                  transition={{ duration: fadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
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
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Email *</label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className={inputClass}
                              placeholder="you@company.com"
                              autoComplete="email"
                              inputMode="email"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
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
                              minLength={6}
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
                              minLength={6}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <AvatarPicker
                        compact
                        value={avatarSelection}
                        onChange={setAvatarSelection}
                        identitySeed={registerAvatarIdentitySeed}
                        description="Choose a deterministic portrait avatar. You can update it later from your profile."
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={busy || !!success}
                        className="btn-primary w-full !min-h-[48px] !rounded-[14px] !text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Creating account…' : success ? 'Check your email' : 'Create Account'}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchTo('login')}
                        className="w-full rounded-[14px] border border-white/[0.18] bg-white/[0.10] px-4 py-3 text-[13px] font-semibold text-white transition-all hover:bg-white/[0.15]"
                      >
                        Back to login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-[11.5px] font-medium text-white/50">
              © {new Date().getFullYear()} Bike Land — Event Services Marketplace
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
