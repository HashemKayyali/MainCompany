import { describe, expect, it } from 'vitest'
import { ADMIN_MUTATIONS, authorizeAdminMutation } from '../mutation-contract'

const recent = Date.parse('2026-07-14T12:00:00Z')

function decide(mutation: string, role: string | null, aal = 'aal2', ageMinutes = 1) {
  return authorizeAdminMutation({
    mutation,
    role,
    aal,
    authTimeSeconds: (recent - ageMinutes * 60_000) / 1000,
    nowMs: recent,
  })
}

describe('privileged mutation boundary contract', () => {
  const bypassOperations = [
    ['BYPASS-01 product delete', 'catalog.delete', 'admin'],
    ['BYPASS-02 category delete', 'catalog.delete', 'admin'],
    ['BYPASS-03 gallery delete', 'catalog.delete', 'admin'],
    ['BYPASS-04 custom-build delete', 'catalog.delete', 'admin'],
    ['BYPASS-05 media delete', 'media.delete', 'admin'],
    ['BYPASS-06 role change', 'role.update', 'superadmin'],
    ['BYPASS-07 admin removal', 'admin.remove', 'superadmin'],
    ['BYPASS-08 notification broadcast', 'notification.broadcast', 'superadmin'],
    ['BYPASS-09 atomic bulk delete', 'catalog.delete', 'admin'],
  ] as const

  it('denies every operation to non-admin roles and unknown operations', () => {
    for (const mutation of ADMIN_MUTATIONS)
      expect(decide(mutation, 'customer')).toBe('permission-denied')
    expect(decide('database.raw-delete', 'superadmin')).toBe('permission-denied')
  })

  it('limits role changes and broadcasts to superadmins', () => {
    expect(decide('role.update', 'admin')).toBe('permission-denied')
    expect(decide('notification.broadcast', 'admin')).toBe('permission-denied')
    expect(decide('role.update', 'superadmin')).toBe('allow')
  })

  it('requires AAL2 plus recent auth for destructive operations', () => {
    for (const mutation of ['catalog.delete', 'media.delete', 'admin.remove'] as const) {
      expect(decide(mutation, 'superadmin', 'aal1')).toBe('aal2-required')
      expect(decide(mutation, 'superadmin', 'aal2', 16)).toBe('recent-auth-required')
      expect(decide(mutation, 'superadmin')).toBe('allow')
    }
  })

  it.each([
    ['anonymous', null, 'aal1', 1, 'permission-denied'],
    ['customer', 'customer', 'aal2', 1, 'permission-denied'],
    ['provider', 'provider', 'aal2', 1, 'permission-denied'],
    ['unknown role', 'unknown', 'aal2', 1, 'permission-denied'],
    ['admin AAL1', 'admin', 'aal1', 1, 'aal2-required'],
    ['admin stale', 'admin', 'aal2', 16, 'recent-auth-required'],
    ['admin recent', 'admin', 'aal2', 1, 'allow'],
    ['superadmin AAL1', 'superadmin', 'aal1', 1, 'aal2-required'],
    ['superadmin stale', 'superadmin', 'aal2', 16, 'recent-auth-required'],
    ['superadmin recent', 'superadmin', 'aal2', 1, 'allow'],
    ['revoked admin', 'customer', 'aal2', 1, 'permission-denied'],
    ['disabled admin', null, 'aal2', 1, 'permission-denied'],
    ['missing profile', null, 'aal2', 1, 'permission-denied'],
  ])('BYPASS persona: %s', (_name, role, aal, age, expected) => {
    expect(decide('catalog.delete', role, aal, age)).toBe(expected)
  })

  it('uses the current authoritative role rather than a stale JWT role', () => {
    expect(decide('catalog.delete', 'customer', 'aal2', 1)).toBe('permission-denied')
  })

  it.each(bypassOperations)(
    '%s directly enforces the complete bypass persona matrix',
    (_name, operation, minimumRole) => {
      const adminRecent = minimumRole === 'admin' ? 'allow' : 'permission-denied'
      const adminAal1 = minimumRole === 'admin' ? 'aal2-required' : 'permission-denied'
      const adminStale = minimumRole === 'admin' ? 'recent-auth-required' : 'permission-denied'
      const personas = [
        ['anonymous', null, 'aal1', 1, 'permission-denied'],
        ['authenticated customer', 'customer', 'aal2', 1, 'permission-denied'],
        ['provider', 'provider', 'aal2', 1, 'permission-denied'],
        ['unknown role', 'unknown', 'aal2', 1, 'permission-denied'],
        ['admin AAL1', 'admin', 'aal1', 1, adminAal1],
        ['admin AAL2 stale', 'admin', 'aal2', 16, adminStale],
        ['admin AAL2 recent', 'admin', 'aal2', 1, adminRecent],
        ['superadmin AAL1', 'superadmin', 'aal1', 1, 'aal2-required'],
        ['superadmin AAL2 stale', 'superadmin', 'aal2', 16, 'recent-auth-required'],
        ['superadmin AAL2 recent', 'superadmin', 'aal2', 1, 'allow'],
        ['revoked or disabled admin', null, 'aal2', 1, 'permission-denied'],
        ['role changed after JWT issuance', 'customer', 'aal2', 1, 'permission-denied'],
        ['missing profile', null, 'aal2', 1, 'permission-denied'],
      ] as const

      for (const [persona, role, aal, age, expected] of personas) {
        expect(decide(operation, role, aal, age), persona).toBe(expected)
      }
    }
  )

  it.each(bypassOperations)(
    '%s rejects missing, malformed, future, and expired auth_time',
    (_name, operation) => {
      expect(
        authorizeAdminMutation({
          mutation: operation,
          role: 'superadmin',
          aal: 'aal2',
          authTimeSeconds: null,
          nowMs: recent,
        })
      ).toBe('recent-auth-required')
      expect(decide(operation, 'superadmin', 'aal2', -1)).toBe('recent-auth-required')
      expect(decide(operation, 'superadmin', 'aal2', 16)).toBe('recent-auth-required')
    }
  )
})
