import { describe, expect, it } from 'vitest'
import { ADMIN_AUDIT_EVENTS } from '../audit'
import { scrubPayload } from '@/server/observability/scrub'

describe('ADMIN-013 audit contracts', () => {
  it('contains every required privileged event', () => {
    expect(ADMIN_AUDIT_EVENTS).toEqual(
      expect.arrayContaining([
        'auth.mfa_enrolled',
        'admin.role_changed',
        'admin.destructive_confirmed',
        'upload.signature_denied',
        'upload.quota_denied',
        'revalidate.failed',
      ])
    )
  })
  it('redacts PII before an audit payload reaches sinks', () => {
    const result = scrubPayload({
      actorHash: 'abc123',
      email: 'owner@example.com',
      message: '+962799999999',
    })
    expect(JSON.stringify(result)).not.toContain('owner@example.com')
    expect(JSON.stringify(result)).not.toContain('799999999')
  })
})
