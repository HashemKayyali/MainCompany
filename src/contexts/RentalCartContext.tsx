import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Product } from '../data/products/types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { RentalCartItem, RentalCartMode, RentalCartState } from '../types/commerce'
import {
  calculateRentalDays,
  calculateRentalLineTotal,
  clampQuantity,
  getRentalCartGrandTotal,
  resolveCartItemDates,
} from '../utils/commerce'

interface RentalCartContextValue {
  mode: RentalCartMode
  sharedStartDate: string
  sharedEndDate: string
  items: RentalCartItem[]
  itemCount: number
  grandTotal: number
  addProduct: (product: Product, quantity?: number) => void
  updateQuantity: (productSlug: string, quantity: number) => void
  removeItem: (productSlug: string) => void
  clearCart: () => void
  setMode: (mode: RentalCartMode) => void
  setSharedDates: (startDate: string, endDate: string) => void
  setItemDates: (productSlug: string, startDate: string, endDate: string) => void
  getItemDates: (item: RentalCartItem) => { startDate: string; endDate: string }
  getItemDays: (item: RentalCartItem) => number
  getItemLineTotal: (item: RentalCartItem) => number
}

const STORAGE_KEY = 'bl-rental-cart'

const DEFAULT_STATE: RentalCartState = {
  mode: 'shared',
  sharedStartDate: '',
  sharedEndDate: '',
  items: [],
}

const RentalCartContext = createContext<RentalCartContextValue>({} as RentalCartContextValue)

function productToCartItem(product: Product, quantity: number): RentalCartItem {
  return {
    productId: product.id,
    productSlug: product.slug,
    productTitle: product.name,
    productImage: product.heroImage || product.gallery?.[0] || '',
    unitPrice: product.rentalPricePerDay,
    currency: product.currency,
    quantity: clampQuantity(quantity),
    startDate: '',
    endDate: '',
    minimumRentalDays: product.minimumRentalDays ?? 1,
    stockActive: product.stockActive ?? 0,
  }
}

export function RentalCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<RentalCartState>(STORAGE_KEY, DEFAULT_STATE)

  const addProduct = (product: Product, quantity = 1) => {
    setState(current => {
      const existing = current.items.find(item => item.productSlug === product.slug)
      if (existing) {
        return {
          ...current,
          items: current.items.map(item =>
            item.productSlug === product.slug
              ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
              : item
          ),
        }
      }

      const item = productToCartItem(product, quantity)
      if (current.mode === 'shared') {
        item.startDate = current.sharedStartDate
        item.endDate = current.sharedEndDate
      }

      return { ...current, items: [...current.items, item] }
    })
  }

  const updateQuantity = (productSlug: string, quantity: number) => {
    setState(current => ({
      ...current,
      items: current.items.map(item =>
        item.productSlug === productSlug ? { ...item, quantity: clampQuantity(quantity) } : item
      ),
    }))
  }

  const removeItem = (productSlug: string) => {
    setState(current => ({
      ...current,
      items: current.items.filter(item => item.productSlug !== productSlug),
    }))
  }

  const clearCart = () => setState(DEFAULT_STATE)

  const setMode = (mode: RentalCartMode) => {
    setState(current => ({ ...current, mode }))
  }

  const setSharedDates = (startDate: string, endDate: string) => {
    setState(current => ({
      ...current,
      sharedStartDate: startDate,
      sharedEndDate: endDate,
    }))
  }

  const setItemDates = (productSlug: string, startDate: string, endDate: string) => {
    setState(current => ({
      ...current,
      items: current.items.map(item =>
        item.productSlug === productSlug ? { ...item, startDate, endDate } : item
      ),
    }))
  }

  const getItemDates = (item: RentalCartItem) =>
    resolveCartItemDates(item, state.mode, state.sharedStartDate, state.sharedEndDate)

  const getItemDays = (item: RentalCartItem) => {
    const { startDate, endDate } = getItemDates(item)
    return calculateRentalDays(startDate, endDate)
  }

  const getItemLineTotal = (item: RentalCartItem) =>
    calculateRentalLineTotal(item.quantity, item.unitPrice, getItemDays(item))

  const value = useMemo<RentalCartContextValue>(
    () => ({
      mode: state.mode,
      sharedStartDate: state.sharedStartDate,
      sharedEndDate: state.sharedEndDate,
      items: state.items,
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
      grandTotal: getRentalCartGrandTotal(
        state.items,
        state.mode,
        state.sharedStartDate,
        state.sharedEndDate
      ),
      addProduct,
      updateQuantity,
      removeItem,
      clearCart,
      setMode,
      setSharedDates,
      setItemDates,
      getItemDates,
      getItemDays,
      getItemLineTotal,
    }),
    [state]
  )

  return <RentalCartContext.Provider value={value}>{children}</RentalCartContext.Provider>
}

export function useRentalCart() {
  return useContext(RentalCartContext)
}
