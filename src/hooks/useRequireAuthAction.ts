import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDialog } from '../contexts/DialogContext'
import { useSession } from '../contexts/SessionContext'
import { getSafeRedirectPath } from '../lib/auth-routing'

interface RequireAuthActionOptions {
  redirectTo?: string
  title?: string
  message?: string
}

export function useRequireAuthAction() {
  const navigate = useNavigate()
  const location = useLocation()
  const dialog = useDialog()
  const { authUser, loading: sessionLoading } = useSession()

  return useCallback(
    async ({
      redirectTo,
      title = 'Sign in required',
      message = 'Please sign in first. Your request drafts will stay saved on this device.',
    }: RequireAuthActionOptions = {}) => {
      if (authUser) return true

      if (sessionLoading) {
        await dialog.alert({
          title: 'Checking your session',
          message: 'Please wait a moment for your account session to finish loading, then try again.',
          confirmLabel: 'OK',
          variant: 'info',
        })
        return false
      }

      const fallbackRedirect = `${location.pathname}${location.search}${location.hash}`
      const nextRedirect = getSafeRedirectPath(redirectTo, fallbackRedirect)

      await dialog.alert({
        title,
        message,
        confirmLabel: 'Go to Login',
        variant: 'info',
      })

      navigate(`/login?redirect=${encodeURIComponent(nextRedirect)}`)
      return false
    },
    [authUser, dialog, location.hash, location.pathname, location.search, navigate, sessionLoading]
  )
}
