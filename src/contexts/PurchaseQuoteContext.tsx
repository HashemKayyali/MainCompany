import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Product } from '../data/products/types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { PurchaseQuoteDraftItem } from '../types/commerce'
import { clampQuantity } from '../utils/commerce'

interface PurchaseQuoteContextValue {
  items: PurchaseQuoteDraftItem[]
  itemCount: number
  addProduct: (product: Product, quantity?: number, note?: string) => void
  updateQuantity: (productSlug: string, quantity: number) => void
  updateNote: (productSlug: string, note: string) => void
  removeItem: (productSlug: string) => void
  clearDraft: () => void
}

const STORAGE_KEY = 'bl-purchase-quote-draft'
const PurchaseQuoteContext = createContext<PurchaseQuoteContextValue>({} as PurchaseQuoteContextValue)

function productToDraftItem(product: Product, quantity: number, note: string): PurchaseQuoteDraftItem {
  return {
    productId: product.id,
    productSlug: product.slug,
    productTitle: product.name,
    productImage: product.heroImage || product.gallery?.[0] || '',
    quantity: clampQuantity(quantity),
    note,
  }
}

export function PurchaseQuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<PurchaseQuoteDraftItem[]>(STORAGE_KEY, [])

  const addProduct = (product: Product, quantity = 1, note = '') => {
    setItems(current => {
      const existing = current.find(item => item.productSlug === product.slug)
      if (existing) {
        return current.map(item =>
          item.productSlug === product.slug
            ? {
                ...item,
                quantity: clampQuantity(item.quantity + quantity),
                note: note.trim() || item.note,
              }
            : item
        )
      }

      return [...current, productToDraftItem(product, quantity, note)]
    })
  }

  const updateQuantity = (productSlug: string, quantity: number) => {
    setItems(current =>
      current.map(item =>
        item.productSlug === productSlug ? { ...item, quantity: clampQuantity(quantity) } : item
      )
    )
  }

  const updateNote = (productSlug: string, note: string) => {
    setItems(current =>
      current.map(item => (item.productSlug === productSlug ? { ...item, note } : item))
    )
  }

  const removeItem = (productSlug: string) => {
    setItems(current => current.filter(item => item.productSlug !== productSlug))
  }

  const clearDraft = () => setItems([])

  const value = useMemo<PurchaseQuoteContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addProduct,
      updateQuantity,
      updateNote,
      removeItem,
      clearDraft,
    }),
    [items]
  )

  return <PurchaseQuoteContext.Provider value={value}>{children}</PurchaseQuoteContext.Provider>
}

export function usePurchaseQuote() {
  return useContext(PurchaseQuoteContext)
}
