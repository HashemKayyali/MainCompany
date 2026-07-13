export const AUTH_PERSISTENCE_COOKIE = 'eventies-auth-persistence'
export const PERSISTENT_AUTH_MAX_AGE = 400 * 24 * 60 * 60

export type AuthPersistence = 'persistent' | 'session'
export type CookiePolicyOptions = {
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
  [key: string]: unknown
}

export function authPersistenceFromCookie(value: string | undefined): AuthPersistence {
  return value === 'session' ? 'session' : 'persistent'
}

export function applyAuthCookiePolicy(
  options: CookiePolicyOptions | undefined,
  persistence: AuthPersistence,
  secure: boolean
): CookiePolicyOptions {
  const next = { ...(options ?? {}), secure }
  const isDeletion =
    next.maxAge === 0 || (next.expires instanceof Date && next.expires.getTime() <= Date.now())

  if (persistence === 'session' && !isDeletion) {
    delete next.maxAge
    delete next.expires
  }
  return next
}

export function persistenceMarkerOptions(
  persistence: AuthPersistence,
  secure: boolean
): CookiePolicyOptions {
  return applyAuthCookiePolicy(
    {
      httpOnly: false,
      maxAge: PERSISTENT_AUTH_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    },
    persistence,
    secure
  )
}
