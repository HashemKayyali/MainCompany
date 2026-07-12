const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/user-login',
  '/reset-password',
  '/forgot-password',
  '/update-password',
  '/auth/callback',
])

export function getSafeRedirectPath(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback
  const candidate = path.trim()
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return fallback
  }
  try {
    const parsed = new URL(candidate, 'https://eventies.invalid')
    return parsed.origin === 'https://eventies.invalid'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback
  } catch {
    return fallback
  }
}

export function getPostAuthRedirect(path: string | null | undefined, fallback = '/'): string {
  const safe = getSafeRedirectPath(path, fallback)
  const pathname = safe.split(/[?#]/, 1)[0]?.toLowerCase() || fallback
  const withoutLocale = pathname.replace(/^\/ar(?=\/|$)/, '') || '/'
  return AUTH_PATHS.has(withoutLocale) ? fallback : safe
}

export function getFriendlyCallbackError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('access_denied')) return 'auth.callback.cancelled'
  if (lower.includes('invalid request')) return 'auth.callback.expired'
  if (lower.includes('server_error')) return 'auth.callback.providerError'
  if (lower.includes('popup_closed')) return 'auth.callback.popupClosed'
  if (lower.includes('already been used') || lower.includes('invalid'))
    return 'auth.callback.invalid'
  return 'auth.callback.generic'
}

export function localizedPath(locale: string | null | undefined, path: string): string {
  return locale === 'ar' ? `/ar${path === '/' ? '' : path}` : path
}
