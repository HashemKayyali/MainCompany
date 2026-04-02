import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { RentalAvailability } from '../types/commerce'
import { normalizeRpcSingle } from '../utils/commerce'

type AvailabilityRpcRow = Database['public']['Functions']['get_rental_availability']['Returns'][number]

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function mapAvailability(row: AvailabilityRpcRow): RentalAvailability {
  return {
    productId: row.result_product_id,
    startDate: row.result_start_date,
    endDate: row.result_end_date,
    stockActive: Number(row.stock_active ?? 0),
    reservedQuantity: Number(row.reserved_quantity ?? 0),
    availableQuantity: Number(row.available_quantity ?? 0),
  }
}

export async function getRentalAvailability(productId: string, startDate: string, endDate: string) {
  ensureSupabase()

  const { data, error } = await supabase.rpc('get_rental_availability', {
    product_id: productId,
    start_date: startDate,
    end_date: endDate,
  })

  if (error) throw error
  const row = normalizeRpcSingle(data as AvailabilityRpcRow[] | AvailabilityRpcRow | null)
  return row ? mapAvailability(row) : null
}
