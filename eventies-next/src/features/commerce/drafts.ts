export const RENTAL_DRAFT_KEY = 'bl-rental-cart'
export const QUOTE_DRAFT_KEY = 'bl-purchase-quote-draft'

export type RentalMode = 'shared' | 'per_item'
export type RentalDraftItem = {
  productId: string
  productSlug: string
  productTitle: string
  productImage: string
  unitPrice: number
  currency: string
  quantity: number
  startDate: string
  endDate: string
  minimumRentalDays: number
  stockActive: number
}
export type RentalDraft = {
  mode: RentalMode
  sharedStartDate: string
  sharedEndDate: string
  items: RentalDraftItem[]
}
export type QuoteDraftItem = Pick<
  RentalDraftItem,
  'productId' | 'productSlug' | 'productTitle' | 'productImage' | 'quantity'
> & { note: string }

export const EMPTY_RENTAL_DRAFT: RentalDraft = {
  mode: 'shared',
  sharedStartDate: '',
  sharedEndDate: '',
  items: [],
}

export const clampQuantity = (value: number) => Math.max(1, Math.min(100, Math.trunc(value) || 1))

export function upsertRentalItem(items: RentalDraftItem[], incoming: RentalDraftItem) {
  const existing = items.find((item) => item.productSlug === incoming.productSlug)
  if (!existing) return [...items, { ...incoming, quantity: clampQuantity(incoming.quantity) }]
  return items.map((item) =>
    item.productSlug === incoming.productSlug
      ? { ...item, quantity: clampQuantity(item.quantity + incoming.quantity) }
      : item
  )
}

export function upsertQuoteItem(items: QuoteDraftItem[], incoming: QuoteDraftItem) {
  const existing = items.find((item) => item.productSlug === incoming.productSlug)
  if (!existing) return [...items, { ...incoming, quantity: clampQuantity(incoming.quantity) }]
  return items.map((item) =>
    item.productSlug === incoming.productSlug
      ? {
          ...item,
          quantity: clampQuantity(item.quantity + incoming.quantity),
          note: incoming.note.trim() || item.note,
        }
      : item
  )
}
