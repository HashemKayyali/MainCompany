import type { Database } from '../lib/database.types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AdminLogRow = Database['public']['Tables']['admin_logs']['Row']
type AdminLogInsert = Database['public']['Tables']['admin_logs']['Insert']

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
  created_at: string
}

function mapAdminLog(row: AdminLogRow): AdminLog {
  return {
    ...row,
    action: row.action as AdminLog['action'],
  }
}

export async function addLog(log: Omit<AdminLog, 'id' | 'created_at'>): Promise<void> {
  if (!isSupabaseConfigured()) return

  const payload: AdminLogInsert = {
    admin_id: log.admin_id,
    admin_name: log.admin_name,
    admin_email: log.admin_email,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    entity_name: log.entity_name,
    details: log.details,
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
