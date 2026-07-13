import 'server-only'

import { evaluatePrivilegedAssurance } from '@/server/auth/admin-guard'
import { hasAdminPermission, type AdminPermission } from './permissions'

export const ADMIN_MUTATIONS = [
  'request.status',
  'quote.upsert',
  'catalog.create',
  'catalog.update',
  'catalog.delete',
  'chat.send',
  'chat.status',
  'notification.broadcast',
  'media.sign',
  'media.replace',
  'media.delete',
  'role.update',
  'admin.remove',
  'cache.revalidate',
] as const

export type AdminMutation = (typeof ADMIN_MUTATIONS)[number]
export type AdminMutationDecision =
  'allow' | 'permission-denied' | 'aal2-required' | 'recent-auth-required'

const MUTATION_POLICY: Record<
  AdminMutation,
  { permission: AdminPermission; assurance: 'role' | 'aal2-recent' }
> = {
  'request.status': { permission: 'requests.write', assurance: 'role' },
  'quote.upsert': { permission: 'requests.write', assurance: 'role' },
  'catalog.create': { permission: 'catalog.write', assurance: 'role' },
  'catalog.update': { permission: 'catalog.write', assurance: 'role' },
  'catalog.delete': { permission: 'catalog.write', assurance: 'aal2-recent' },
  'chat.send': { permission: 'chat.write', assurance: 'role' },
  'chat.status': { permission: 'chat.write', assurance: 'role' },
  'notification.broadcast': {
    permission: 'notifications.broadcast',
    assurance: 'aal2-recent',
  },
  'media.sign': { permission: 'media.write', assurance: 'role' },
  'media.replace': { permission: 'media.write', assurance: 'aal2-recent' },
  'media.delete': { permission: 'media.write', assurance: 'aal2-recent' },
  'role.update': { permission: 'roles.write', assurance: 'aal2-recent' },
  'admin.remove': { permission: 'roles.write', assurance: 'aal2-recent' },
  'cache.revalidate': { permission: 'cache.revalidate', assurance: 'role' },
}

export function authorizeAdminMutation(input: {
  mutation: string
  role: string | null
  aal: string | null
  authTimeSeconds: number | null
  nowMs?: number
}): AdminMutationDecision {
  if (!ADMIN_MUTATIONS.includes(input.mutation as AdminMutation)) return 'permission-denied'
  const policy = MUTATION_POLICY[input.mutation as AdminMutation]
  if (!hasAdminPermission(input.role, policy.permission)) return 'permission-denied'
  if (policy.assurance === 'role') return 'allow'
  return evaluatePrivilegedAssurance(input)
}
