import type { Database } from '../lib/database.types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Change } from '../utils/entity-diff'

type AdminLogRow = Database['public']['Tables']['admin_logs']['Row']
type AdminLogInsert = Database['public']['Tables']['admin_logs']['Insert']

// Marker that identifies a `details` blob as a v2 structured payload rather
// than a legacy plain-text description. We keep the marker + JSON so old rows
// (plain strings) still render as a simple message.
const STRUCTURED_MARKER = '@@log-v2@@'

export interface StructuredLogPayload {
  version: 2
  summary: string
  changes?: Change[]
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}

export interface AdminLog {
  id: string
  admin_id: string | null
  admin_name: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  entity_name: string
  details: string
  structured: StructuredLogPayload | null
  created_at: string
}

function serializeDetails(input: {
  summary: string
  changes?: Change[]
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
} | string | undefined): string {
  if (!input) return ''
  if (typeof input === 'string') return input
  const payload: StructuredLogPayload = {
    version: 2,
    summary: input.summary,
    changes: input.changes,
    before: input.before ?? null,
    after: input.after ?? null,
  }
  return `${STRUCTURED_MARKER}${JSON.stringify(payload)}`
}

export function parseLogDetails(details: string | null | undefined): {
  summary: string
  structured: StructuredLogPayload | null
} {
  const raw = (details || '').trim()
  if (!raw) return { summary: '', structured: null }
  if (raw.startsWith(STRUCTURED_MARKER)) {
    try {
      const parsed = JSON.parse(raw.slice(STRUCTURED_MARKER.length)) as StructuredLogPayload
      return { summary: parsed.summary || '', structured: parsed }
    } catch {
      return { summary: raw, structured: null }
    }
  }
  return { summary: raw, structured: null }
}

function mapAdminLog(row: AdminLogRow): AdminLog {
  const { summary, structured } = parseLogDetails(row.details)
  return {
    ...row,
    action: row.action as AdminLog['action'],
    details: summary,
    structured,
  }
}

export async function addLog(log: {
  admin_id: string | null
  admin_name: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  entity_name: string
  details?: string | { summary: string; changes?: Change[]; before?: Record<string, unknown> | null; after?: Record<string, unknown> | null }
}): Promise<void> {
  if (!isSupabaseConfigured()) return

  const payload: AdminLogInsert = {
    admin_id: log.admin_id,
    admin_name: log.admin_name,
    admin_email: log.admin_email,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    entity_name: log.entity_name,
    details: serializeDetails(log.details),
  }

  const { error } = await supabase.from('admin_logs').insert(payload)
  if (error) throw error
}

export async function getAllLogs(): Promise<AdminLog[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.warn('[Logs] Failed to fetch logs:', error)
      return []
    }

    return (data || []).map(mapAdminLog)
  } catch (error) {
    console.warn('[Logs] Failed to fetch logs:', error)
    return []
  }
}
