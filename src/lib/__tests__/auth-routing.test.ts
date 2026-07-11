import { describe, expect, it } from 'vitest'
import { buildLoginRedirect, getSafeRedirectPath } from '../auth-routing'

/**
 * SAN-01 (BASE-009) — redirect-sanitizer safety net.
 *
 * Phase 0 contract: these tests encode the CURRENT production behavior of
 * src/lib/auth-routing.ts. They are the regression baseline for AUTH-004
 * (sanitizer port). Two cases are documented behavior GAPS (discoveries
 * D-P0-08 / D-P0-09) — they assert today's behavior on purpose and carry the
 * hardening expectation in comments; flipping them is AUTH-004's job, with a
 * deliberate assertion change reviewed against this file.
 */
describe('SAN-01: getSafeRedirectPath', () => {
  it('passes through a plain internal path', () => {
    expect(getSafeRedirectPath('/products')).toBe('/products')
    expect(getSafeRedirectPath('/my-requests/42?tab=open')).toBe('/my-requests/42?tab=open')
  })

  it('falls back on null/undefined/empty', () => {
    expect(getSafeRedirectPath(null)).toBe('/')
    expect(getSafeRedirectPath(undefined)).toBe('/')
    expect(getSafeRedirectPath('')).toBe('/')
    expect(getSafeRedirectPath('', '/profile')).toBe('/profile')
  })

  it('blocks protocol-relative //evil.com', () => {
    expect(getSafeRedirectPath('//evil.com')).toBe('/')
    expect(getSafeRedirectPath('//evil.com/path', '/profile')).toBe('/profile')
  })

  it('blocks absolute-scheme URLs (https:, javascript:, data:)', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBe('/')
    expect(getSafeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(getSafeRedirectPath('data:text/html,x')).toBe('/')
    expect(getSafeRedirectPath('evil.com/relative-ish')).toBe('/')
  })

  it('DOCUMENTED GAP (D-P0-08): /\\evil.com currently passes the sanitizer', () => {
    // Browsers normalize backslashes in URLs: location = '/\\evil.com' is
    // treated as protocol-relative '//evil.com'. The current implementation
    // only rejects a literal '//' prefix, so this is an open-redirect gap.
    // Phase 0 records behavior; AUTH-004 must reject any '/\\' form and flip
    // this assertion to `toBe('/')`.
    expect(getSafeRedirectPath('/\\evil.com')).toBe('/\\evil.com')
  })
})

describe('SAN-01: buildLoginRedirect', () => {
  it('omits the redirect param for the default target', () => {
    expect(buildLoginRedirect(null)).toBe('/login')
    expect(buildLoginRedirect('/')).toBe('/login')
  })

  it('carries a safe redirect target', () => {
    expect(buildLoginRedirect('/checkout')).toBe('/login?redirect=%2Fcheckout')
  })

  it('sanitizes an unsafe redirect target down to /login', () => {
    expect(buildLoginRedirect('https://evil.com')).toBe('/login')
    expect(buildLoginRedirect('//evil.com')).toBe('/login')
  })

  it('appends trimmed authError and notice params', () => {
    expect(buildLoginRedirect('/checkout', ' expired ', null)).toBe(
      '/login?redirect=%2Fcheckout&authError=expired'
    )
    expect(buildLoginRedirect(null, null, ' check-email ')).toBe('/login?notice=check-email')
  })

  it('DOCUMENTED GAP (D-P0-09): /login as redirect target is not loop-guarded', () => {
    // Landing on /login?redirect=%2Flogin sends a freshly signed-in user back
    // to /login. Today nothing strips a /login(-prefixed) target. Phase 0
    // records behavior; AUTH-004 should collapse auth-page targets to the
    // fallback and flip this assertion to `toBe('/login')`.
    expect(buildLoginRedirect('/login')).toBe('/login?redirect=%2Flogin')
  })
})
