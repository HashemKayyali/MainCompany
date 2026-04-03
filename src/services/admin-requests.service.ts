import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database, PurchaseQuoteRequestRow, RentalRequestRow } from '../lib/database.types'
import type {
  AdminRequestListItem,
  PurchaseQuoteRequestDetails,
  RequestType,
  RentalRequestDetails,
} from '../types/commerce'
import { normalizeRpcSingle } from '../utils/commerce'
import { getPurchaseQuoteItemCounts, getRentalRequestItemCounts } from './request-counts.service'
import { getPurchaseQuoteById } from './purchase-quotes.service'
import { getRentalRequestById } from './rental-requests.service'

type ApproveRentalRpcRow = Database['public']['Functions']['approve_rental_request']['Returns'][number]
type UpdateStatusRpcRow = Database['public']['Functions']['update_request_status']['Returns'][number]

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function mapRentalRow(row: RentalRequestRow): AdminRequestListItem {
  return {
    id: row.id,
    requestNumber: row.request_number,
    type: 'rental',
    status: row.status as AdminRequestListItem['status'],
    createdAt: row.created_at,
    itemCount: 0,
    total: Number(row.grand_total ?? 0),
    customerName: row.customer_name,
    email: row.email,
  }
}

function mapPurchaseRow(row: PurchaseQuoteRequestRow): AdminRequestListItem {
  return {
    id: row.id,
    requestNumber: row.request_number,
    type: 'purchase_quote',
    status: row.status as AdminRequestListItem['status'],
    createdAt: row.created_at,
    itemCount: 0,
    total: null,
    customerName: row.customer_name,
    email: row.email,
  }
}

export async function listAdminRequests() {
  ensureSupabase()

  const [rentalsResponse, purchaseResponse] = await Promise.all([
    supabase.from('rental_requests').select('*').returns<RentalRequestRow[]>(),
    supabase.from('purchase_quote_requests').select('*').returns<PurchaseQuoteRequestRow[]>(),
  ])

  if (rentalsResponse.error) throw rentalsResponse.error
  if (purchaseResponse.error) throw purchaseResponse.error

  const rentals = (rentalsResponse.data || []).map(mapRentalRow)
  const purchaseQuotes = (purchaseResponse.data || []).map(mapPurchaseRow)
  const merged = [...rentals, ...purchaseQuotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const [rentalCounts, purchaseCounts] = await Promise.all([
    getRentalRequestItemCounts(rentals.map(request => request.id)),
    getPurchaseQuoteItemCounts(purchaseQuotes.map(request => request.id)),
  ])

  return merged.map(request => ({
    ...request,
    itemCount:
      request.type === 'rental'
        ? rentalCounts[request.id] || 0
        : purchaseCounts[request.id] || 0,
  }))
}

export async function getAdminRentalRequestDetails(id: string): Promise<RentalRequestDetails | null> {
  return getRentalRequestById(id)
}

export async function getAdminPurchaseQuoteDetails(id: string): Promise<PurchaseQuoteRequestDetails | null> {
  return getPurchaseQuoteById(id)
}

export async function approveRentalRequest(requestId: string, adminNote: string) {
  ensureSupabase()

  const { data, error } = await supabase.rpc('approve_rental_request', {
    request_id: requestId,
    admin_note: adminNote || null,
  })

  if (error) throw error
  const row = normalizeRpcSingle(data as ApproveRentalRpcRow[] | ApproveRentalRpcRow | null)
  if (!row?.ok) throw new Error('Could not approve rental request')
  return row
}

export async function updateRequestStatus(requestType: RequestType, requestId: string, newStatus: string, note: string) {
  ensureSupabase()

  const { data, error } = await supabase.rpc('update_request_status', {
    request_type: requestType,
    request_id: requestId,
    new_status: newStatus,
    note: note || null,
  })

  if (error) throw error
  const row = normalizeRpcSingle(data as UpdateStatusRpcRow[] | UpdateStatusRpcRow | null)
  if (!row?.ok) throw new Error('Could not update request status')
  return row
}
