import 'server-only'

import type { Database } from '@/shared/types/database.types'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { getSessionClaims } from '@/server/supabase/session'
import type { CustomerRequestDetails } from '@/shared/types/requests'

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

export async function getMyRequestDetails(
  requestNumber: string
): Promise<CustomerRequestDetails | null> {
  const supabase = await createSupabaseServerClient()
  const identity = await getSessionClaims(supabase)
  if (!identity) return null

  const [rentalResult, quoteResult] = await Promise.all([
    supabase
      .from('rental_requests')
      .select('*')
      .eq('profile_id', identity.userId)
      .eq('request_number', requestNumber)
      .maybeSingle(),
    supabase
      .from('purchase_quote_requests')
      .select('*')
      .eq('profile_id', identity.userId)
      .eq('request_number', requestNumber)
      .maybeSingle(),
  ])
  if (rentalResult.error) throw rentalResult.error
  if (quoteResult.error) throw quoteResult.error
  const request = rentalResult.data ?? quoteResult.data
  if (!request) return null
  const type = rentalResult.data ? 'rental' : 'purchase_quote'

  if (type === 'rental') {
    const [items, history] = await Promise.all([
      supabase
        .from('rental_request_items')
        .select('*')
        .eq('rental_request_id', request.id)
        .order('created_at'),
      supabase
        .from('request_status_history')
        .select('*')
        .eq('request_type', type)
        .eq('request_id', request.id)
        .order('created_at'),
    ])
    if (items.error) throw items.error
    if (history.error) throw history.error
    return {
      type,
      request: rentalResult.data!,
      items: items.data ?? [],
      history: history.data ?? [],
    }
  }

  const [items, history] = await Promise.all([
    supabase
      .from('purchase_quote_items')
      .select('*')
      .eq('purchase_quote_request_id', request.id)
      .order('created_at'),
    supabase
      .from('request_status_history')
      .select('*')
      .eq('request_type', type)
      .eq('request_id', request.id)
      .order('created_at'),
  ])
  if (items.error) throw items.error
  if (history.error) throw history.error
  return { type, request: quoteResult.data!, items: items.data ?? [], history: history.data ?? [] }
}
