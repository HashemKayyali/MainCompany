import 'server-only'
import { randomUUID } from 'node:crypto'
import { track } from '@/server/observability/track'
import { scrubPayload, type ScrubbedPayload } from '@/server/observability/scrub'

export const ADMIN_AUDIT_EVENTS = [
  'auth.mfa_enrolled',
  'admin.role_changed',
  'admin.destructive_confirmed',
  'upload.signature_denied',
  'upload.quota_denied',
  'revalidate.failed',
] as const

export type AdminAuditEvent = (typeof ADMIN_AUDIT_EVENTS)[number]

export type AdminAuditResult = 'allowed' | 'denied' | 'failed' | 'succeeded'

export type AdminAuditRecord = {
  actorId: string
  actorRole: 'admin' | 'superadmin'
  operation: string
  targetType: string
  targetId: string
  result: AdminAuditResult
  metadata: ScrubbedPayload
  correlationId: string
  timestamp: string
}

export function correlationIdFromHeaders(headers: Headers): string {
  const supplied = headers.get('x-request-id')?.trim()
  return supplied && /^[a-zA-Z0-9._:-]{8,128}$/.test(supplied) ? supplied : randomUUID()
}

export function buildAdminAuditRecord(input: {
  actorId: string
  actorRole: 'admin' | 'superadmin'
  operation: string
  targetType: string
  targetId: string
  result: AdminAuditResult
  metadata?: Record<string, unknown>
  correlationId?: string
  now?: Date
}): AdminAuditRecord {
  return {
    actorId: input.actorId,
    actorRole: input.actorRole,
    operation: input.operation.slice(0, 120),
    targetType: input.targetType.slice(0, 80),
    targetId: input.targetId.slice(0, 128),
    result: input.result,
    metadata: scrubPayload(input.metadata ?? {}),
    correlationId: input.correlationId ?? randomUUID(),
    timestamp: (input.now ?? new Date()).toISOString(),
  }
}

export async function writeAdminAudit(record: AdminAuditRecord): Promise<void> {
  await track(`admin.${record.operation}`, record)
}

export async function auditAdminEvent(
  event: AdminAuditEvent,
  payload: { actorHash: string; targetHash?: string; reason?: string }
) {
  await track(event, payload)
}
