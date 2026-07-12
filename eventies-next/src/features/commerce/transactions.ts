'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { RPC } from '@/shared/contracts/rpc'
import {
  purchaseQuoteSchema,
  rentalRequestSchema,
  type PurchaseQuoteInput,
  type RentalRequestInput,
} from '@/shared/schemas/transactions'
import { TransactionError, withTimeout, type SubmissionResult } from './idempotent-submit'

type RpcRow = { id: string; request_number: string }
const one = (data: RpcRow[] | RpcRow | null): RpcRow | null =>
  Array.isArray(data) ? (data[0] ?? null) : data

function classify(error: { message?: string; code?: string } | null): TransactionError {
  const message = error?.message?.toLowerCase() ?? ''
  if (message.includes('jwt') || message.includes('auth'))
    return new TransactionError('AUTH_EXPIRED')
  if (error?.code === '57014' || message.includes('timeout')) return new TransactionError('TIMEOUT')
  return new TransactionError('REJECTED')
}

export async function submitRentalRequest(input: RentalRequestInput): Promise<SubmissionResult> {
  const value = rentalRequestSchema.parse(input)
  const payload = {
    idempotency_key: value.idempotencyKey,
    customer_name: value.customerName,
    email: value.email,
    phone: value.phone,
    company_name: value.companyName || null,
    city: value.city,
    address: value.address,
    event_name: value.eventName || null,
    notes: value.notes || null,
    extra_fees: 0,
    items: value.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      rental_start_date: item.startDate,
      rental_end_date: item.endDate,
    })),
  }
  const { data, error } = await withTimeout(
    getSupabaseBrowserClient().rpc(RPC.createRentalRequest, { payload }),
    15_000
  )
  if (error) throw classify(error)
  const row = one(data as RpcRow[] | RpcRow | null)
  if (!row) throw new TransactionError('UNAVAILABLE')
  return { id: row.id, requestNumber: row.request_number }
}

export async function submitPurchaseQuote(input: PurchaseQuoteInput): Promise<SubmissionResult> {
  const value = purchaseQuoteSchema.parse(input)
  const payload = {
    idempotency_key: value.idempotencyKey,
    customer_name: value.customerName,
    email: value.email,
    phone: value.phone,
    company_name: value.companyName || null,
    city: value.city,
    address: value.address,
    notes: [
      value.notes,
      ...value.items
        .filter((item) => item.note)
        .map((item) => `${item.productTitle}: ${item.note}`),
    ]
      .filter(Boolean)
      .join('\n'),
    items: value.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
  }
  const { data, error } = await withTimeout(
    getSupabaseBrowserClient().rpc(RPC.createPurchaseQuoteRequest, { payload }),
    15_000
  )
  if (error) throw classify(error)
  const row = one(data as RpcRow[] | RpcRow | null)
  if (!row) throw new TransactionError('UNAVAILABLE')
  return { id: row.id, requestNumber: row.request_number }
}
