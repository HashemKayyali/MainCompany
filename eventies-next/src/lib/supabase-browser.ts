import { createBrowserClient, type CookieMethodsBrowser } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { parse, serialize, type SerializeOptions } from 'cookie'
import type { Database } from '@/shared/types/database.types'
import {
  applyAuthCookiePolicy,
  AUTH_PERSISTENCE_COOKIE,
  authPersistenceFromCookie,
  persistenceMarkerOptions,
  type AuthPersistence,
} from '@/shared/auth-cookie-policy'

/**
 * FOUND-008 — browser client (REARCHITECT of src/lib/supabase.ts):
 * cookie-based storage via @supabase/ssr so the server sees the same session
 * (the legacy localStorage/sessionStorage fork is bridged in P1B/P3, BRIDGE-01).
 * Singleton per tab; client components receive data as props or fetch
 * personal/realtime data only (Constitution §2).
 */
let client: SupabaseClient<Database> | undefined

function readPersistenceMarker(): string | undefined {
  if (typeof document === 'undefined') return undefined
  return parse(document.cookie)[AUTH_PERSISTENCE_COOKIE]
}

function writePersistenceMarker(persistence: AuthPersistence): void {
  if (typeof document === 'undefined') return
  document.cookie = serialize(
    AUTH_PERSISTENCE_COOKIE,
    persistence,
    persistenceMarkerOptions(persistence, window.location.protocol === 'https:') as SerializeOptions
  )
}

function browserCookieMethods(): CookieMethodsBrowser {
  return {
    getAll() {
      if (typeof document === 'undefined') return []
      return Object.entries(parse(document.cookie)).map(([name, value]) => ({
        name,
        value: value ?? '',
      }))
    },
    setAll(cookiesToSet) {
      if (typeof document === 'undefined') {
        throw new Error('Supabase browser cookies cannot be written outside a browser')
      }

      const persistence = authPersistenceFromCookie(readPersistenceMarker())
      const secure = window.location.protocol === 'https:'
      cookiesToSet.forEach(({ name, value, options }) => {
        document.cookie = serialize(
          name,
          value,
          applyAuthCookiePolicy(options, persistence, secure) as SerializeOptions
        )
      })
    },
  }
}

export function getSupabaseBrowserClient(persistence?: AuthPersistence): SupabaseClient<Database> {
  if (persistence) writePersistenceMarker(persistence)
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase browser env missing (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)')
  }

  client = createBrowserClient<Database>(url, anonKey, {
    cookies: browserCookieMethods(),
    isSingleton: false,
  })
  return client
}
