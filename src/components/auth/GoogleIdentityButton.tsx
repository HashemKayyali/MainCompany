"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { cn } from '../../utils/cn'

const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let googleIdentityScriptPromise: Promise<void> | null = null
let initializedClientId: string | null = null
let activeCredentialCallback: ((response: GoogleCredentialResponse) => void) | null = null

type GoogleIdentityButtonMode = 'login' | 'register'

type GoogleIdentityButtonProps = {
  mode?: GoogleIdentityButtonMode
  disabled?: boolean
  className?: string
  onSuccess?: () => void | Promise<void>
  onError?: (message: string) => void
}

function getGoogleClientId() {
  return import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || ''
}

function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is unavailable in this browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`
    )

    const fail = () => {
      googleIdentityScriptPromise = null
      reject(new Error('Google sign-in could not load. Please refresh and try again.'))
    }

    if (existingScript) {
      const timeoutId = window.setTimeout(fail, 7000)
      existingScript.addEventListener(
        'load',
        () => {
          window.clearTimeout(timeoutId)
          resolve()
        },
        { once: true }
      )
      existingScript.addEventListener(
        'error',
        () => {
          window.clearTimeout(timeoutId)
          fail()
        },
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = fail
    document.head.appendChild(script)
  })

  return googleIdentityScriptPromise
}

function initializeGoogleIdentity(clientId: string) {
  const googleIdentity = window.google?.accounts?.id

  if (!googleIdentity) {
    throw new Error('Google sign-in is not available yet. Please try again.')
  }

  if (initializedClientId === clientId) return

  googleIdentity.initialize({
    client_id: clientId,
    callback: response => {
      activeCredentialCallback?.(response)
    },
  })
  initializedClientId = clientId
}

function getSafeAuthError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export default function GoogleIdentityButton({
  mode = 'login',
  disabled = false,
  className,
  onSuccess,
  onError,
}: GoogleIdentityButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const mountedRef = useRef(true)
  const signingInRef = useRef(false)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const [scriptReady, setScriptReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [localError, setLocalError] = useState('')

  const reportError = useCallback(
    (message: string) => {
      const safeMessage = message || 'Google login failed'
      console.warn('[GoogleIdentityButton]', safeMessage)
      if (mountedRef.current) setLocalError(safeMessage)
      onErrorRef.current?.(safeMessage)
    },
    []
  )

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (signingInRef.current) return

      const credential = response.credential
      if (!credential) {
        reportError('Google did not return a credential. Please try again.')
        return
      }

      if (!isSupabaseConfigured()) {
        reportError('Authentication is not configured.')
        return
      }

      signingInRef.current = true
      if (mountedRef.current) {
        setSigningIn(true)
        setLocalError('')
      }

      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: credential,
        })

        if (error) {
          reportError(error.message || 'Google login failed')
          return
        }

        if (!data.session?.user) {
          reportError('Google login did not create a session. Please try again.')
          return
        }

        await onSuccessRef.current?.()
      } catch (error) {
        reportError(getSafeAuthError(error, 'Google login failed'))
      } finally {
        signingInRef.current = false
        if (mountedRef.current) setSigningIn(false)
      }
    },
    [reportError]
  )

  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  }, [onSuccess, onError])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let callback: ((response: GoogleCredentialResponse) => void) | null = null
    const clientId = getGoogleClientId()

    setScriptReady(false)
    setLocalError('')

    if (!clientId) {
      reportError('Google sign-in is not configured.')
      return
    }

    if (!isSupabaseConfigured()) {
      reportError('Authentication is not configured.')
      return
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return

        initializeGoogleIdentity(clientId)

        const buttonContainer = buttonRef.current
        buttonContainer.innerHTML = ''
        const measuredWidth = Math.floor(buttonContainer.getBoundingClientRect().width)
        const buttonWidth = Math.min(Math.max(measuredWidth || 320, 240), 400)

        window.google?.accounts?.id?.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonWidth,
        })

        callback = (response: GoogleCredentialResponse) => {
          void handleCredential(response)
        }
        activeCredentialCallback = callback

        if (mountedRef.current) setScriptReady(true)
      })
      .catch(error => {
        if (!cancelled) {
          reportError(getSafeAuthError(error, 'Google sign-in could not load.'))
        }
      })

    return () => {
      cancelled = true
      if (buttonRef.current) buttonRef.current.innerHTML = ''
      if (activeCredentialCallback === callback) activeCredentialCallback = null
    }
  }, [handleCredential, mode, reportError])

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative flex min-h-[44px] w-full items-center justify-center overflow-hidden rounded-xl',
          disabled || signingIn ? 'pointer-events-none opacity-75' : ''
        )}
      >
        {!scriptReady && !localError && (
          <div
            role="status"
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-[#150628]/70 shadow-sm"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            Loading Google...
          </div>
        )}

        <div
          ref={buttonRef}
          className={cn('flex min-h-[44px] w-full justify-center', !scriptReady ? 'hidden' : '')}
        />

        {signingIn && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white/90 text-[12px] font-bold text-violet-700 shadow-sm backdrop-blur-sm"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            Signing in...
          </div>
        )}
      </div>

      {localError && !onError && (
        <p role="alert" className="text-center text-[11px] font-semibold text-red-600">
          {localError}
        </p>
      )}
    </div>
  )
}
