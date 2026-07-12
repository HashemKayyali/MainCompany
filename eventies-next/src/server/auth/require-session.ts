import 'server-only'

import { redirect } from 'next/navigation'
import { localizedPath } from '@/lib/auth-routing'
import { getSessionClaims } from '@/server/supabase/session'

export async function requireSession(locale: string, returnPath: string) {
  const identity = await getSessionClaims()
  if (!identity) {
    const login = localizedPath(locale, '/login')
    redirect(`${login}?redirect=${encodeURIComponent(localizedPath(locale, returnPath))}`)
  }
  return identity
}
