import { supabase } from '../lib/supabase'
import type { PurchaseQuoteItemRow, RentalRequestItemRow } from '../lib/database.types'

type RentalCountRow = Pick<RentalRequestItemRow, 'rental_request_id'>
type PurchaseCountRow = Pick<PurchaseQuoteItemRow, 'purchase_quote_request_id'>

export async function getRentalRequestItemCounts(requestIds: string[]) {
  const uniqueIds = Array.from(new Set(requestIds.filter(Boolean)))
  if (!uniqueIds.length) return {} as Record<string, number>

  const { data, error } = await supabase
    .from('rental_request_items')
    .select('rental_request_id')
    .in('rental_request_id', uniqueIds)
    .returns<RentalCountRow[]>()

  if (error) throw error

  return (data || []).reduce<Record<string, number>>((counts, row) => {
    counts[row.rental_request_id] = (counts[row.rental_request_id] || 0) + 1
    return counts
  }, {})
}

export async function getPurchaseQuoteItemCounts(requestIds: string[]) {
  const uniqueIds = Array.from(new Set(requestIds.filter(Boolean)))
  if (!uniqueIds.length) return {} as Record<string, number>

  const { data, error } = await supabase
    .from('purchase_quote_items')
    .select('purchase_quote_request_id')
    .in('purchase_quote_request_id', uniqueIds)
    .returns<PurchaseCountRow[]>()

  if (error) throw error

  return (data || []).reduce<Record<string, number>>((counts, row) => {
    counts[row.purchase_quote_request_id] = (counts[row.purchase_quote_request_id] || 0) + 1
    return counts
  }, {})
}
