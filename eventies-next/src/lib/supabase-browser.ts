import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

/**
 * FOUND-008 — browser client (REARCHITECT of src/lib/supabase.ts):
 * cookie-based storage via @supabase/ssr so the server sees the same session
 * (the legacy localStorage/sessionStorage fork is bridged in P1B/P3, BRIDGE-01).
 * Singleton per tab; client components receive data as props or fetch
 * personal/realtime data only (Constitution §2).
 */
let client: SupabaseClient<Database> | undefined

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase browser env missing (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)')
  }

  client = createBrowserClient<Database>(url, anonKey)
  return client
}
