import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Database,
  RentalRequestItemRow,
  RentalRequestRow,
} from '../lib/database.types'
import type {
  CustomerRequestListItem,
  RentalRequest,
  RentalRequestCreateInput,
  RentalRequestDetails,
  RentalRequestItem,
} from '../types/commerce'
import { normalizeRpcSingle } from '../utils/commerce'
import { getRequestHistory } from './request-history.service'
import { requireAuthenticatedSession } from './session-auth.service'

type CreateRentalRpcRow = Database['public']['Functions']['create_rental_request']['Returns'][number]

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function mapRentalRequest(row: RentalRequestRow): RentalRequest {
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
    eventName: row.event_name ?? '',
    notes: row.notes ?? '',
    adminInternalNotes: row.admin_internal_notes ?? '',
    subtotal: Number(row.subtotal ?? 0),
    extraFees: Number(row.extra_fees ?? 0),
    grandTotal: Number(row.grand_total ?? 0),
    status: row.status as RentalRequest['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRentalItem(row: RentalRequestItemRow): RentalRequestItem {
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productTitleSnapshot: row.product_title_snapshot,
    quantity: row.quantity,
    rentalStartDate: row.rental_start_date,
    rentalEndDate: row.rental_end_date,
    rentalDays: row.rental_days,
    unitPrice: Number(row.unit_price ?? 0),
    lineTotal: Number(row.line_total ?? 0),
    createdAt: row.created_at,
  }
}

export async function createRentalRequest(input: RentalRequestCreateInput) {
  ensureSupabase()
  await requireAuthenticatedSession('submitting your rental request')

  const payload = {
    customer_name: input.customerName,
    email: input.email,
    phone: input.phone,
    company_name: input.companyName || null,
    city: input.city,
    address: input.address,
    event_name: input.eventName || null,
    notes: input.notes || null,
    extra_fees: input.extraFees ?? 0,
    items: input.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      rental_start_date: item.rentalStartDate,
      rental_end_date: item.rentalEndDate,
    })),
  }

  const { data, error } = await supabase.rpc('create_rental_request', {
    payload: payload as Database['public']['Functions']['create_rental_request']['Args']['payload'],
  })

  if (error) throw error
  const row = normalizeRpcSingle(data as CreateRentalRpcRow[] | CreateRentalRpcRow | null)
  if (!row) throw new Error('Could not create rental request')
  return { id: row.id, requestNumber: row.request_number }
}

export async function listMyRentalRequests(profileId: string): Promise<CustomerRequestListItem[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('rental_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .returns<RentalRequestRow[]>()

  if (error) throw error

  const requests = (data || []).map(mapRentalRequest)
  const itemCounts = await Promise.all(
    requests.map(async request => {
      const { count, error: countError } = await supabase
        .from('rental_request_items')
        .select('*', { count: 'exact', head: true })
        .eq('rental_request_id', request.id)

      if (countError) throw countError
      return count ?? 0
    })
  )

  return requests.map((request, index) => ({
    id: request.id,
    requestNumber: request.requestNumber,
    type: 'rental',
    status: request.status,
    createdAt: request.createdAt,
    itemCount: itemCounts[index],
    total: request.grandTotal,
    customerName: request.customerName,
  }))
}

export async function getRentalRequestByNumber(profileId: string, requestNumber: string): Promise<RentalRequestDetails | null> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('rental_requests')
    .select('*')
    .eq('profile_id', profileId)
    .eq('request_number', requestNumber)
    .maybeSingle()
    .returns<RentalRequestRow | null>()

  if (error) throw error
  if (!data) return null

  return getRentalRequestById(data.id)
}

export async function getRentalRequestById(id: string): Promise<RentalRequestDetails | null> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('rental_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
    .returns<RentalRequestRow | null>()

  if (error) throw error
  if (!data) return null

  const [itemsResponse, history] = await Promise.all([
    supabase
      .from('rental_request_items')
      .select('*')
      .eq('rental_request_id', id)
      .order('created_at', { ascending: true })
      .returns<RentalRequestItemRow[]>(),
    getRequestHistory('rental', id),
  ])

  if (itemsResponse.error) throw itemsResponse.error

  return {
    ...mapRentalRequest(data),
    items: (itemsResponse.data || []).map(mapRentalItem),
    history,
  }
}

export async function updateRentalAdminNotes(id: string, adminInternalNotes: string) {
  ensureSupabase()
  const { error } = await supabase
    .from('rental_requests')
    .update({ admin_internal_notes: adminInternalNotes })
    .eq('id', id)

  if (error) throw error
}
