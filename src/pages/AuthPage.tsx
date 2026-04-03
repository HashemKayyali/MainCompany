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
    if (authError) {
      setError(authError)
      setSuccess('')
      return
    }

    if (notice) {
      setSuccess(notice)
      setError('')
    }
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
      const suffix = redirectTarget && redirectTarget !== '/'
        ? `?redirect=${encodeURIComponent(redirectTarget)}`
        : ''
      navigate(`${nextPath}${suffix}`, { replace: false })
      window.setTimeout(() => {
        isSwitchingRef.current = false
      }, 60)
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

    if (result.ok) {
      pendingRedirectRef.current = true
      setSuccess(result.message)
      return
    }

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
    const result = await register(
      name.trim(),
      email.trim(),
      phone.trim(),
      password,
      avatarSelection
    )
    setBusy(false)

    if (result.ok) {
      pendingRedirectRef.current = result.sessionReady
      setSuccess(result.message)

      if (result.requiresEmailConfirmation) {
        setPassword('')
        setConfirm('')
      }

      return
    }

    pendingRedirectRef.current = false
    setError(result.message || 'Register failed')
  }

  const inputClass =
    'w-full rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-[14px] font-semibold text-white placeholder:text-white/55 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition focus:border-violet-300/35 focus:outline-none focus:ring-2 focus:ring-violet-400/35'
  const labelClass = 'mb-2 block text-[12px] font-bold text-violet-100/90'
  const cardClass =
    `relative w-full overflow-hidden rounded-[26px] border border-white/18 bg-white/14 backdrop-blur-2xl ${
      uiMode === 'register' ? 'max-w-[860px]' : 'max-w-[420px]'
    } ` +
    (isDark
      ? 'shadow-[0_20px_80px_rgba(0,0,0,0.55)]'
      : 'shadow-[0_18px_60px_rgba(0,0,0,0.18)]')

  const fadeVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -6 },
  }

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" />}
      <div className={`absolute inset-0 z-[1] ${isDark ? 'bg-black/35' : 'bg-black/10'}`} />

      <div className="relative z-[2] flex min-h-[100dvh] items-center justify-center px-5 py-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className={cardClass}
        >
          <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber shadow-lg shadow-prism-violet/25">
                <span className="font-display text-sm font-black text-white">BL</span>
              </div>
              <div>
                <div className="font-display text-[1.02rem] font-extrabold text-white">Bike Land</div>
                <div className="text-xs font-semibold text-white/75">Access</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-display text-[1.85rem] font-extrabold leading-tight text-white drop-shadow">
                {uiMode === 'login' ? 'Welcome back' : 'Create your account'}
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/78">
                {uiMode === 'login'
                  ? 'Sign in to continue to your dashboard and services.'
                  : 'Join Bike Land to order parts, request quotes, and track updates.'}
              </p>
            </div>
          </div>

          <div className="px-5 sm:px-6">
            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-200/30 bg-emerald-200/20 px-3 py-2.5 text-sm font-bold text-emerald-50">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200/25 bg-red-200/15 px-3 py-2.5 text-sm font-bold text-red-50">
                {error}
              </div>
            )}
          </div>

          <div className="px-5 pb-6 sm:px-6 sm:pb-7">
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
                        onChange={(event) => setEmail(event.target.value)}
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
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        required
                        className={inputClass}
                      />
                    </div>

                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/12 bg-black/14 px-4 py-3 text-left backdrop-blur-xl transition hover:border-white/18 hover:bg-black/18">
                      <div>
                        <div className="text-sm font-bold text-white">Remember Me</div>
                        <div className="mt-1 text-xs font-medium text-white/62">
                          Keep this session signed in on this device.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-4.5 w-4.5 rounded border-white/25 bg-white/10 text-violet-500 focus:ring-2 focus:ring-violet-400/35 focus:ring-offset-0"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={busy || !!success}
                      className="btn-primary w-full !rounded-2xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? 'Signing in...' : success ? 'Continue' : 'Login'}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTo('register')}
                      className="w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/20 active:bg-white/25"
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
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Full Name *</label>
                            <input
                              value={name}
                              onChange={(event) => setName(event.target.value)}
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
                              onChange={(event) => setEmail(event.target.value)}
                              className={inputClass}
                              placeholder="you@example.com"
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
                              onChange={(event) => setPhone(event.target.value)}
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
                              onChange={(event) => setPassword(event.target.value)}
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
                              onChange={(event) => setConfirm(event.target.value)}
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
                        description="Choose a deterministic portrait avatar now. You can refresh or refine it later from your account center."
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={busy || !!success}
                        className="btn-primary w-full !rounded-2xl disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Creating account...' : success ? 'Check your email' : 'Sign Up'}
                      </button>

                      <button
                        type="button"
                        onClick={() => switchTo('login')}
                        className="w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/20 active:bg-white/25"
                      >
                        Back to login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 text-center text-xs font-medium text-white/70">
              (c) {new Date().getFullYear()} Bike Land
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
