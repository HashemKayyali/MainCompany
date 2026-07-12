import { describe, expect, it } from 'vitest'
import { getPostAuthRedirect, getSafeRedirectPath, localizedPath } from '../auth-routing'

describe('SAN-01 auth redirect sanitizer', () => {
  it.each(['//evil.example', '/\\evil.example', 'https://evil.example', 'javascript:alert(1)'])(
    'rejects %s',
    (value) => expect(getSafeRedirectPath(value, '/safe')).toBe('/safe')
  )

  it('preserves safe paths, query strings, and locale', () => {
    expect(getSafeRedirectPath('/ar/products?category=games')).toBe('/ar/products?category=games')
  })

  it.each(['/login', '/register', '/auth/callback', '/ar/login?redirect=/x'])(
    'blocks auth loop %s',
    (value) => expect(getPostAuthRedirect(value, '/')).toBe('/')
  )

  it('builds locale-aware paths', () => {
    expect(localizedPath('ar', '/login')).toBe('/ar/login')
    expect(localizedPath('en', '/login')).toBe('/login')
  })
})
