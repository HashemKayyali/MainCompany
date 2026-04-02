import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Database,
  PurchaseQuoteItemRow,
  PurchaseQuoteRequestRow,
} from '../lib/database.types'
import type {
  CustomerRequestListItem,
  PurchaseQuoteCreateInput,
  PurchaseQuoteItem,
  PurchaseQuoteRequest,
  PurchaseQuoteRequestDetails,
} from '../types/commerce'
import { normalizeRpcSingle } from '../utils/commerce'
import { getRequestHistory } from './request-history.service'
import { requireAuthenticatedSession } from './session-auth.service'

type CreatePurchaseQuoteRpcRow = Database['public']['Functions']['create_purchase_quote_request']['Returns'][number]

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function mapPurchaseQuoteRequest(row: PurchaseQuoteRequestRow): PurchaseQuoteRequest {
  return {
    id: row.id,
    requestNumber: row.request_number,
    profileId: row.profile_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    companyName: row.company_name ?? '',
    city: row.city,
    address: row.address,
    notes: row.notes ?? '',
    adminInternalNotes: row.admin_internal_notes ?? '',
    status: row.status as PurchaseQuoteRequest['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPurchaseQuoteItem(row: PurchaseQuoteItemRow): PurchaseQuoteItem {
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productTitleSnapshot: row.product_title_snapshot,
    quantity: row.quantity,
    createdAt: row.created_at,
  }
}

export async function createPurchaseQuoteRequest(input: PurchaseQuoteCreateInput) {
  ensureSupabase()
  await requireAuthenticatedSession('sending your purchase quote request')

  const payload = {
    customer_name: input.customerName,
    email: input.email,
    phone: input.phone,
    company_name: input.companyName || null,
    city: input.city,
    address: input.address,
    notes: input.notes || null,
    items: input.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  }

  const { data, error } = await supabase.rpc('create_purchase_quote_request', {
    payload: payload as Database['public']['Functions']['create_purchase_quote_request']['Args']['payload'],
  })

  if (error) throw error
  const row = normalizeRpcSingle(data as CreatePurchaseQuoteRpcRow[] | CreatePurchaseQuoteRpcRow | null)
  if (!row) throw new Error('Could not create purchase quote request')
  return { id: row.id, requestNumber: row.request_number }
}

export async function listMyPurchaseQuotes(profileId: string): Promise<CustomerRequestListItem[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('purchase_quote_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .returns<PurchaseQuoteRequestRow[]>()

  if (error) throw error

  const requests = (data || []).map(mapPurchaseQuoteRequest)
  const itemCounts = await Promise.all(
    requests.map(async request => {
      const { count, error: countError } = await supabase
        .from('purchase_quote_items')
        .select('*', { count: 'exact', head: true })
        .eq('purchase_quote_request_id', request.id)

      if (countError) throw countError
      return count ?? 0
    })
  )

  return requests.map((request, index) => ({
    id: request.id,
    requestNumber: request.requestNumber,
    type: 'purchase_quote',
    status: request.status,
    createdAt: request.createdAt,
    itemCount: itemCounts[index],
    total: null,
    customerName: request.customerName,
  }))
}

export async function getPurchaseQuoteByNumber(profileId: string, requestNumber: string): Promise<PurchaseQuoteRequestDetails | null> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('purchase_quote_requests')
    .select('*')
    .eq('profile_id', profileId)
    .eq('request_number', requestNumber)
    .maybeSingle()
    .returns<PurchaseQuoteRequestRow | null>()

  if (error) throw error
  if (!data) return null

  return getPurchaseQuoteById(data.id)
}

export async function getPurchaseQuoteById(id: string): Promise<PurchaseQuoteRequestDetails | null> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('purchase_quote_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
    .returns<PurchaseQuoteRequestRow | null>()

  if (error) throw error
  if (!data) return null

  const [itemsResponse, history] = await Promise.all([
    supabase
      .from('purchase_quote_items')
      .select('*')
      .eq('purchase_quote_request_id', id)
      .order('created_at', { ascending: true })
      .returns<PurchaseQuoteItemRow[]>(),
    getRequestHistory('purchase_quote', id),
  ])

  if (itemsResponse.error) throw itemsResponse.error

  return {
    ...mapPurchaseQuoteRequest(data),
    items: (itemsResponse.data || []).map(mapPurchaseQuoteItem),
    history,
  }
}

export async function updatePurchaseQuoteAdminNotes(id: string, adminInternalNotes: string) {
  ensureSupabase()
  const { error } = await supabase
    .from('purchase_quote_requests')
    .update({ admin_internal_notes: adminInternalNotes })
    .eq('id', id)

  if (error) throw error
}
