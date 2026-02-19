import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Product, ProductPart, Category } from '../data/products/types'
import type { Customer } from '../data/customers'
import * as productsApi from '../services/products.service'
import * as partsApi from '../services/parts.service'
import * as customersApi from '../services/customers.service'
import * as categoriesApi from '../services/categories.service'

interface DataCtx {
  products: Product[]
  parts: ProductPart[]
  customers: Customer[]
  categories: Category[]
  loading: boolean
  error: string | null

  addProduct: (p: Product) => Promise<void>
  updateProduct: (s: string, p: Partial<Product>) => Promise<void>
  deleteProduct: (s: string) => Promise<void>

  addPart: (p: ProductPart) => Promise<void>
  updatePart: (id: string, p: Partial<ProductPart>) => Promise<void>
  deletePart: (id: string) => Promise<void>

  addCustomer: (c: Customer) => Promise<void>
  updateCustomer: (s: string, c: Partial<Customer>) => Promise<void>
  deleteCustomer: (s: string) => Promise<void>

  addCategory: (c: Category) => Promise<void>
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  getProductBySlug: (s: string) => Product | undefined
  getPartsByProduct: (s: string) => ProductPart[]
  getProductsByCategory: (id: string) => Product[]
  featuredProducts: Product[]
  allCategoryTags: string[]

  refreshAll: () => Promise<void>
  resetToDefaults: () => void
}

const Ctx = createContext<DataCtx>({} as DataCtx)

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [parts, setParts] = useState<ProductPart[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Load all data from Supabase ──
  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, pa, cu, ca] = await Promise.all([
        productsApi.getAll(),
        partsApi.getAll(),
        customersApi.getAll(),
        categoriesApi.getAll(),
      ])
      setProducts(p)
      setParts(pa)
      setCustomers(cu)
      setCategories(ca)
    } catch (err: any) {
      console.error('Failed to load data from Supabase:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refreshAll() }, [refreshAll])

  // ── Products CRUD ──
  const addProduct = async (p: Product) => {
    try {
      const created = await productsApi.create(p)
      setProducts(prev => [...prev, created])
    } catch (err: any) { console.error(err); throw err }
  }

  const updateProduct = async (slug: string, u: Partial<Product>) => {
    try {
      const updated = await productsApi.update(slug, u)
      setProducts(prev => prev.map(p => p.slug === slug ? updated : p))
    } catch (err: any) { console.error(err); throw err }
  }

  const deleteProduct = async (slug: string) => {
    try {
      await productsApi.remove(slug)
      setProducts(prev => prev.filter(p => p.slug !== slug))
      setParts(prev => prev.filter(p => p.productSlug !== slug))
    } catch (err: any) { console.error(err); throw err }
  }

  // ── Parts CRUD ──
  const addPart = async (p: ProductPart) => {
    try {
      const created = await partsApi.create(p)
      setParts(prev => [...prev, created])
    } catch (err: any) { console.error(err); throw err }
  }

  const updatePart = async (id: string, u: Partial<ProductPart>) => {
    try {
      const updated = await partsApi.update(id, u)
      setParts(prev => prev.map(p => p.id === id ? updated : p))
    } catch (err: any) { console.error(err); throw err }
  }

  const deletePart = async (id: string) => {
    try {
      await partsApi.remove(id)
      setParts(prev => prev.filter(p => p.id !== id))
    } catch (err: any) { console.error(err); throw err }
  }

  // ── Customers CRUD ──
  const addCustomer = async (c: Customer) => {
    try {
      const created = await customersApi.create(c)
      setCustomers(prev => [...prev, created])
    } catch (err: any) { console.error(err); throw err }
  }

  const updateCustomer = async (slug: string, u: Partial<Customer>) => {
    try {
      const updated = await customersApi.update(slug, u)
      setCustomers(prev => prev.map(c => c.slug === slug ? updated : c))
    } catch (err: any) { console.error(err); throw err }
  }

  const deleteCustomer = async (slug: string) => {
    try {
      await customersApi.remove(slug)
      setCustomers(prev => prev.filter(c => c.slug !== slug))
    } catch (err: any) { console.error(err); throw err }
  }

  // ── Categories CRUD ──
  const addCategory = async (c: Category) => {
    try {
      const created = await categoriesApi.create(c)
      setCategories(prev => [...prev, created])
    } catch (err: any) { console.error(err); throw err }
  }

  const updateCategory = async (id: string, u: Partial<Category>) => {
    try {
      const updated = await categoriesApi.update(id, u)
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
    } catch (err: any) { console.error(err); throw err }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.remove(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err: any) { console.error(err); throw err }
  }

  // ── Helpers (same interface as before) ──
  const getProductBySlug = (s: string) => products.find(p => p.slug === s)
  const getPartsByProduct = (s: string) => parts.filter(p => p.productSlug === s)
  const getProductsByCategory = (id: string) => products.filter(p => p.categoryId === id)
  const featuredProducts = products.filter(p => p.featured)
  const allCategoryTags = Array.from(new Set(products.flatMap(p => p.categoryTags)))

  const resetToDefaults = () => {
    alert('Reset is disabled when using Supabase. Manage data from the admin panel.')
  }

  return (
    <Ctx.Provider value={{
      products, parts, customers, categories, loading, error,
      addProduct, updateProduct, deleteProduct,
      addPart, updatePart, deletePart,
      addCustomer, updateCustomer, deleteCustomer,
      addCategory, updateCategory, deleteCategory,
      getProductBySlug, getPartsByProduct, getProductsByCategory,
      featuredProducts, allCategoryTags,
      refreshAll, resetToDefaults,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useData = () => useContext(Ctx)
