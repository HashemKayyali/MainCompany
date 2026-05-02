import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthCharacters from '../components/auth/AuthCharacters'
import AnimatedBackground from '../components/theme/AnimatedBackground'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { getSafeRedirectPath } from '../lib/auth-routing'
import { cn } from '../utils/cn'

type Mode = 'login' | 'register'
type AuthLocationState = {
  authModeSwitch?: boolean
}

function AuthInput({
  icon: Icon,
  error,
  right,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType
  error?: boolean
  right?: React.ReactNode
}) {
  return (
    <div className="relative">
      <input
        {...props}
        className={cn(
          'h-[46px] w-full rounded-[13px] border bg-white text-[13px] font-medium text-ink-900',
          'placeholder:text-violet-400/55',
          'transition-all duration-300',
          'focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/40',
          error
            ? 'border-red-300 focus:border-red-400'
            : 'border-violet-200/85 focus:border-violet-500',
          Icon ? 'pl-10 pr-3.5' : 'px-3.5',
          right ? '!pr-10' : ''
        )}
        style={{ color: '#1a0b3d' }}
      />
      {Icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-violet-500/65"
        >
          <Icon size={14} strokeWidth={2.05} absoluteStrokeWidth />
        </span>
      )}
      {right && (
        <div className="absolute inset-y-0 right-3 z-10 flex items-center">{right}</div>
      )}
    </div>
  )
}

const labelClass =
  'mb-1.5 block text-[9.5px] font-bold uppercase tracking-[0.18em] text-violet-700/85'

function LeftPanel({
  isTyping,
  passwordHidden,
  passwordVisible,
}: {
  isTyping: boolean
  passwordHidden: boolean
  passwordVisible: boolean
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg,#f4eeff 0%,#e9defc 50%,#f1e8ff 100%)',
        }}
      />

      <div
        className="pointer-events-none absolute left-[-18%] top-[-6%] h-[52%] w-[72%] rounded-full opacity-80"
        style={{
          background:
            'radial-gradient(ellipse,rgba(168,85,247,0.40) 0%,rgba(124,58,237,0.18) 38%,transparent 68%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[10%] right-[-16%] h-[44%] w-[64%] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(ellipse,rgba(217,70,239,0.30) 0%,rgba(168,85,247,0.10) 44%,transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="pointer-events-none absolute left-[20%] top-[40%] h-[36%] w-[60%] rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(ellipse,rgba(196,165,255,0.36) 0%,transparent 62%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.14) 1px,transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px"
        style={{
          background:
            'linear-gradient(180deg,transparent,rgba(124,58,237,0.32) 30%,rgba(168,85,247,0.20) 70%,transparent)',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 p-8 pb-0">
        <div
          className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
          style={{
            background: 'linear-gradient(145deg,#7c3aed 0%,#a855f7 48%,#c026d3 112%)',
            boxShadow: '0 12px 32px -6px rgba(124,58,237,0.55)',
          }}
        >
          <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/30 blur-md" />
          <span className="relative text-[10.5px] font-black tracking-[0.22em] text-white">EV</span>
        </div>
        <div>
          <div className="font-display text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: '#1a0b3d' }}>
            <span className="text-violet-700">Eventies</span>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-600/72">
            Event Services Marketplace
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto px-8 pb-5">
        <p
          className="font-display text-[1.92rem] font-extrabold leading-[1.08] tracking-[-0.04em]"
          style={{ color: '#1a0b3d' }}
        >
          Everything your
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 46%,#c026d3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            event needs.
          </span>
        </p>
        <p className="mt-3 text-[12.5px] font-medium leading-relaxed" style={{ color: 'rgba(61,35,112,0.78)' }}>
          Discover rentals, services, and trusted event partners — all in one place.
        </p>
      </div>

      <div className="relative z-10 flex w-full items-end justify-center pb-0 pt-3">
        <AuthCharacters
          isTyping={isTyping}
          passwordHidden={passwordHidden}
          passwordVisible={passwordVisible}
        />
      </div>

      <div className="relative z-10 flex gap-5 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600/65">
        <span>&copy; {new Date().getFullYear()} Eventies</span>
        <a href="#" className="transition-colors hover:text-violet-800">Privacy</a>
        <a href="#" className="transition-colors hover:text-violet-800">Terms</a>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { isDark } = useTheme()
  const location = useLocation()
  const { pathname } = location
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
  const locationState = location.state as AuthLocationState | null
  const skipCardIntro = Boolean(locationState?.authModeSwitch)
  const [uiMode, setUiMode] = useState<Mode>(routeMode)
  const [switchDirection, setSwitchDirection] = useState<1 | -1>(
    routeMode === 'register' ? 1 : -1
  )
  const fadeMs = reduceMotion ? 0 : 280
  const motionEase = [0.22, 1, 0.36, 1] as const
  const cardTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: motionEase }
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: motionEase }
  const tabTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: motionEase }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const passwordHidden =
    uiMode === 'login'
      ? password.length > 0 && !showPassword
      : (password.length > 0 && !showPassword) || (confirm.length > 0 && !showConfirm)
  const passwordVisible =
    uiMode === 'login'
      ? password.length > 0 && showPassword
      : (password.length > 0 && showPassword) || (confirm.length > 0 && showConfirm)

  const pendingRedirectRef = useRef(false)
  const pendingTimerRef = useRef<number | null>(null)

  useEffect(() => {
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
    if (next === uiMode) return
    setSwitchDirection(next === 'register' ? 1 : -1)
    setError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirm(false)
    pendingRedirectRef.current = false
    if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)
    setUiMode(next)
    pendingTimerRef.current = window.setTimeout(() => {
      const nextPath = next === 'login' ? '/login' : '/register'
      const suffix =
        redirectTarget && redirectTarget !== '/'
          ? `?redirect=${encodeURIComponent(redirectTarget)}`
          : ''
      navigate(`${nextPath}${suffix}`, {
        replace: false,
        state: { authModeSwitch: true },
      })
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
      password
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

  const contentVariants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : direction > 0 ? 22 : -22,
      y: reduceMotion ? 0 : 8,
      scale: reduceMotion ? 1 : 0.988,
    }),
    show: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: (direction: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : direction > 0 ? -16 : 16,
      y: reduceMotion ? 0 : -6,
      scale: reduceMotion ? 1 : 0.992,
    }),
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="flex items-center justify-center text-violet-500/65 transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  // Note: isDark is referenced from useTheme but always false; kept for future-proofing.
  void isDark

  return (
    <div className="relative flex min-h-[100dvh] overflow-x-hidden">
      {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" variant="lightweight" />}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: 'rgba(251,248,255,0.18)' }}
      />

      <div className="relative z-[2] hidden shrink-0 lg:block lg:min-h-[100dvh] lg:w-[44%] xl:w-[42%]">
        <LeftPanel
          isTyping={isTyping}
          passwordHidden={passwordHidden}
          passwordVisible={passwordVisible}
        />
      </div>

      <div className="relative z-[2] flex flex-1 items-center justify-center px-4 py-12 sm:px-5 sm:py-9 lg:px-8 lg:py-6">
        <div className="absolute left-5 top-6 flex items-center gap-2.5 lg:hidden">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[11px]"
            style={{
              background: 'linear-gradient(145deg,#7c3aed 0%,#a855f7 48%,#c026d3 112%)',
              boxShadow: '0 8px 22px -4px rgba(124,58,237,0.55)',
            }}
          >
            <span className="text-[9px] font-black tracking-[0.22em] text-white">EV</span>
          </div>
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#1a0b3d' }}>
            <span className="text-violet-700">Eventies</span>
          </span>
        </div>

        <motion.div
          layout
          initial={skipCardIntro || reduceMotion ? false : { opacity: 0, y: 18, scale: 0.984 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={cardTransition}
          className="relative my-5 w-full max-w-[448px] overflow-hidden rounded-[28px] transform-gpu sm:my-3 xl:max-w-[462px]"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            border: '1px solid rgba(124,58,237,0.16)',
            boxShadow:
              '0 32px 80px -22px rgba(124,58,237,0.32), 0 8px 24px -8px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/55 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-violet-400/30 to-transparent" />

          <motion.div
            layout
            transition={contentTransition}
            className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6"
          >
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="flex gap-1 rounded-[13px] p-[3px]"
              style={{
                background: 'rgba(244,238,255,0.88)',
                border: '1px solid rgba(124,58,237,0.14)',
              }}
            >
              {(['login', 'register'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchTo(mode)}
                  id={mode === 'login' ? 'auth-tab-login' : 'auth-tab-register'}
                  role="tab"
                  aria-selected={uiMode === mode}
                  aria-controls={mode === 'login' ? 'auth-panel-login' : 'auth-panel-register'}
                  tabIndex={uiMode === mode ? 0 : -1}
                  className={cn(
                    'relative flex-1 overflow-hidden rounded-[10px] py-[10px] text-[11.5px] font-bold transition-all duration-300',
                    uiMode === mode
                      ? 'text-white'
                      : 'text-violet-700/70 hover:text-violet-800'
                  )}
                >
                  {uiMode === mode && (
                    <motion.span
                      layoutId="auth-active-tab"
                      className="absolute inset-0 rounded-[10px]"
                      transition={tabTransition}
                      style={{
                        background:
                          'linear-gradient(135deg,#7c3aed 0%,#a855f7 60%,#c026d3 100%)',
                        boxShadow: '0 6px 18px -4px rgba(124,58,237,0.55)',
                      }}
                    />
                  )}
                  <span className="relative z-[1]">
                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                  </span>
                </button>
              ))}
            </div>

            <motion.div
              layout
              transition={contentTransition}
              className="relative mt-[18px] overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false} custom={switchDirection}>
                {uiMode === 'login' ? (
                  <motion.section
                    layout
                    id="auth-panel-login"
                    role="tabpanel"
                    aria-labelledby="auth-tab-login"
                    key="login"
                    variants={contentVariants}
                    custom={switchDirection}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={contentTransition}
                    className="space-y-3.5 will-change-transform"
                    style={{ transformOrigin: 'top center' }}
                  >
                    <div className="space-y-1.5">
                      <h1 className="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.58rem]" style={{ color: '#1a0b3d' }}>
                        Welcome back
                      </h1>
                      <p className="text-[12px] font-medium leading-relaxed text-violet-700/72 sm:text-[12.2px]">
                        Sign in to browse our catalog, request rentals, and manage your
                        events.
                      </p>
                    </div>

                    <AnimatePresence initial={false}>
                      {success && (
                        <motion.div
                          layout
                          key="login-success"
                          initial={{ opacity: 0, y: -8, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.985 }}
                          transition={contentTransition}
                          role="status"
                          className="flex items-start gap-2 rounded-[12px] border border-emerald-300 bg-emerald-50/85 px-3.5 py-2.5 text-[12px] font-semibold text-emerald-700"
                        >
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          {success}
                        </motion.div>
                      )}
                      {error && (
                        <motion.div
                          layout
                          key="login-error"
                          initial={{ opacity: 0, y: -8, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.985 }}
                          transition={contentTransition}
                          role="alert"
                          className="flex items-start gap-2 rounded-[12px] border border-red-300 bg-red-50/85 px-3.5 py-2.5 text-[12px] font-semibold text-red-700"
                        >
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-2.5">
                      <div>
                        <label className={labelClass}>Email</label>
                        <AuthInput
                          type="email"
                          icon={Mail}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          placeholder="you@company.com"
                          autoComplete="email"
                          inputMode="email"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Password</label>
                        <AuthInput
                          type={showPassword ? 'text' : 'password'}
                          icon={Lock}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          placeholder="Your password"
                          autoComplete="current-password"
                          required
                          right={
                            <EyeToggle
                              show={showPassword}
                              onToggle={() => setShowPassword(v => !v)}
                            />
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label className="flex cursor-pointer select-none items-center gap-2">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="h-[15px] w-[15px] rounded-[4px] border-violet-300 bg-white text-violet-600 accent-violet-600 focus:ring-2 focus:ring-violet-400/30 focus:ring-offset-0"
                          />
                          <span className="text-[11.5px] font-medium text-violet-700/85 transition-colors hover:text-violet-900">
                            Remember me
                          </span>
                        </label>
                        <button
                          type="button"
                          className="text-[11.5px] font-semibold text-violet-600 transition-colors hover:text-violet-800 focus:outline-none focus-visible:underline"
                          onClick={() => {
                            /* forgot-password */
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={busy || !!success}
                        className="btn-primary pc-cta mt-0.5 w-full !min-h-[44px] !rounded-[14px] !text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Signing in...' : success ? 'Redirecting...' : 'Sign In ->'}
                      </button>

                      <button
                        type="button"
                        onClick={() => switchTo('register')}
                        className="flex h-[46px] w-full items-center justify-center gap-1.5 rounded-[13px] border border-violet-200/85 bg-white px-4 text-[12px] font-semibold text-violet-700/80 transition-all hover:border-violet-400 hover:bg-violet-50/85 hover:text-violet-900"
                      >
                        Don't have an account?{' '}
                        <span className="text-violet-700">Sign up free</span>
                      </button>

                      <Link
                        to="/"
                        className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-violet-500/72 transition-colors hover:text-violet-700"
                      >
                        <ArrowLeft size={11} />
                        Back to site
                      </Link>
                    </form>
                    <p className="pt-1 text-center text-[10px] font-medium text-violet-500/65">
                      &copy; {new Date().getFullYear()} Eventies — Event Services Marketplace
                    </p>
                  </motion.section>
                ) : (
                  <motion.section
                    layout
                    id="auth-panel-register"
                    role="tabpanel"
                    aria-labelledby="auth-tab-register"
                    key="register"
                    variants={contentVariants}
                    custom={switchDirection}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={contentTransition}
                    className="space-y-3.5 will-change-transform"
                    style={{ transformOrigin: 'top center' }}
                  >
                    <div className="space-y-1.5">
                      <h1 className="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[1.58rem]" style={{ color: '#1a0b3d' }}>
                        Join Eventies
                      </h1>
                      <p className="text-[12px] font-medium leading-relaxed text-violet-700/72 sm:text-[12.2px]">
                        Create your account to start booking equipment and services for your
                        events.
                      </p>
                    </div>

                    <AnimatePresence initial={false}>
                      {success && (
                        <motion.div
                          layout
                          key="register-success"
                          initial={{ opacity: 0, y: -8, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.985 }}
                          transition={contentTransition}
                          role="status"
                          className="flex items-start gap-2 rounded-[12px] border border-emerald-300 bg-emerald-50/85 px-3.5 py-2.5 text-[12px] font-semibold text-emerald-700"
                        >
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          {success}
                        </motion.div>
                      )}
                      {error && (
                        <motion.div
                          layout
                          key="register-error"
                          initial={{ opacity: 0, y: -8, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.985 }}
                          transition={contentTransition}
                          role="alert"
                          className="flex items-start gap-2 rounded-[12px] border border-red-300 bg-red-50/85 px-3.5 py-2.5 text-[12px] font-semibold text-red-700"
                        >
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister} className="space-y-2.5">
                      <div>
                        <label className={labelClass}>Full Name *</label>
                        <AuthInput
                          icon={User}
                          value={name}
                          onChange={e => setName(e.target.value)}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          placeholder="Your full name"
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Email *</label>
                          <AuthInput
                            type="email"
                            icon={Mail}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            placeholder="you@company.com"
                            autoComplete="email"
                            inputMode="email"
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Phone{' '}
                            <span className="normal-case tracking-normal text-violet-500/55">
                              optional
                            </span>
                          </label>
                          <AuthInput
                            type="tel"
                            icon={Phone}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            placeholder="+962..."
                            autoComplete="tel"
                            inputMode="tel"
                          />
                        </div>
                      </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Password *</label>
                        <AuthInput
                          type={showPassword ? 'text' : 'password'}
                          icon={Lock}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          placeholder="Min 6 chars"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          error={password.length > 0 && password.length < 6}
                          right={
                            <EyeToggle
                              show={showPassword}
                              onToggle={() => setShowPassword(v => !v)}
                            />
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Confirm *</label>
                        <AuthInput
                          type={showConfirm ? 'text' : 'password'}
                          icon={Lock}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          placeholder="Repeat"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          error={confirm.length > 0 && confirm !== password}
                          right={
                            <EyeToggle
                              show={showConfirm}
                              onToggle={() => setShowConfirm(v => !v)}
                            />
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5 pt-0.5 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={busy || !!success}
                        className="btn-primary pc-cta !min-h-[44px] !rounded-[14px] !text-[12.75px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Creating...' : success ? 'Check email' : 'Create Account ->'}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchTo('login')}
                        className="h-[46px] rounded-[13px] border border-violet-200/85 bg-white px-3 text-[11.75px] font-semibold text-violet-700/80 transition-all hover:border-violet-400 hover:bg-violet-50/85 hover:text-violet-900"
                      >
                        Back to sign in
                      </button>
                    </div>

                    <Link
                      to="/"
                      className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-violet-500/72 transition-colors hover:text-violet-700"
                    >
                      <ArrowLeft size={11} />
                      Back to site
                    </Link>
                    </form>
                    <p className="pt-1 text-center text-[10px] font-medium text-violet-500/65">
                      &copy; {new Date().getFullYear()} Eventies — Event Services Marketplace
                    </p>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
