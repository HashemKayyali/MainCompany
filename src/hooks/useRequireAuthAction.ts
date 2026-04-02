import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDialog } from '../contexts/DialogContext'
import { useUser } from '../contexts/UserContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface RequireAuthActionOptions {
  redirectTo?: string
  title?: string
  message?: string
}

function buildRedirectTarget(value: string | null | undefined, fallback: string) {
  if (!value) return fallback
  return value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

export function useRequireAuthAction() {
  const navigate = useNavigate()
  const location = useLocation()
  const dialog = useDialog()
  const { isLoggedIn } = useUser()

  return useCallback(
    async ({
      redirectTo,
      title = 'Sign in required',
      message = 'Please sign in first. Your cart and request draft will stay saved on this device.',
    }: RequireAuthActionOptions = {}) => {
      let hasSession = isLoggedIn

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          hasSession = Boolean(data.session?.user)
        } catch (error) {
          console.warn('Failed to verify auth session before protected action:', error)
          hasSession = false
        }
      }

      if (hasSession) return true

      const fallbackRedirect = `${location.pathname}${location.search}${location.hash}`
      const nextRedirect = buildRedirectTarget(redirectTo, fallbackRedirect)

      await dialog.alert({
        title,
        message,
        confirmLabel: 'Go to Login',
        variant: 'info',
      })

      navigate(`/login?redirect=${encodeURIComponent(nextRedirect)}`)
      return false
    },
    [dialog, isLoggedIn, location.hash, location.pathname, location.search, navigate]
  )
}
