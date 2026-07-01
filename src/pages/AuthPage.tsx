import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { BRAND_LOGO_HORIZONTAL } from '../config/brand'
import { getSafeRedirectPath } from '../lib/auth-routing'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { cn } from '../utils/cn'
import { usePageMeta } from '../hooks/usePageMeta'

type Mode = 'login' | 'register'

type OAuthProvider = 'google' | 'facebook' | 'apple'

type AuthLocationState = {
  authModeSwitch?: boolean
}

const AUTH_HERO_IMAGE = '/images/hero-bg-event.webp'

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/user-login',
  '/reset-password',
  '/forgot-password',
  '/update-password',
  '/auth/callback',
])

function getFriendlyAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect. Please try again.'
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'An account with this email already exists. Try signing in.'
  }
  if (lower.includes('email not confirmed') || lower.includes('email_confirm')) {
    return 'Please confirm your email before signing in.'
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  return message
}

function getPostLoginRedirect(redirectParam: string | null, fallback = '/') {
  const safe = redirectParam ? getSafeRedirectPath(redirectParam, fallback) : fallback
  const normalized = safe.split('?')[0]?.toLowerCase() || safe
  return AUTH_PATHS.has(normalized) ? fallback : safe
}

function AuthInput({
  icon: Icon,
  error,
  right,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType
  error?: boolean
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        {...props}
        className={cn(
          'h-[44px] w-full rounded-xl border bg-[#f8f5fc]/95 text-sm font-semibold text-[#150628]',
          'placeholder:text-xs placeholder:text-slate-400/70',
          'transition-all duration-300',
          'focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10',
          error
            ? 'border-red-300 focus:border-red-400'
            : 'border-slate-200/90 focus:border-violet-400',
          Icon ? 'pl-9 pr-3' : 'px-3',
          right ? '!pr-9' : ''
        )}
      />
      {Icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-violet-500/70"
        >
          <Icon size={15} strokeWidth={2} absoluteStrokeWidth />
        </span>
      )}
      {right && <div className="absolute inset-y-0 right-3 z-10 flex items-center">{right}</div>}
    </div>
  )
}

const labelClass = 'mb-1 block text-[11px] font-bold text-[#150628]/85'

const primaryButtonClass =
  'h-[44px] w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 px-4 text-[12.5px] font-black text-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(124,58,237,0.85)] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const secondaryButtonClass =
  'h-[44px] w-full rounded-xl border border-slate-200/90 bg-white px-4 text-[12.5px] font-bold text-[#150628]/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700 hover:shadow-[0_14px_30px_-28px_rgba(76,29,149,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] shrink-0">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.5h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] shrink-0">
      <path fill="#111827" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35-4.88-5.03-4.16-12.69 1.38-12.97 1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.14 1.88-2.4 6.03.48 7.19-.57 1.5-1.31 2.99-2.53 4.02ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  )
}

function SocialAuthOptions({
  mode,
  loadingProvider,
  onProviderClick,
}: {
  mode: Mode
  loadingProvider?: OAuthProvider | null
  onProviderClick?: (provider: OAuthProvider) => void
}) {
  const action = mode === 'login' ? 'Sign in' : 'Sign up'
  const providers: { name: string; provider: OAuthProvider; icon: React.ReactNode }[] = [
    { name: 'Google', provider: 'google', icon: <GoogleIcon /> },
    { name: 'Facebook', provider: 'facebook', icon: <FacebookIcon /> },
    { name: 'Apple', provider: 'apple', icon: <AppleIcon /> },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="-m-1 grid grid-cols-3 gap-2.5 overflow-visible p-1">
        {providers.map(({ name, provider, icon }) => {
          const isLoading = loadingProvider === provider
          return (
            <button
              key={provider}
              type="button"
              onClick={() => onProviderClick?.(provider)}
              disabled={!!loadingProvider}
              aria-label={`${action} with ${name}`}
              aria-busy={isLoading}
              className="auth-social-button group flex h-[46px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:border-violet-300 enabled:hover:bg-violet-50/60 enabled:hover:shadow-[0_14px_30px_-30px_rgba(76,29,149,0.5)] focus:outline-none active:border-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="h-[22px] w-[22px] animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
              ) : (
                icon
              )}
              <span className="truncate text-[9px] font-bold tracking-wide text-[#150628]/75 group-hover:text-violet-700">
                {isLoading ? 'Connecting...' : name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LeftHeroPanel() {
  return (
    <aside className="relative hidden h-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white lg:block lg:rounded-[34px]">
      <img
        src={AUTH_HERO_IMAGE}
        alt="Event services showcase"
        width={1600}
        height={1200}
        loading="eager"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.70)_0%,rgba(255,255,255,0.28)_42%,rgba(255,255,255,0.58)_100%),radial-gradient(circle_at_85%_18%,rgba(217,70,239,0.18),transparent_38%),radial-gradient(circle_at_78%_88%,rgba(124,58,237,0.13),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.07)_0_1px,transparent_1px_100%)] bg-[length:44px_44px] opacity-35" />
      <div className="pointer-events-none absolute inset-4 rounded-[22px] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] lg:inset-5 lg:rounded-[28px]" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6 xl:p-8">
        <Link
          to="/"
          aria-label="Eventies home"
          className="inline-flex w-fit flex-col gap-2 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
        >
          <span className="flex h-[44px] w-[150px] items-center rounded-[14px] bg-white/95 px-3 shadow-[0_14px_38px_-28px_rgba(124,58,237,0.45)] backdrop-blur-md xl:h-[48px] xl:w-[164px]">
            <img
              src={BRAND_LOGO_HORIZONTAL}
              alt="Eventies"
              width={164}
              height={48}
              className="block h-full w-full object-contain"
            />
          </span>
          <span className="ml-1 text-[9px] font-black uppercase tracking-[0.24em] text-violet-700/80">
            Event Services Marketplace
          </span>
        </Link>

        <div className="max-w-[26rem] pb-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-gradient-to-r from-white/95 to-violet-50/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Plan. Compare. Request.
          </div>
          <h2 className="font-display text-[2.9rem] font-black leading-[0.96] tracking-[-0.055em] text-[#0f172a] drop-shadow-[0_8px_30px_rgba(255,255,255,0.55)] xl:text-[3.5rem]">
            Plan your event request in one place.
          </h2>
          <p className="mt-5 max-w-[23rem] text-[13.5px] font-semibold leading-[1.65] text-[#1e1b4b]/80">
            Discover trusted providers, event rentals, games, screens, activations, and production services across Jordan.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default function AuthPage() {
  usePageMeta({ title: 'Account', noIndex: true })

  const location = useLocation()
  const { pathname } = location
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reduceMotion = useReducedMotion()
  const { login, register, isLoggedIn, loading: userLoading } = useUser()

  const redirectParam = searchParams.get('redirect')
  const redirectTarget = redirectParam ? getSafeRedirectPath(redirectParam, '/') : null
  const authError = searchParams.get('authError') || ''
  const notice = searchParams.get('notice') || ''
  const message = searchParams.get('message') || ''
  const defaultDestination = getPostLoginRedirect(redirectParam, '/')

  const routeMode: Mode = pathname.includes('register') ? 'register' : 'login'
  const locationState = location.state as AuthLocationState | null
  const skipCardIntro = Boolean(locationState?.authModeSwitch)
  const [uiMode, setUiMode] = useState<Mode>(routeMode)
  const [switchDirection, setSwitchDirection] = useState<1 | -1>(
    routeMode === 'register' ? 1 : -1
  )

  const fadeMs = reduceMotion ? 0 : 240
  const motionEase = [0.22, 1, 0.36, 1] as const
  const shellTransition = reduceMotion ? { duration: 0 } : { duration: 0.34, ease: motionEase }
  const contentTransition = reduceMotion ? { duration: 0 } : { duration: 0.24, ease: motionEase }
  const tabTransition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: motionEase }

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
  const [socialLoading, setSocialLoading] = useState<OAuthProvider | null>(null)

  const pendingTimerRef = useRef<number | null>(null)
  const messageCleanedRef = useRef(false)

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
      return
    }
    if (message === 'password-updated' && !messageCleanedRef.current) {
      messageCleanedRef.current = true
      setSuccess('Password updated successfully')
      setError('')

      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('message')
      const nextSearch = nextParams.toString()
      navigate(`${pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
    }
  }, [authError, notice, message, navigate, pathname, searchParams])

  useEffect(
    () => () => {
      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current)
    },
    []
  )

  if (isLoggedIn && !userLoading) return <Navigate to={defaultDestination} replace />

  const switchTo = (next: Mode) => {
    if (next === uiMode) return
    setSwitchDirection(next === 'register' ? 1 : -1)
    setError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirm(false)
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

    try {
      const result = await login(email.trim(), password, rememberMe)

      if (!result.ok) {
        setError(getFriendlyAuthError(result.message || 'Login failed'))
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData.session?.user) {
        setError('Session could not be established. Please try again.')
        return
      }

      setSuccess(result.message)
      navigate(defaultDestination, { replace: true })
    } catch (err: unknown) {
      setError('Login failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!name.trim() || !email.trim()) return setError('Name and email are required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setBusy(true)

    try {
      const result = await register(name.trim(), email.trim(), phone.trim(), password)

      if (!result.ok) {
        setError(getFriendlyAuthError(result.message || 'Register failed'))
        return
      }

      if (result.sessionReady) {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData.session?.user) {
          setError('Session could not be established. Please try again.')
          return
        }
        navigate(defaultDestination, { replace: true })
        return
      }

      setSuccess(result.message)
      if (result.requiresEmailConfirmation) {
        setPassword('')
        setConfirm('')
      }
    } catch (err: unknown) {
      setError('Registration failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleSocialClick = async (provider: OAuthProvider) => {
    setError('')
    setSuccess('')

    if (provider !== 'google') {
      const label = provider === 'facebook' ? 'Facebook' : 'Apple'
      setSuccess(`${label} login is coming soon.`)
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured')
      return
    }

    setSocialLoading(provider)

    // Preserve the intended post-login destination across the OAuth redirect.
    // The redirect URL passed to Supabase must be an exact allow-list match, so
    // we keep the return path in sessionStorage instead of query params.
    if (redirectTarget && redirectTarget !== '/') {
      try {
        window.sessionStorage.setItem('eventies:oauth:redirect', redirectTarget)
      } catch {
        // ignore storage errors
      }
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setSocialLoading(null)

    if (oauthError) {
      setError(oauthError.message || 'Google login failed')
    }
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="flex items-center justify-center text-slate-400 transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  const authCopy =
    uiMode === 'login'
      ? {
          title: 'Welcome Back',
          description: 'Enter your email and password to access your Eventies account.',
        }
      : {
          title: 'Join Eventies',
          description: 'Create your account to request rentals and plan your next event.',
        }

  return (
    <main className="relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#fbf8ff] p-3 sm:p-4">
      <img
        src={AUTH_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        width={1600}
        height={1200}
        loading="eager"
        decoding="async"
        draggable={false}
        className="fixed inset-0 h-full w-full scale-105 object-cover object-right opacity-16 blur-[2px]"
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(217,70,239,0.12),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(124,58,237,0.09),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(250,245,255,0.86)_48%,rgba(255,255,255,0.96))]" />
      <div className="fixed inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.06)_0_1px,transparent_1px_100%)] bg-[length:56px_56px] opacity-40" />

      <motion.section
        initial={skipCardIntro || reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={shellTransition}
        className="relative z-10 w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_100px_-60px_rgba(76,29,149,0.4)] lg:h-[720px] lg:max-h-[calc(100dvh-2rem)] lg:rounded-[42px]"
      >
        <div className="grid h-full lg:grid-cols-2">
          <LeftHeroPanel />

          <section className="relative flex h-full min-h-0 flex-col items-center justify-start overflow-x-hidden overflow-y-auto bg-white px-5 py-6 sm:px-8 lg:justify-center lg:px-10 xl:px-14">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(168,85,247,0.07),transparent_34%),linear-gradient(180deg,#ffffff_0%,#fffafe_100%)]" />
              <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-fuchsia-200/25 blur-3xl" />
              <div className="absolute -left-28 bottom-20 h-64 w-64 rounded-full bg-violet-200/24 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-[430px] overflow-x-hidden py-2 lg:py-0">
              <Link
                to="/"
                aria-label="Eventies home"
                className="mb-5 flex justify-center lg:hidden"
              >
                <img
                  src={BRAND_LOGO_HORIZONTAL}
                  alt="Eventies"
                  width={150}
                  height={38}
                  className="h-[38px] w-auto object-contain"
                />
              </Link>

              <div
                role="tablist"
                aria-label="Authentication mode"
                className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-[0_14px_38px_-32px_rgba(76,29,149,0.45)]"
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
                      'relative min-h-[40px] overflow-hidden rounded-full px-4 text-[12.5px] font-black transition-colors duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15',
                      uiMode === mode ? 'text-white' : 'text-[#150628] hover:text-violet-700'
                    )}
                  >
                    {uiMode === mode && (
                      <motion.span
                        layoutId="auth-active-tab"
                        transition={tabTransition}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_14px_28px_-18px_rgba(124,58,237,0.95)]"
                      />
                    )}
                    <span className="relative z-10">{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4 text-center">
                <h1 className="font-display text-[1.9rem] font-black leading-none tracking-[-0.05em] text-[#12051f] sm:text-[2.25rem]">
                  {authCopy.title}
                </h1>
                <p className="mx-auto mt-2 max-w-[22rem] text-[12px] font-semibold leading-relaxed text-[#150628]/70">
                  {authCopy.description}
                </p>
              </div>

              <div className="grid">
                <motion.div
                  role="tabpanel"
                  id="auth-panel-login"
                  aria-labelledby="auth-tab-login"
                  aria-hidden={uiMode !== 'login'}
                  animate={{
                    opacity: uiMode === 'login' ? 1 : 0,
                    x: uiMode === 'login' ? 0 : switchDirection > 0 ? -18 : 18,
                  }}
                  transition={contentTransition}
                  className={cn(
                    'col-start-1 row-start-1',
                    uiMode === 'login' ? 'visible z-10' : 'invisible -z-10'
                  )}
                >
                  {success && (
                    <div
                      role="status"
                      className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12px] font-semibold text-emerald-700"
                    >
                      {success}
                    </div>
                  )}
                  {error && (
                    <div
                      role="alert"
                      className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] font-semibold text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-2.5">
                    <div>
                      <label htmlFor="auth-email" className={labelClass}>Email</label>
                      <AuthInput
                        id="auth-email"
                        type="email"
                        icon={Mail}
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value)
                          if (success) setSuccess('')
                        }}
                        placeholder="Enter your email"
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="auth-password" className={labelClass}>Password</label>
                      <AuthInput
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        icon={Lock}
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value)
                          if (success) setSuccess('')
                        }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        right={<EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <label className="flex cursor-pointer select-none items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="h-[14px] w-[14px] rounded border-slate-300 bg-white text-violet-600 accent-violet-600 focus:ring-2 focus:ring-violet-400/30 focus:ring-offset-0"
                        />
                        <span className="text-[12px] font-medium text-[#150628]/70">Remember me</span>
                      </label>
                      <Link
                        to="/reset-password"
                        className="text-[12px] font-semibold text-[#150628] transition-colors hover:text-violet-700 focus:outline-none focus-visible:underline"
                      >
                        Forgot Password
                      </Link>
                    </div>

                    <button type="submit" disabled={busy} className={primaryButtonClass}>
                      {busy ? 'Signing in...' : 'Sign In'}
                    </button>

                    <SocialAuthOptions mode="login" loadingProvider={socialLoading} onProviderClick={handleSocialClick} />

                    <button type="button" onClick={() => switchTo('register')} className={secondaryButtonClass}>
                      Create a new account
                    </button>

                    <Link
                      to="/"
                      className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-medium text-[#150628]/62 transition-colors hover:text-violet-700"
                    >
                      <ArrowLeft size={12} />
                      Back to site
                    </Link>
                  </form>
                </motion.div>

                <motion.div
                  role="tabpanel"
                  id="auth-panel-register"
                  aria-labelledby="auth-tab-register"
                  aria-hidden={uiMode !== 'register'}
                  animate={{
                    opacity: uiMode === 'register' ? 1 : 0,
                    x: uiMode === 'register' ? 0 : switchDirection > 0 ? 18 : -18,
                  }}
                  transition={contentTransition}
                  className={cn(
                    'col-start-1 row-start-1',
                    uiMode === 'register' ? 'visible z-10' : 'invisible -z-10'
                  )}
                >
                  {success && (
                    <div
                      role="status"
                      className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12px] font-semibold text-emerald-700"
                    >
                      {success}
                    </div>
                  )}
                  {error && (
                    <div
                      role="alert"
                      className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] font-semibold text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-2.5">
                    <div>
                      <label htmlFor="auth-name" className={labelClass}>Full Name *</label>
                      <AuthInput
                        id="auth-name"
                        icon={User}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="auth-register-email" className={labelClass}>Email *</label>
                        <AuthInput
                          id="auth-register-email"
                          type="email"
                          icon={Mail}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          autoComplete="email"
                          inputMode="email"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="auth-phone" className={labelClass}>
                          Phone <span className="text-slate-400">optional</span>
                        </label>
                        <AuthInput
                          id="auth-phone"
                          type="tel"
                          icon={Phone}
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+962..."
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="auth-register-password" className={labelClass}>Password *</label>
                        <AuthInput
                          id="auth-register-password"
                          type={showPassword ? 'text' : 'password'}
                          icon={Lock}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          error={password.length > 0 && password.length < 6}
                          right={<EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />}
                        />
                      </div>
                      <div>
                        <label htmlFor="auth-confirm" className={labelClass}>Confirm *</label>
                        <AuthInput
                          id="auth-confirm"
                          type={showConfirm ? 'text' : 'password'}
                          icon={Lock}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          error={confirm.length > 0 && confirm !== password}
                          right={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={busy || !!success} className={primaryButtonClass}>
                      {busy ? 'Creating...' : success ? 'Check email' : 'Create Account'}
                    </button>

                    <SocialAuthOptions mode="register" loadingProvider={socialLoading} onProviderClick={handleSocialClick} />

                    <button type="button" onClick={() => switchTo('login')} className={secondaryButtonClass}>
                      Back to sign in
                    </button>

                    <Link
                      to="/"
                      className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-medium text-[#150628]/62 transition-colors hover:text-violet-700"
                    >
                      <ArrowLeft size={12} />
                      Back to site
                    </Link>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </motion.section>
    </main>
  )
}
