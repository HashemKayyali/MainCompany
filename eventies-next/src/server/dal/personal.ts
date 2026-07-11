import 'server-only'

import type { Database } from '@/shared/types/database.types'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getSessionClaims } from '@/server/supabase/session'

/**
 * DATA-008 — personal fetchers: session-bound, NO-STORE BY CONSTRUCTION.
 * These functions read cookies (via the per-request server client) and are
 * therefore forbidden from any 'use cache' scope — the QG-ARCH-3 gate greps
 * for exactly that mistake. Every render that calls these is dynamic.
 */

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export async function getMyProfile(): Promise<Row<'profiles'> | null> {
  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', identity.userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getMyRentalRequests(): Promise<Row<'rental_requests'>[]> {
  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) return []
  const { data, error } = await supabase
    .from('rental_requests')
    .select('*')
    .eq('profile_id', identity.userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getMyPurchaseQuotes(): Promise<Row<'purchase_quote_requests'>[]> {
  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) return []
  const { data, error } = await supabase
    .from('purchase_quote_requests')
    .select('*')
    .eq('profile_id', identity.userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
