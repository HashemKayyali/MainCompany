import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { RequestStatusHistoryRow } from '../lib/database.types'
import type { RequestStatusHistoryEntry, RequestType } from '../types/commerce'

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function mapHistoryRow(row: RequestStatusHistoryRow): RequestStatusHistoryEntry {
  return {
    id: row.id,
    requestType: row.request_type as RequestType,
    requestId: row.request_id,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    note: row.note,
    changedByProfileId: row.changed_by_profile_id,
    createdAt: row.created_at,
  }
}

export async function getRequestHistory(requestType: RequestType, requestId: string) {
  ensureSupabase()

  const { data, error } = await supabase
    .from('request_status_history')
    .select('*')
    .eq('request_type', requestType)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
    .returns<RequestStatusHistoryRow[]>()

  if (error) throw error
  return (data || []).map(mapHistoryRow)
}
