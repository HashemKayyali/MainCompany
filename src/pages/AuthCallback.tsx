import { useEffect, useMemo, useRef, useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { buildLoginRedirect, getSafeRedirectPath } from '../lib/auth-routing'
import { supabase } from '../lib/supabase'

type CallbackPhase = 'processing' | 'redirecting' | 'error'

const OAUTH_REDIRECT_KEY = 'eventies:oauth:redirect'

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/user-login',
  '/reset-password',
  '/forgot-password',
  '/update-password',
  '/auth/callback',
])

function getFriendlyCallbackError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('access_denied')) return 'Sign-in was cancelled or denied.'
  if (lower.includes('invalid request')) return 'The sign-in link is invalid or has expired.'
  if (lower.includes('server_error')) return 'We could not complete sign-in due to a provider error.'
  if (lower.includes('popup_closed')) return 'The sign-in window was closed before finishing.'
  if (lower.includes('already been used') || lower.includes('invalid')) {
    return 'Your sign-in link is invalid, incomplete, or has already been used.'
  }
  return raw || 'We could not complete that sign-in. Please try again.'
}

function getPostAuthRedirect(redirectParam: string | null, fallback = '/') {
  const safe = redirectParam ? getSafeRedirectPath(redirectParam, fallback) : fallback
  const normalized = safe.split('?')[0]?.toLowerCase() || safe
  return AUTH_PATHS.has(normalized) ? fallback : safe
}

export default function AuthCallback() {
  usePageMeta({ title: 'Auth Callback', noIndex: true })

  const [phase, setPhase] = useState<CallbackPhase>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const redirectParam = params.get('redirect')

    let stored: string | null = null
    try {
      stored = window.sessionStorage.getItem(OAUTH_REDIRECT_KEY)
    } catch {
      // ignore storage errors
    }

    return getPostAuthRedirect(redirectParam || stored, '/')
  }, [])

  useEffect(() => {
    let cancelled = false

    async function finishSession() {
      const searchParams = new URLSearchParams(window.location.search)

      const authCode = searchParams.get('code')
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode)

        if (error) {
          // In React StrictMode this effect can run twice, which means the
          // one-time code may already have been consumed. If so, reuse the
          // session that was established by the first run instead of failing.
          const lower = error.message.toLowerCase()
          if (lower.includes('already been used') || lower.includes('invalid')) {
            const { data } = await supabase.auth.getSession()
            if (data.session?.user) return
          }
          throw error
        }

        const { data } = await supabase.auth.getSession()
        if (data.session?.user) return

        // The auth state event may not have propagated yet; give it a beat.
        await new Promise(resolve => window.setTimeout(resolve, 300))
        const { data: retryData } = await supabase.auth.getSession()
        if (retryData.session?.user) return

        throw new Error('Your sign-in link is invalid, incomplete, or has already been used.')
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) throw error

        const { data } = await supabase.auth.getSession()
        if (data.session?.user) return

        throw new Error('Your sign-in link is invalid, incomplete, or has already been used.')
      }

      throw new Error('Your sign-in link is invalid, incomplete, or has already been used.')
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const searchParams = new URLSearchParams(window.location.search)
    const callbackError =
      hashParams.get('error_description') ||
      searchParams.get('error_description') ||
      hashParams.get('error') ||
      searchParams.get('error')

    if (callbackError) {
      setPhase('error')
      setErrorMessage(getFriendlyCallbackError(callbackError))
      return
    }

    if (hashParams.get('type') === 'recovery') {
      window.location.replace(`/update-password${window.location.hash}`)
      return
    }

    finishSession()
      .then(() => {
        if (cancelled) return
        try {
          window.sessionStorage.removeItem(OAUTH_REDIRECT_KEY)
        } catch {
          // ignore storage errors
        }
        setPhase('redirecting')
        window.location.replace(redirectTarget)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setPhase('error')
        setErrorMessage(getFriendlyCallbackError(message))
      })

    return () => {
      cancelled = true
    }
  }, [redirectTarget])

  useEffect(() => {
    if (!errorMessage) return

    const timer = window.setTimeout(() => {
      window.location.replace(buildLoginRedirect(redirectTarget, errorMessage))
    }, 900)

    return () => window.clearTimeout(timer)
  }, [errorMessage, redirectTarget])

  return (
    <section className="site-section">
      <div className="site-container max-w-[30rem]">
        <div className="glass rounded-[28px] px-6 py-8 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-400/70 border-t-transparent" />
          <h1 className="mt-5 font-display text-[1.8rem] font-black" style={{ color: '#1a0b3d' }}>
            {phase === 'error' ? 'We could not complete that sign-in' : 'Finishing your sign-in'}
          </h1>
          <p className="mt-3 text-sm leading-7" style={{ color: 'rgba(61, 35, 112, 0.78)' }}>
            {phase === 'error'
              ? 'We are taking you back to the login page with a clearer message.'
              : phase === 'redirecting'
                ? 'Your session is ready. Taking you to the right place now.'
                : 'We are securing your session and checking the callback response.'}
          </p>
        </div>
      </div>
    </section>
  )
}
