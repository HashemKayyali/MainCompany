import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { AvatarFields } from '../lib/avatar'
import { fetchProfileAvatarMap } from './profile.service'

export interface AdminLog extends AvatarFields {
  id: string
  admin_id: string
  admin_name: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string   // 'product' | 'part' | 'customer' | 'category' | 'gallery' | 'admin'
  entity_id: string
  entity_name: string
  details: string
  created_at: string
}

/**
 * Insert a log entry into admin_logs table
 */
export async function addLog(log: Omit<AdminLog, 'id' | 'created_at'>): Promise<void> {
  if (!isSupabaseConfigured()) return

  try {
    await supabase.from('admin_logs' as any).insert({
      admin_id: log.admin_id,
      admin_name: log.admin_name,
      admin_email: log.admin_email,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      entity_name: log.entity_name,
      details: log.details,
    } as any)
  } catch (err) {
    console.warn('[Logs] Failed to write log:', err)
  }
}

/**
 * Fetch all logs ordered by most recent first
 */
export async function getAllLogs(): Promise<AdminLog[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const { data, error } = await (supabase
      .from('admin_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500) as any)

    if (error) {
      console.warn('[Logs] Failed to fetch logs:', error)
      return []
    }

    const logs = (data || []) as AdminLog[]
    const avatarMap = await fetchProfileAvatarMap(logs.map(log => log.admin_id))

    return logs.map(log => ({
      ...log,
      ...(avatarMap[log.admin_id] || {}),
    }))
  } catch (err) {
    console.warn('[Logs] Failed to fetch logs:', err)
    return []
  }
}
