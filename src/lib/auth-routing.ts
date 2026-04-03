export function getSafeRedirectPath(path: string | null | undefined, fallback = '/') {
  if (!path) return fallback
  return path.startsWith('/') && !path.startsWith('//') ? path : fallback
}

export function buildLoginRedirect(
  redirectTo?: string | null,
  authError?: string | null,
  notice?: string | null
) {
  const params = new URLSearchParams()
  const safeRedirect = getSafeRedirectPath(redirectTo, '/')

  if (safeRedirect !== '/') {
    params.set('redirect', safeRedirect)
  }

  if (authError?.trim()) {
    params.set('authError', authError.trim())
  }

  if (notice?.trim()) {
    params.set('notice', notice.trim())
  }

  const query = params.toString()
  return `/login${query ? `?${query}` : ''}`
}
