import 'server-only'

import { serverEnv } from '@/server/env'

/**
 * SEC-010 narrow service-role boundary. This is the only runtime module that
 * reads the service-role credential. Callers provide only a relative REST/RPC
 * path and never receive the credential back.
 */
export async function serviceRoleRestFetch(
  path: `/${string}`,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch
): Promise<Response | null> {
  const env = serverEnv()
  const credential = env.SUPABASE_SERVICE_ROLE_KEY
  if (!credential) return null

  return fetchImpl(`${env.NEXT_PUBLIC_SUPABASE_URL}${path}`, {
    ...init,
    cache: init.cache ?? 'no-store',
    headers: {
      apikey: credential,
      authorization: `Bearer ${credential}`,
      ...init.headers,
    },
  })
}
