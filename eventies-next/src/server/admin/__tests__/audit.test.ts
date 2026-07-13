import { describe, expect, it } from 'vitest'
import { ADMIN_AUDIT_EVENTS, buildAdminAuditRecord, correlationIdFromHeaders } from '../audit'
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

describe('complete admin audit records', () => {
  it('includes actor, target, result, correlation, and timestamp while redacting secrets', () => {
    const record = buildAdminAuditRecord({
      actorId: 'actor-1',
      actorRole: 'superadmin',
      operation: 'role_changed',
      targetType: 'profile',
      targetId: 'profile-2',
      result: 'succeeded',
      correlationId: 'request-12345678',
      now: new Date('2026-07-13T12:00:00.000Z'),
      metadata: { token: 'secret', email: 'admin@example.com', changed: true },
    })
    expect(record).toMatchObject({
      actorId: 'actor-1',
      actorRole: 'superadmin',
      targetId: 'profile-2',
      result: 'succeeded',
      correlationId: 'request-12345678',
      timestamp: '2026-07-13T12:00:00.000Z',
      metadata: { token: '[redacted]', email: '[redacted]', changed: true },
    })
    expect(JSON.stringify(record)).not.toContain('secret')
    expect(JSON.stringify(record)).not.toContain('admin@example.com')
  })

  it('accepts only bounded request correlation IDs', () => {
    expect(correlationIdFromHeaders(new Headers({ 'x-request-id': 'trace-12345678' }))).toBe(
      'trace-12345678'
    )
    expect(correlationIdFromHeaders(new Headers({ 'x-request-id': 'bad value' }))).toMatch(
      /^[0-9a-f-]{36}$/
    )
  })
})
