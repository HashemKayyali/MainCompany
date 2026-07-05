import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Node-only Supabase admin client for the Storage GC.
 *
 * MUST NEVER be imported by any file under `src/` that ships to the
 * browser — this module reads `process.env` and creates a service-
 * role client with server-safe auth defaults.
 *
 * The frontend continues to use `src/lib/supabase.ts`; the two paths
 * are intentionally isolated.
 */

export interface AdminEnv {
  supabaseUrl: string
  serviceRoleKey: string
  projectRef: string
}

/**
 * Read + validate the Node environment. Throws a clear, secret-free
 * error if either required variable is missing.
 */
export function loadAdminEnv(): AdminEnv {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL — set it before running the storage GC. ' +
        '(Do NOT re-use VITE_SUPABASE_URL from .env.local; the GC uses ' +
        'a separate server-side name so a leaked service role key ' +
        'never enters the frontend bundle.)',
    )
  }
  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — set it in the shell (not in ' +
        '.env.local) before running the storage GC. This key MUST NEVER ' +
        'be committed or logged.',
    )
  }
  return {
    supabaseUrl,
    serviceRoleKey,
    projectRef: safeProjectRef(supabaseUrl),
  }
}

/**
 * Construct the admin client. Server-safe auth options:
 *   - `persistSession: false`    → no localStorage / disk writes
 *   - `autoRefreshToken: false`  → no background timers
 *   - `detectSessionInUrl: false` → we do not exchange OAuth codes
 */
export function makeAdminClient(env: AdminEnv): SupabaseClient {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/** Extract project ref without ever logging the URL or key. */
function safeProjectRef(url: string): string {
  try {
    return new URL(url).hostname.split('.')[0] || 'unknown'
  } catch {
    return 'unknown'
  }
}
