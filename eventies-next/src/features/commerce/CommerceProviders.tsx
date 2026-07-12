'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  EMPTY_RENTAL_DRAFT,
  QUOTE_DRAFT_KEY,
  RENTAL_DRAFT_KEY,
  clampQuantity,
  type QuoteDraftItem,
  type RentalDraft,
  type RentalDraftItem,
  type RentalMode,
  upsertQuoteItem,
  upsertRentalItem,
} from './drafts'

type RentalContextValue = RentalDraft & {
  hydrated: boolean
  add: (item: RentalDraftItem) => void
  remove: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  setMode: (mode: RentalMode) => void
  setSharedDates: (startDate: string, endDate: string) => void
  clear: () => void
}
type QuoteContextValue = {
  items: QuoteDraftItem[]
  hydrated: boolean
  add: (item: QuoteDraftItem) => void
  remove: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  setNote: (slug: string, note: string) => void
  clear: () => void
}

const RentalContext = createContext<RentalContextValue | null>(null)
const QuoteContext = createContext<QuoteContextValue | null>(null)

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function CommerceProviders({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [rental, setRental] = useState<RentalDraft>(EMPTY_RENTAL_DRAFT)
  const [quotes, setQuotes] = useState<QuoteDraftItem[]>([])

  useEffect(() => {
    queueMicrotask(() => {
      setRental(read(RENTAL_DRAFT_KEY, EMPTY_RENTAL_DRAFT))
      setQuotes(read(QUOTE_DRAFT_KEY, []))
      setHydrated(true)
    })
  }, [])
  useEffect(() => {
    if (hydrated) localStorage.setItem(RENTAL_DRAFT_KEY, JSON.stringify(rental))
  }, [hydrated, rental])
  useEffect(() => {
    if (hydrated) localStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify(quotes))
  }, [hydrated, quotes])

  const rentalValue = useMemo<RentalContextValue>(
    () => ({
      ...rental,
      hydrated,
      add: (item) =>
        setRental((current) => ({ ...current, items: upsertRentalItem(current.items, item) })),
      remove: (slug) =>
        setRental((current) => ({
          ...current,
          items: current.items.filter((item) => item.productSlug !== slug),
        })),
      setQuantity: (slug, quantity) =>
        setRental((current) => ({
          ...current,
          items: current.items.map((item) =>
            item.productSlug === slug ? { ...item, quantity: clampQuantity(quantity) } : item
          ),
        })),
      setMode: (mode) => setRental((current) => ({ ...current, mode })),
      setSharedDates: (sharedStartDate, sharedEndDate) =>
        setRental((current) => ({ ...current, sharedStartDate, sharedEndDate })),
      clear: () => setRental(EMPTY_RENTAL_DRAFT),
    }),
    [hydrated, rental]
  )
  const quoteValue = useMemo<QuoteContextValue>(
    () => ({
      items: quotes,
      hydrated,
      add: (item) => setQuotes((current) => upsertQuoteItem(current, item)),
      remove: (slug) => setQuotes((current) => current.filter((item) => item.productSlug !== slug)),
      setQuantity: (slug, quantity) =>
        setQuotes((current) =>
          current.map((item) =>
            item.productSlug === slug ? { ...item, quantity: clampQuantity(quantity) } : item
          )
        ),
      setNote: (slug, note) =>
        setQuotes((current) =>
          current.map((item) => (item.productSlug === slug ? { ...item, note } : item))
        ),
      clear: () => setQuotes([]),
    }),
    [hydrated, quotes]
  )

  return (
    <RentalContext.Provider value={rentalValue}>
      <QuoteContext.Provider value={quoteValue}>{children}</QuoteContext.Provider>
    </RentalContext.Provider>
  )
}

export function useRentalDraft() {
  const value = useContext(RentalContext)
  if (!value) throw new Error('useRentalDraft must be inside CommerceProviders')
  return value
}
export function useQuoteDraft() {
  const value = useContext(QuoteContext)
  if (!value) throw new Error('useQuoteDraft must be inside CommerceProviders')
  return value
}
