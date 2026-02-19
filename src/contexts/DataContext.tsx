import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Product, ProductPart, Category } from '../data/products/types'
import type { Customer } from '../data/customers'
import type { GalleryAlbum } from '../data/gallery'
import * as productsApi from '../services/products.service'
import * as partsApi from '../services/parts.service'
import * as customersApi from '../services/customers.service'
import * as categoriesApi from '../services/categories.service'
import * as galleryApi from '../services/gallery.service'
import { isSupabaseConfigured } from '../lib/supabase'
import { DEFAULT_PRODUCTS, DEFAULT_PARTS, DEFAULT_CUSTOMERS, DEFAULT_CATEGORIES } from '../data/defaults'

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

  galleryAlbums: GalleryAlbum[]
  addGalleryAlbum: (a: GalleryAlbum) => Promise<void>
  updateGalleryAlbum: (slug: string, a: Partial<GalleryAlbum>) => Promise<void>
  deleteGalleryAlbum: (slug: string) => Promise<void>

  getProductBySlug: (s: string) => Product | undefined
  getPartsByProduct: (s: string) => ProductPart[]
  getProductsByCategory: (id: string) => Product[]
  featuredProducts: Product[]
  allCategoryTags: string[]

  refreshAll: () => Promise<void>
  resetToDefaults: () => void
}

const Ctx = createContext<DataCtx>({} as DataCtx)

const MAX_RETRIES = 3
const RETRY_DELAY = 2000

function applyDefaults(
  setProducts: (v: Product[]) => void,
  setParts: (v: ProductPart[]) => void,
  setCustomers: (v: Customer[]) => void,
  setCategories: (v: Category[]) => void,
  setGalleryAlbums: (v: GalleryAlbum[]) => void
) {
  setProducts(DEFAULT_PRODUCTS)
  setParts(DEFAULT_PARTS)
  setCustomers(DEFAULT_CUSTOMERS)
  setCategories(DEFAULT_CATEGORIES)
  setGalleryAlbums([])
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [parts, setParts] = useState<ProductPart[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const retryCount = useRef(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const safeSet = (fn: () => void) => {
    if (mountedRef.current) fn()
  }

  const loadAllOnce = useCallback(async () => {
    const [p, pa, cu, ca, ga] = await Promise.all([
      productsApi.getAll(),
      partsApi.getAll(),
      customersApi.getAll(),
      categoriesApi.getAll(),
      galleryApi.getAll().catch(() => []),
    ])

    safeSet(() => {
      setProducts(p)
      setParts(pa)
      setCustomers(cu)
      setCategories(ca)
      setGalleryAlbums(ga)
    })
  }, [])

  const refreshAll = useCallback(async () => {
    // Supabase not configured -> defaults immediately
    if (!isSupabaseConfigured()) {
      safeSet(() => {
        applyDefaults(setProducts, setParts, setCustomers, setCategories, setGalleryAlbums)
        setError(null)
        setLoading(false)
      })
      retryCount.current = 0
      return
    }

    safeSet(() => {
      setLoading(true)
      setError(null)
    })

    try {
      await loadAllOnce()
      retryCount.current = 0
      safeSet(() => setLoading(false))
    } catch (err: any) {
      console.error('Failed to load data from Supabase:', err)
      safeSet(() => setError(err?.message || 'Failed to load data'))

      // retry
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++
        const delay = RETRY_DELAY * retryCount.current

        if (retryTimer.current) clearTimeout(retryTimer.current)
        retryTimer.current = setTimeout(async () => {
          try {
            await loadAllOnce()
            retryCount.current = 0
            safeSet(() => {
              setError(null)
              setLoading(false)
            })
          } catch (retryErr: any) {
            console.error('Retry failed:', retryErr)
            safeSet(() => setError(retryErr?.message || 'Failed to load data'))

            if (retryCount.current >= MAX_RETRIES) {
              safeSet(() => {
                applyDefaults(setProducts, setParts, setCustomers, setCategories, setGalleryAlbums)
                setError('Supabase unavailable. Showing default content.')
                setLoading(false)
              })
              retryCount.current = 0
            }
          }
        }, delay)

        return
      }

      // no more retries -> defaults
      safeSet(() => {
        applyDefaults(setProducts, setParts, setCustomers, setCategories, setGalleryAlbums)
        setError('Supabase unavailable. Showing default content.')
        setLoading(false)
      })
      retryCount.current = 0
    }
  }, [loadAllOnce])

  useEffect(() => {
    mountedRef.current = true
    refreshAll()
    return () => {
      mountedRef.current = false
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [refreshAll])

  // Products CRUD
  const addProduct = async (p: Product) => {
    const created = await productsApi.create(p)
    safeSet(() => setProducts(prev => [...prev, created]))
  }

  const updateProduct = async (slug: string, u: Partial<Product>) => {
    const updated = await productsApi.update(slug, u)
    safeSet(() => setProducts(prev => prev.map(p => (p.slug === slug ? updated : p))))
  }

  const deleteProduct = async (slug: string) => {
    await productsApi.remove(slug)
    safeSet(() => {
      setProducts(prev => prev.filter(p => p.slug !== slug))
      setParts(prev => prev.filter(p => p.productSlug !== slug))
    })
  }

  // Parts CRUD
  const addPart = async (p: ProductPart) => {
    const created = await partsApi.create(p)
    safeSet(() => setParts(prev => [...prev, created]))
  }

  const updatePart = async (id: string, u: Partial<ProductPart>) => {
    const updated = await partsApi.update(id, u)
    safeSet(() => setParts(prev => prev.map(p => (p.id === id ? updated : p))))
  }

  const deletePart = async (id: string) => {
    await partsApi.remove(id)
    safeSet(() => setParts(prev => prev.filter(p => p.id !== id)))
  }

  // Customers CRUD
  const addCustomer = async (c: Customer) => {
    const created = await customersApi.create(c)
    safeSet(() => setCustomers(prev => [...prev, created]))
  }

  const updateCustomer = async (slug: string, u: Partial<Customer>) => {
    const updated = await customersApi.update(slug, u)
    safeSet(() => setCustomers(prev => prev.map(c => (c.slug === slug ? updated : c))))
  }

  const deleteCustomer = async (slug: string) => {
    await customersApi.remove(slug)
    safeSet(() => setCustomers(prev => prev.filter(c => c.slug !== slug)))
  }

  // Categories CRUD
  const addCategory = async (c: Category) => {
    const created = await categoriesApi.create(c)
    safeSet(() => setCategories(prev => [...prev, created]))
  }

  const updateCategory = async (id: string, u: Partial<Category>) => {
    const updated = await categoriesApi.update(id, u)
    safeSet(() => setCategories(prev => prev.map(c => (c.id === id ? updated : c))))
  }

  const deleteCategory = async (id: string) => {
    await categoriesApi.remove(id)
    safeSet(() => setCategories(prev => prev.filter(c => c.id !== id)))
  }

  // Gallery CRUD
  const addGalleryAlbum = async (a: GalleryAlbum) => {
    const created = await galleryApi.create(a)
    safeSet(() => setGalleryAlbums(prev => [...prev, created]))
  }

  const updateGalleryAlbum = async (slug: string, u: Partial<GalleryAlbum>) => {
    const updated = await galleryApi.update(slug, u)
    safeSet(() => setGalleryAlbums(prev => prev.map(a => (a.slug === slug ? updated : a))))
  }

  const deleteGalleryAlbum = async (slug: string) => {
    await galleryApi.remove(slug)
    safeSet(() => setGalleryAlbums(prev => prev.filter(a => a.slug !== slug)))
  }

  // Helpers
  const getProductBySlug = (s: string) => products.find(p => p.slug === s)
  const getPartsByProduct = (s: string) => parts.filter(p => p.productSlug === s)
  const getProductsByCategory = (id: string) => products.filter(p => p.categoryId === id)
  const featuredProducts = products.filter(p => p.featured)
  const allCategoryTags = Array.from(new Set(products.flatMap(p => p.categoryTags)))

  const resetToDefaults = () => {
    safeSet(() => {
      applyDefaults(setProducts, setParts, setCustomers, setCategories, setGalleryAlbums)
      setError(null)
      setLoading(false)
    })
    retryCount.current = 0
  }

  return (
    <Ctx.Provider
      value={{
        products,
        parts,
        customers,
        categories,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addPart,
        updatePart,
        deletePart,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCategory,
        updateCategory,
        deleteCategory,
        galleryAlbums,
        addGalleryAlbum,
        updateGalleryAlbum,
        deleteGalleryAlbum,
        getProductBySlug,
        getPartsByProduct,
        getProductsByCategory,
        featuredProducts,
        allCategoryTags,
        refreshAll,
        resetToDefaults,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useData = () => useContext(Ctx)