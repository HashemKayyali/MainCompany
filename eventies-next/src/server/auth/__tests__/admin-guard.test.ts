import { describe, expect, it } from 'vitest'
import { evaluateAdminGate, isRecentAuthentication, mfaRolloutFromEnv } from '../admin-guard'

describe('ADM-GATE / ADM-RA', () => {
  it.each([
    [{ userPresent: false, role: null, aal: null, rollout: 'all' as const }, 'signed-out'],
    [{ userPresent: true, role: 'customer', aal: 'aal2', rollout: 'all' as const }, 'forbidden'],
    [{ userPresent: true, role: 'admin', aal: 'aal1', rollout: 'all' as const }, 'mfa-required'],
    [{ userPresent: true, role: 'admin', aal: 'aal2', rollout: 'all' as const }, 'allow'],
    [
      {
        userPresent: true,
        role: 'admin',
        aal: 'aal2',
        rollout: 'all' as const,
        superadminOnly: true,
      },
      'forbidden',
    ],
    [
      {
        userPresent: true,
        role: 'superadmin',
        aal: 'aal2',
        rollout: 'all' as const,
        superadminOnly: true,
      },
      'allow',
    ],
  ])('evaluates trusted server gate %#', (input, expected) => {
    expect(evaluateAdminGate(input)).toBe(expected)
  })

  it('stages MFA superadmin-first and defaults safely to off until owner enables it', () => {
    expect(
      evaluateAdminGate({ userPresent: true, role: 'admin', aal: 'aal1', rollout: 'superadmin' })
    ).toBe('allow')
    expect(
      evaluateAdminGate({
        userPresent: true,
        role: 'superadmin',
        aal: 'aal1',
        rollout: 'superadmin',
      })
    ).toBe('mfa-required')
    expect(mfaRolloutFromEnv('unexpected')).toBe('off')
  })

  it('accepts destructive recency only within fifteen minutes and rejects future clocks', () => {
    const now = Date.parse('2026-07-14T12:00:00Z')
    expect(isRecentAuthentication((now - 14 * 60_000) / 1000, now)).toBe(true)
    expect(isRecentAuthentication((now - 16 * 60_000) / 1000, now)).toBe(false)
    expect(isRecentAuthentication((now + 1_000) / 1000, now)).toBe(false)
  })
})
