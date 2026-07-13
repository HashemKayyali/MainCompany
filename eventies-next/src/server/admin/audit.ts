import 'server-only'
import { track } from '@/server/observability/track'

export const ADMIN_AUDIT_EVENTS = [
  'auth.mfa_enrolled',
  'admin.role_changed',
  'admin.destructive_confirmed',
  'upload.signature_denied',
  'upload.quota_denied',
  'revalidate.failed',
] as const

export type AdminAuditEvent = (typeof ADMIN_AUDIT_EVENTS)[number]

export async function auditAdminEvent(
  event: AdminAuditEvent,
  payload: { actorHash: string; targetHash?: string; reason?: string }
) {
  await track(event, payload)
}
