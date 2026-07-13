import { describe, expect, it } from 'vitest'
import { assertAdminPermission, hasAdminPermission } from '../permissions'

describe('admin permission matrix', () => {
  it('denies unknown, signed-out, and customer roles by default', () => {
    for (const role of [null, '', 'customer', 'provider', 'owner']) {
      expect(hasAdminPermission(role, 'dashboard.read')).toBe(false)
      expect(() => assertAdminPermission(role, 'catalog.write')).toThrow('Permission denied')
    }
  })

  it('keeps role, audit, and broadcast operations superadmin-only', () => {
    for (const permission of ['roles.write', 'audit.read', 'notifications.broadcast'] as const) {
      expect(hasAdminPermission('admin', permission)).toBe(false)
      expect(hasAdminPermission('superadmin', permission)).toBe(true)
    }
  })

  it('allows ordinary admin operational permissions', () => {
    expect(hasAdminPermission('admin', 'requests.write')).toBe(true)
    expect(hasAdminPermission('admin', 'media.write')).toBe(true)
    expect(hasAdminPermission('admin', 'cache.revalidate')).toBe(true)
  })
})
