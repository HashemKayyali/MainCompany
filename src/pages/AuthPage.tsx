import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, RefreshCw, User } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthCharacters from '../components/auth/AuthCharacters'
import AnimatedBackground from '../components/theme/AnimatedBackground'
import UserAvatar from '../components/ui/UserAvatar'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { getSafeRedirectPath } from '../lib/auth-routing'
import {
  buildDefaultAvatarSelection,
  type AvatarSelection,
} from '../lib/avatar'
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
      {Icon && (
        <Icon
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/32"
        />
      )}
      <input
        {...props}
        className={cn(
          'h-[46px] w-full rounded-[13px] border bg-white/[0.07] text-[13.5px] font-medium text-white',
          'placeholder:text-white/28 backdrop-blur-sm',
          'transition-all duration-300',
          'focus:outline-none focus:bg-white/[0.10] focus:ring-2 focus:ring-violet-400/30',
          error
            ? 'border-red-400/40 focus:border-red-400/60'
            : 'border-white/[0.12] focus:border-violet-400/55',
          Icon ? 'pl-10 pr-4' : 'px-4',
          right ? '!pr-11' : ''
        )}
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  )
}

const labelClass =
  'mb-[5px] block text-[10px] font-bold uppercase tracking-[0.14em] text-white/48'

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
            'linear-gradient(180deg,rgba(6,4,18,0.97) 0%,rgba(10,6,24,0.96) 50%,rgba(8,5,18,0.98) 100%)',
        }}
      />

      <div
        className="pointer-events-none absolute left-[-18%] top-[-6%] h-[52%] w-[72%] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(ellipse,rgba(124,58,237,0.28) 0%,rgba(109,40,217,0.12) 38%,transparent 68%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[10%] right-[-16%] h-[44%] w-[64%] rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(ellipse,rgba(6,182,212,0.22) 0%,rgba(8,145,178,0.08) 44%,transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="pointer-events-none absolute left-[20%] top-[40%] h-[36%] w-[60%] rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(ellipse,rgba(236,72,153,0.18) 0%,transparent 62%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px"
        style={{
          background:
            'linear-gradient(180deg,transparent,rgba(124,58,237,0.22) 30%,rgba(139,92,246,0.14) 70%,transparent)',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 p-8 pb-0">
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px]"
          style={{
            background: 'linear-gradient(145deg,#7c3aed 0%,#d946ef 48%,#22d3ee 112%)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.45)',
          }}
        >
          <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/20 blur-md" />
          <span className="relative text-[10px] font-black tracking-[0.22em] text-white">EV</span>
        </div>
        <div>
          <div className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">
            <span className="text-violet-300">Eventies</span>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">
            Event Services Marketplace
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto px-8 pb-5">
        <p className="font-display text-[1.88rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
          Everything your
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#a78bfa 0%,#ec4899 46%,#22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            event needs.
          </span>
        </p>
        <p className="mt-2.5 text-[12.5px] font-medium leading-relaxed text-white/42">
          Discover rentals, services, and trusted event partners - all in one place.
        </p>
      </div>

      <div className="relative z-10 flex w-full items-end justify-center pb-0 pt-3">
        <AuthCharacters
          isTyping={isTyping}
          passwordHidden={passwordHidden}
          passwordVisible={passwordVisible}
        />
      </div>

      <div className="relative z-10 flex gap-5 px-8 py-4 text-[10px] font-medium text-white/26">
        <span>(c) {new Date().getFullYear()} Eventies</span>
        <a href="#" className="transition-colors hover:text-white/52">Privacy</a>
        <a href="#" className="transition-colors hover:text-white/52">Terms</a>
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
  const fadeMs = reduceMotion ? 0 : 260
  const motionEase = [0.22, 1, 0.36, 1] as const
  const cardTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: motionEase }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState('')
  const [avatarSelection, setAvatarSelection] = useState<AvatarSelection>(() =>
    buildDefaultAvatarSelection('guest')
  )

  const shuffleAvatar = useCallback(() => {
    const seed = Math.random().toString(36).slice(2, 10)
    setAvatarSelection(buildDefaultAvatarSelection(seed))
  }, [])

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

  const fadeVariants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : direction > 0 ? 28 : -28,
      y: reduceMotion ? 0 : 2,
      scale: reduceMotion ? 1 : 0.988,
    }),
    show: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: (direction: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : direction > 0 ? -18 : 18,
      y: reduceMotion ? 0 : -2,
      scale: reduceMotion ? 1 : 0.992,
    }),
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="flex items-center justify-center text-white/35 transition-colors hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div className="relative flex min-h-[100dvh] overflow-x-hidden">
      {!reduceMotion && <AnimatedBackground position="absolute" className="z-0" />}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: isDark ? 'rgba(2,3,10,0.52)' : 'rgba(2,3,10,0.38)' }}
      />

      <div className="relative z-[2] hidden shrink-0 lg:block lg:min-h-[100dvh] lg:w-[44%] xl:w-[42%]">
        <LeftPanel
          isTyping={isTyping}
          passwordHidden={passwordHidden}
          passwordVisible={passwordVisible}
        />
      </div>

      <div className="relative z-[2] flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-6">
        <div className="absolute left-5 top-6 flex items-center gap-2.5 lg:hidden">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[11px]"
            style={{
              background: 'linear-gradient(145deg,#7c3aed 0%,#d946ef 48%,#22d3ee 112%)',
              boxShadow: '0 6px 18px rgba(124,58,237,0.4)',
            }}
          >
            <span className="text-[9px] font-black tracking-[0.22em] text-white">EV</span>
          </div>
          <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/80">
            <span className="text-violet-300">Eventies</span>
          </span>
        </div>

        <motion.div
          layout
          initial={skipCardIntro || reduceMotion ? false : { opacity: 0, y: 18, scale: 0.984 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={cardTransition}
          className="relative w-full max-w-[474px] overflow-hidden rounded-[26px] transform-gpu xl:max-w-[492px]"
          style={{
            background: 'rgba(9,7,22,0.84)',
            backdropFilter: 'blur(28px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.62), 0 0 0 1px rgba(139,92,246,0.06), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-violet-400/16 to-transparent" />

          <motion.div
            layout
            transition={cardTransition}
            className="px-6 pt-6 pb-1.5 sm:px-7 sm:pt-7"
          >
            <div
              className="mb-5 flex gap-1 rounded-[13px] p-1"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {(['login', 'register'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchTo(mode)}
                  className={cn(
                    'flex-1 rounded-[10px] py-2 text-[12px] font-bold transition-all duration-300',
                    uiMode === mode
                      ? 'text-white shadow-[0_4px_14px_rgba(124,58,237,0.38)]'
                      : 'text-white/44 hover:text-white/68'
                  )}
                  style={
                    uiMode === mode
                      ? {
                          background:
                            'linear-gradient(135deg,#7c3aed 0%,#b832e1 60%,#ec4899 100%)',
                        }
                      : {}
                  }
                >
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h1 className="font-display text-[1.68rem] font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[1.74rem]">
              {uiMode === 'login' ? 'Welcome back' : 'Join Eventies'}
            </h1>
            <p className="mt-1 text-[12.75px] font-medium leading-relaxed text-white/48 sm:text-[13px]">
              {uiMode === 'login'
                ? 'Sign in to browse our catalog, request rentals, and manage your events.'
                : 'Create your account to start booking equipment and services for your events.'}
            </p>
          </motion.div>

          <motion.div layout transition={cardTransition} className="px-6 sm:px-7">
            <AnimatePresence initial={false}>
              {success && (
                <motion.div
                  layout
                  key="success"
                  initial={{ opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={cardTransition}
                  className="mt-3 flex items-start gap-2.5 rounded-[12px] border border-emerald-300/22 bg-emerald-400/12 px-4 py-3 text-[12.5px] font-semibold text-emerald-100"
                >
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  {success}
                </motion.div>
              )}
              {error && (
                <motion.div
                  layout
                  key="error"
                  initial={{ opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={cardTransition}
                  className="mt-3 flex items-start gap-2.5 rounded-[12px] border border-red-300/20 bg-red-400/10 px-4 py-3 text-[12.5px] font-semibold text-red-100"
                >
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            layout
            transition={cardTransition}
            className="px-6 pb-5 sm:px-7 sm:pb-6"
          >
            <AnimatePresence mode="wait" initial={false} custom={switchDirection}>
              {uiMode === 'login' ? (
                <motion.div
                  layout
                  key="login"
                  variants={fadeVariants}
                  custom={switchDirection}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={cardTransition}
                  className="will-change-transform"
                  style={{ transformOrigin: 'top center' }}
                >
                  <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
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
                          className="h-[14px] w-[14px] rounded-[4px] border-white/20 bg-white/10 text-violet-500 focus:ring-2 focus:ring-violet-400/30 focus:ring-offset-0"
                        />
                        <span className="text-[12px] font-medium text-white/50 transition-colors hover:text-white/70">
                          Remember me
                        </span>
                      </label>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-violet-300/80 transition-colors hover:text-violet-200 focus:outline-none focus-visible:underline"
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
                      className="btn-primary pc-cta mt-0.5 w-full !min-h-[46px] !rounded-[14px] !text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? 'Signing in...' : success ? 'Redirecting...' : 'Sign In ->'}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTo('register')}
                      className="flex h-[46px] w-full items-center justify-center rounded-[13px] border border-white/[0.12] bg-white/[0.05] px-4 text-[12.5px] font-semibold text-white/55 transition-all hover:bg-white/[0.09] hover:text-white/82"
                    >
                      Don't have an account?{' '}
                      <span className="text-violet-300">Sign up free</span>
                    </button>

                    <Link
                      to="/"
                      className="flex items-center justify-center gap-1.5 pt-0.5 text-[11.5px] font-medium text-white/30 transition-colors hover:text-white/60"
                    >
                      <ArrowLeft size={11} />
                      Back to site
                    </Link>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  key="register"
                  variants={fadeVariants}
                  custom={switchDirection}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={cardTransition}
                  className="will-change-transform"
                  style={{ transformOrigin: 'top center' }}
                >
                  <form onSubmit={handleRegister} className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_176px] sm:items-end">
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

                      <div>
                        <label className={labelClass}>Profile Avatar</label>
                        <div className="flex h-[46px] items-center gap-2.5 rounded-[13px] border border-white/[0.10] bg-white/[0.05] px-2.5">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                            <UserAvatar
                              avatarStyle={avatarSelection.avatarStyle}
                              avatarSeed={avatarSelection.avatarSeed}
                              avatarOptions={avatarSelection.avatarOptions}
                              size={36}
                              className="h-9 w-9"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10.5px] font-semibold text-white/62">
                              Random starter avatar
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={shuffleAvatar}
                            aria-label="Shuffle avatar"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/[0.07] text-white/50 transition-all hover:bg-white/[0.14] hover:text-white/90 active:scale-95"
                          >
                            <RefreshCw size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
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
                          <span className="normal-case tracking-normal text-white/28">
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

                    <div className="grid gap-3 sm:grid-cols-2">
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

                    <div className="grid gap-3 pt-0.5 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={busy || !!success}
                        className="btn-primary pc-cta !min-h-[46px] !rounded-[14px] !text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Creating...' : success ? 'Check email' : 'Create Account ->'}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchTo('login')}
                        className="h-[46px] rounded-[13px] border border-white/[0.12] bg-white/[0.05] px-3 text-[12px] font-semibold text-white/52 transition-all hover:bg-white/[0.09] hover:text-white/78"
                      >
                        Back to sign in
                      </button>
                    </div>

                    <Link
                      to="/"
                      className="flex items-center justify-center gap-1.5 pt-0.5 text-[11.5px] font-medium text-white/30 transition-colors hover:text-white/60"
                    >
                      <ArrowLeft size={11} />
                      Back to site
                    </Link>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-4 text-center text-[10.5px] font-medium text-white/24">
              (c) {new Date().getFullYear()} Eventies - Event Services Marketplace
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
