import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'
import { serverEnv } from '@/server/env'
import {
  applyAuthCookiePolicy,
  AUTH_PERSISTENCE_COOKIE,
  authPersistenceFromCookie,
  persistenceMarkerOptions,
  type AuthPersistence,
} from '@/shared/auth-cookie-policy'

/**
 * FOUND-009 — per-request server client. Token refresh is the PROXY's job
 * (PROXY-005 single-refresh rule): this client reads the request cookies the
 * proxy already refreshed; its setAll is best-effort and silently skipped in
 * RSC render scope where cookie writes are not allowed.
 */
export async function createSupabaseServerClient(options?: {
  persistence?: AuthPersistence
}): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()
  const env = serverEnv()
  const persistence =
    options?.persistence ??
    authPersistenceFromCookie(cookieStore.get(AUTH_PERSISTENCE_COOKIE)?.value)
  const secure = process.env.NODE_ENV === 'production'

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
              cookieStore.set(
                name,
                value,
                applyAuthCookiePolicy(cookieOptions, persistence, secure)
              )
            )
            cookieStore.set(
              AUTH_PERSISTENCE_COOKIE,
              persistence,
              persistenceMarkerOptions(persistence, secure)
            )
          } catch {
            // RSC render scope: cookie writes throw. The proxy owns refresh; ignore.
          }
        },
      },
    }
  )
}
