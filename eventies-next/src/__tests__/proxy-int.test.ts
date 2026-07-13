import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * PROXY-INT (PROXY-002..008) — BLOCKING integration suite for the composed
 * proxy: cookie preservation on intl redirects, same-request propagation,
 * matcher exclusions per path class, single-refresh, fault pass-through.
 *
 * @supabase/ssr is mocked: `getClaims()` optionally simulates a token refresh
 * by invoking the cookie `setAll` exactly once — the real client's behavior
 * for an expired session.
 */

type CookieHandlers = {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options?: object }[]) => void
}

const mockState = vi.hoisted(() => ({
  refreshCookies: null as { name: string; value: string; options?: object }[] | null,
  getClaimsError: null as Error | null,
  createCalls: 0,
  getClaimsCalls: 0,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, opts: { cookies: CookieHandlers }) => {
    mockState.createCalls += 1
    return {
      auth: {
        getClaims: async () => {
          mockState.getClaimsCalls += 1
          if (mockState.getClaimsError) throw mockState.getClaimsError
          if (mockState.refreshCookies) {
            // simulate ONE refresh writing rotated tokens
            opts.cookies.setAll(mockState.refreshCookies)
          }
          return { data: { claims: { sub: 'user-1' } }, error: null }
        },
      },
    }
  },
}))

import proxy, { config } from '../proxy'

const BASE = 'https://www.eventiesjo.com'

function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(new URL(path, BASE), {
    headers: { 'accept-language': 'en' },
  })
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value)
  }
  return request
}

beforeEach(() => {
  mockState.refreshCookies = null
  mockState.getClaimsError = null
  mockState.createCalls = 0
  mockState.getClaimsCalls = 0
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-anon-key-anon'
})

describe('PROXY-002: refreshed cookies survive intl redirect responses', () => {
  it('/en/products redirects to /products (as-needed) AND carries rotated auth cookies', async () => {
    mockState.refreshCookies = [{ name: 'sb-access-token', value: 'rotated-token' }]
    const response = await proxy(makeRequest('/en/products', { 'sb-access-token': 'old' }))

    expect(response.status).toBeGreaterThanOrEqual(300)
    expect(response.status).toBeLessThan(400)
    expect(response.headers.get('location')).toBe(`${BASE}/products`)
    expect(response.cookies.get('sb-access-token')?.value).toBe('rotated-token')
  })
})

describe('PROXY-003: request-cookie propagation to downstream RSC', () => {
  it('the refreshed token is visible on the forwarded request in the same pass', async () => {
    mockState.refreshCookies = [{ name: 'sb-access-token', value: 'rotated-token' }]
    const request = makeRequest('/products', { 'sb-access-token': 'old' })
    const response = await proxy(request)

    // the proxy mutates the request cookie jar before re-running intl routing
    expect(request.cookies.get('sb-access-token')?.value).toBe('rotated-token')
    // and the response still carries the Set-Cookie for the browser
    expect(response.cookies.get('sb-access-token')?.value).toBe('rotated-token')
  })
})

describe('AUTH-007: refresh preserves remember-me lifetime', () => {
  it('keeps rotated cookies session-scoped when remember-me is disabled', async () => {
    mockState.refreshCookies = [
      {
        name: 'sb-access-token',
        value: 'rotated-token',
        options: { maxAge: 34_560_000, expires: new Date('2030-01-01T00:00:00Z') },
      },
    ]
    const response = await proxy(
      makeRequest('/products', { 'eventies-auth-persistence': 'session' })
    )

    expect(response.cookies.get('sb-access-token')?.maxAge).toBeUndefined()
    expect(response.cookies.get('sb-access-token')?.expires).toBeUndefined()
    expect(response.cookies.get('sb-access-token')?.secure).toBe(true)
  })

  it('retains the persistent lifetime when remember-me is enabled', async () => {
    mockState.refreshCookies = [
      {
        name: 'sb-access-token',
        value: 'rotated-token',
        options: { maxAge: 34_560_000 },
      },
    ]
    const response = await proxy(
      makeRequest('/products', { 'eventies-auth-persistence': 'persistent' })
    )

    expect(response.cookies.get('sb-access-token')?.maxAge).toBe(34_560_000)
    expect(response.cookies.get('sb-access-token')?.secure).toBe(true)
  })

  it('preserves deletion cookies when a session-scoped refresh clears stale chunks', async () => {
    mockState.refreshCookies = [
      {
        name: 'sb-access-token.1',
        value: '',
        options: { maxAge: 0, expires: new Date(0) },
      },
    ]
    const response = await proxy(
      makeRequest('/products', { 'eventies-auth-persistence': 'session' })
    )

    expect(response.cookies.get('sb-access-token.1')?.maxAge).toBe(0)
    expect(response.cookies.get('sb-access-token.1')?.expires).toEqual(new Date(0))
  })
})

describe('PROXY-004: matcher exclusions per path class', () => {
  // Equivalent JS regex for the Next matcher '/((?!api|auth/callback|sitemap\.xml|robots\.txt|_next|_vercel|.*\..*).*)'
  const matcherRegex = /^\/(?!api|auth\/callback|sitemap\.xml|robots\.txt|_next|_vercel|.*\..*).*$/

  it('config.matcher is the locked exclusion list', () => {
    expect(config.matcher).toEqual([
      '/((?!api|auth/callback|sitemap\\.xml|robots\\.txt|_next|_vercel|.*\\..*).*)',
    ])
  })

  it.each(['/', '/products', '/ar', '/ar/products', '/login', '/my-requests/RR-1'])(
    'page route %s IS proxied',
    (path) => {
      expect(matcherRegex.test(path)).toBe(true)
    }
  )

  it.each([
    '/api/revalidate',
    '/api/forms/contact',
    '/auth/callback',
    '/sitemap.xml',
    '/robots.txt',
    '/_next/static/chunks/app.js',
    '/_vercel/insights/script.js',
    '/images/og-default.jpg',
    '/favicon.ico',
  ])('excluded class %s is NOT proxied', (path) => {
    expect(matcherRegex.test(path)).toBe(false)
  })
})

describe('PROXY-005: single refresh per request', () => {
  it('creates one client and calls getClaims exactly once', async () => {
    mockState.refreshCookies = [{ name: 'sb-access-token', value: 'rotated' }]
    await proxy(makeRequest('/products'))
    expect(mockState.createCalls).toBe(1)
    expect(mockState.getClaimsCalls).toBe(1)
  })
})

describe('PROXY-006: locale × auth interaction matrix', () => {
  it('anon /ar → serves AR without auth cookies and without redirect to /', async () => {
    const response = await proxy(makeRequest('/ar'))
    expect(response.headers.get('location')).toBeNull()
    expect(response.cookies.get('sb-access-token')).toBeUndefined()
  })

  it('authed (fresh token, no rotation) /ar → no Set-Cookie churn', async () => {
    const response = await proxy(makeRequest('/ar', { 'sb-access-token': 'valid' }))
    expect(response.cookies.get('sb-access-token')).toBeUndefined()
  })

  it('expired token + locale redirect → rotation survives the redirect', async () => {
    mockState.refreshCookies = [{ name: 'sb-access-token', value: 'rotated' }]
    const response = await proxy(makeRequest('/en', { 'sb-access-token': 'expired' }))
    expect(response.status).toBeGreaterThanOrEqual(300)
    expect(response.cookies.get('sb-access-token')?.value).toBe('rotated')
  })
})

describe('PROXY-007: fault pass-through', () => {
  it('Supabase unreachable → unauthenticated pass-through, never a 500', async () => {
    mockState.getClaimsError = new Error('fetch failed: supabase unreachable')
    const response = await proxy(makeRequest('/products'))
    expect(response).toBeDefined()
    expect(response.status).toBeLessThan(500)
  })

  it('missing env → pass-through with intl still applied', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const response = await proxy(makeRequest('/en/products'))
    expect(response.status).toBeGreaterThanOrEqual(300)
    expect(response.headers.get('location')).toBe(`${BASE}/products`)
  })
})
