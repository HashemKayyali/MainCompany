import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'
import { createSupabaseServerClient } from './server-client'

/**
 * FOUND-009 — identity helpers per ADR-20:
 *  - `getSessionClaims()` is the DEFAULT: local JWT validation, no network
 *    round-trip. Use for "is someone signed in / who" screens (layout gates —
 *    which are early screens, never authorization: Constitution §3).
 *  - `getVerifiedUser()` hits Supabase Auth for the fresh record. Use ONLY
 *    where the fresh Auth record is required (AAL / recent-auth assertions,
 *    P6 admin-guard work).
 * JWT role claims are never authoritative for Eventies roles (05): the
 * authoritative role lives in the `profiles` row.
 */

export type SessionIdentity = {
  userId: string
  /** JWT AAL claim — informational here; asserted for real in admin-guard (P6). */
  aal: string | null
}

export async function getSessionClaims(
  client?: SupabaseClient<Database>
): Promise<SessionIdentity | null> {
  const supabase = client ?? (await createSupabaseServerClient())
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  const claims = data.claims as { sub?: string; aal?: string }
  if (!claims.sub) return null
  return { userId: claims.sub, aal: claims.aal ?? null }
}

export async function getVerifiedUser(client?: SupabaseClient<Database>): Promise<User | null> {
  const supabase = client ?? (await createSupabaseServerClient())
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
}

/** Resolve the authoritative role from profiles (05 §Role enforcement). */
export async function getAuthoritativeRole(
  userId: string,
  client?: SupabaseClient<Database>
): Promise<string | null> {
  const supabase = client ?? (await createSupabaseServerClient())
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (error) return null
  return (data as { role?: string } | null)?.role ?? null
}
