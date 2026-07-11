import { describe, expect, it } from 'vitest'
import { hashIdentifier, scrubPayload, scrubString } from '../scrub'

/**
 * SEC-007 — BLOCKING redaction test (05 §Audit/PII): feed PII through the
 * event pipeline scrubber and assert absence.
 */
describe('SEC-007: PII scrubber', () => {
  it('strips emails, phones, and JWTs from free text', () => {
    const dirty =
      'user hashem.k@example.com called from +962791234567 with token eyJhbGciOi.eyJzdWIi.c2lnbmF0dXJl'
    const clean = scrubString(dirty)
    expect(clean).not.toContain('example.com')
    expect(clean).not.toContain('962791234567')
    expect(clean).not.toContain('eyJhbGciOi')
    expect(clean).toContain('[email]')
    expect(clean).toContain('[phone]')
    expect(clean).toContain('[jwt]')
  })

  it('redacts blocked keys wholesale (email, message, token, name…)', () => {
    const out = scrubPayload({
      email: 'someone@example.com',
      message: 'my address is 12 Main St',
      token: 'abc123',
      full_name: 'Hashem K',
      safeCount: 3,
      ok: true,
    })
    expect(out.email).toBe('[redacted]')
    expect(out.message).toBe('[redacted]')
    expect(out.token).toBe('[redacted]')
    expect(out.full_name).toBe('[redacted]')
    expect(out.safeCount).toBe(3)
    expect(out.ok).toBe(true)
  })

  it('scrubs PII hiding inside non-blocked keys and nested objects', () => {
    const out = scrubPayload({
      note: 'reach me at someone@example.com',
      meta: { contact: 'someone@example.com', phone: '0791234567' },
    })
    expect(JSON.stringify(out)).not.toContain('example.com')
    expect(JSON.stringify(out)).not.toContain('0791234567')
  })

  it('hashIdentifier is deterministic, normalized, and non-reversible-shaped', async () => {
    const a = await hashIdentifier('Someone@Example.com ')
    const b = await hashIdentifier('someone@example.com')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{16}$/)
    expect(a).not.toContain('example')
  })
})
