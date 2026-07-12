'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { Product } from '@/shared/types/catalog'
import {
  EMPTY_RENTAL_DRAFT,
  QUOTE_DRAFT_KEY,
  RENTAL_DRAFT_KEY,
  upsertQuoteItem,
  upsertRentalItem,
  type QuoteDraftItem,
  type RentalDraft,
  type RentalDraftItem,
} from './drafts'

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AddToDraftActions({
  product,
  labels,
}: {
  product: Product
  labels: { rental: string; quote: string; added: string }
}) {
  const router = useRouter()
  const [status, setStatus] = useState('')
  const image = product.heroImage || product.gallery[0] || ''
  function addRental() {
    if (!product.id) return
    const draft = parse<RentalDraft>(RENTAL_DRAFT_KEY, EMPTY_RENTAL_DRAFT)
    const item: RentalDraftItem = {
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.name,
      productImage: image,
      unitPrice: product.rentalPricePerDay,
      currency: product.currency,
      quantity: 1,
      startDate: '',
      endDate: '',
      minimumRentalDays: product.minimumRentalDays ?? 1,
      stockActive: product.stockActive ?? 0,
    }
    localStorage.setItem(
      RENTAL_DRAFT_KEY,
      JSON.stringify({ ...draft, items: upsertRentalItem(draft.items, item) })
    )
    setStatus(labels.added)
    router.push('/rental-cart')
  }
  function addQuote() {
    if (!product.id) return
    const items = parse<QuoteDraftItem[]>(QUOTE_DRAFT_KEY, [])
    localStorage.setItem(
      QUOTE_DRAFT_KEY,
      JSON.stringify(
        upsertQuoteItem(items, {
          productId: product.id,
          productSlug: product.slug,
          productTitle: product.name,
          productImage: image,
          quantity: 1,
          note: '',
        })
      )
    )
    setStatus(labels.added)
    router.push('/purchase-quote')
  }
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {product.rentalEnabled !== false && (
        <button
          onClick={addRental}
          className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white"
        >
          {labels.rental}
        </button>
      )}
      {product.saleEnabled && (
        <button
          onClick={addQuote}
          className="rounded-full border border-violet-300 px-5 py-3 font-bold text-violet-800"
        >
          {labels.quote}
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  )
}
