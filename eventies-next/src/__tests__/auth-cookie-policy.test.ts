import { describe, expect, it } from 'vitest'
import {
  applyAuthCookiePolicy,
  authPersistenceFromCookie,
  PERSISTENT_AUTH_MAX_AGE,
  persistenceMarkerOptions,
} from '@/shared/auth-cookie-policy'

describe('AUTH-007 remember-me cookie policy', () => {
  it('keeps the Supabase persistent lifetime when remember-me is enabled', () => {
    expect(
      applyAuthCookiePolicy(
        { maxAge: PERSISTENT_AUTH_MAX_AGE, sameSite: 'lax' },
        'persistent',
        true
      )
    ).toEqual({ maxAge: PERSISTENT_AUTH_MAX_AGE, sameSite: 'lax', secure: true })
  })

  it('removes both lifetime attributes for a browser-session cookie', () => {
    const expires = new Date('2030-01-01T00:00:00Z')
    expect(
      applyAuthCookiePolicy(
        { expires, maxAge: PERSISTENT_AUTH_MAX_AGE, path: '/' },
        'session',
        true
      )
    ).toEqual({ path: '/', secure: true })
  })

  it('defaults legacy and unmarked sessions to persistent compatibility', () => {
    expect(authPersistenceFromCookie(undefined)).toBe('persistent')
    expect(authPersistenceFromCookie('persistent')).toBe('persistent')
    expect(authPersistenceFromCookie('session')).toBe('session')
  })

  it('writes a session-scoped marker when remember-me is disabled', () => {
    expect(persistenceMarkerOptions('session', true)).toEqual({
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: true,
    })
  })

  it('preserves explicit deletion semantics for session cookies', () => {
    const expires = new Date(0)
    expect(applyAuthCookiePolicy({ expires, maxAge: 0, path: '/' }, 'session', true)).toEqual({
      expires,
      maxAge: 0,
      path: '/',
      secure: true,
    })
  })
})
