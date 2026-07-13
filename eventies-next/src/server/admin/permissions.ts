import 'server-only'

import type { AdminRole } from '@/server/auth/admin-guard'

export const ADMIN_PERMISSIONS = [
  'dashboard.read',
  'catalog.read',
  'catalog.write',
  'requests.read',
  'requests.write',
  'people.read',
  'people.write',
  'chat.read',
  'chat.write',
  'notifications.read',
  'notifications.broadcast',
  'audit.read',
  'roles.write',
  'media.write',
  'cache.revalidate',
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

const ADMIN_GRANTS = new Set<AdminPermission>([
  'dashboard.read',
  'catalog.read',
  'catalog.write',
  'requests.read',
  'requests.write',
  'people.read',
  'people.write',
  'chat.read',
  'chat.write',
  'notifications.read',
  'media.write',
  'cache.revalidate',
])

const SUPERADMIN_GRANTS = new Set<AdminPermission>(ADMIN_PERMISSIONS)

export function hasAdminPermission(
  role: string | null,
  permission: AdminPermission
): role is AdminRole {
  if (role === 'admin') return ADMIN_GRANTS.has(permission)
  if (role === 'superadmin') return SUPERADMIN_GRANTS.has(permission)
  return false
}

export function assertAdminPermission(
  role: string | null,
  permission: AdminPermission
): asserts role is AdminRole {
  if (!hasAdminPermission(role, permission)) throw new AdminPermissionError(permission)
}

export class AdminPermissionError extends Error {
  readonly code = 'ADMIN_PERMISSION_DENIED'

  constructor(readonly permission: AdminPermission) {
    super(`Permission denied: ${permission}`)
    this.name = 'AdminPermissionError'
  }
}
