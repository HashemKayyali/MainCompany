import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'
import { serverEnv } from '@/server/env'

/**
 * Cookie-LESS anon client for the DAL. Public catalog reads are cached
 * cross-user ('use cache'); by construction they must never see a session —
 * a cookie-bound client inside a cached scope is exactly the QG-ARCH-3
 * violation class (06 §Hard rule 1). Module-level singleton is safe: anon
 * key only, no per-user state.
 */
let anonClient: SupabaseClient<Database> | undefined

export function getAnonServerClient(): SupabaseClient<Database> {
  if (anonClient) return anonClient
  const env = serverEnv()
  anonClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
  return anonClient
}
