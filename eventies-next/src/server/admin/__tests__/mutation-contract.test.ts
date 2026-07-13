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
})
