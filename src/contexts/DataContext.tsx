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
import * as logsApi from '../services/logs.service'
import { isSupabaseConfigured } from '../lib/supabase'
import { DEFAULT_PRODUCTS, DEFAULT_PARTS, DEFAULT_CUSTOMERS, DEFAULT_CATEGORIES } from '../data/defaults'
import { useSession } from './SessionContext'
import { useUser } from './UserContext'
import { useToast } from './ToastContext'
import { sortProductsForDisplay } from '../utils/product-order'

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
  setProducts(sortProductsForDisplay(DEFAULT_PRODUCTS))
  setParts(DEFAULT_PARTS)
  setCustomers(DEFAULT_CUSTOMERS)
  setCategories(DEFAULT_CATEGORIES)
  setGalleryAlbums([])
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { loading: sessionLoading } = useSession()
  const { currentUser } = useUser()
  const { toast } = useToast()
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

  // Helper to write a log entry
  const writeLog = useCallback(
    (action: 'create' | 'update' | 'delete', entityType: string, entityId: string, entityName: string, details?: string) => {
      if (!currentUser) return
      logsApi.addLog({
        admin_id: currentUser.id,
        admin_name: currentUser.name || 'Admin',
        admin_email: currentUser.email || '',
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        details: details || '',
      })
    },
    [currentUser]
  )

  const loadAllOnce = useCallback(async () => {
    const [p, pa, cu, ca, ga] = await Promise.all([
      productsApi.getAll(),
      partsApi.getAll(),
      customersApi.getAll(),
      categoriesApi.getAll(),
      galleryApi.getAll().catch(() => []),
    ])

    safeSet(() => {
      setProducts(sortProductsForDisplay(p))
      setParts(pa)
      setCustomers(cu)
      setCategories(ca)
      setGalleryAlbums(ga)
    })
  }, [])

  const refreshAll = useCallback(async () => {
    // ✅ لا نبدأ تحميل الداتا قبل ما يخلص تهيئة auth (يقلل lock contention)
    if (sessionLoading) return

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
  }, [loadAllOnce, sessionLoading])

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
    try {
      const created = await productsApi.create(p)
      safeSet(() => setProducts(prev => sortProductsForDisplay([...prev, created])))
      writeLog('create', 'product', created.slug, created.name || created.slug)
      toast(`${created.name} added`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to add product', 'error')
      throw err
    }
  }

  const updateProduct = async (slug: string, u: Partial<Product>) => {
    try {
      const updated = await productsApi.update(slug, u)
      safeSet(() =>
        setProducts(prev =>
          sortProductsForDisplay(prev.map(p => (p.slug === slug ? updated : p)))
        )
      )
      writeLog('update', 'product', slug, updated.name || slug)
      toast(`${updated.name} updated`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to update product', 'error')
      throw err
    }
  }

  const deleteProduct = async (slug: string) => {
    try {
      const existing = products.find(p => p.slug === slug)
      await productsApi.remove(slug)
      safeSet(() => {
        setProducts(prev => prev.filter(p => p.slug !== slug))
        setParts(prev => prev.filter(p => p.productSlug !== slug))
      })
      writeLog('delete', 'product', slug, existing?.name || slug)
      toast(`${existing?.name || slug} deleted`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to delete product', 'error')
      throw err
    }
  }

  // Parts CRUD
  const addPart = async (p: ProductPart) => {
    try {
      const created = await partsApi.create(p)
      safeSet(() => setParts(prev => [...prev, created]))
      writeLog('create', 'part', created.id, created.name || created.id)
      toast(`${created.name} added`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to add part', 'error')
      throw err
    }
  }

  const updatePart = async (id: string, u: Partial<ProductPart>) => {
    try {
      const updated = await partsApi.update(id, u)
      safeSet(() => setParts(prev => prev.map(p => (p.id === id ? updated : p))))
      writeLog('update', 'part', id, updated.name || id)
      toast(`${updated.name} updated`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to update part', 'error')
      throw err
    }
  }

  const deletePart = async (id: string) => {
    try {
      const existing = parts.find(p => p.id === id)
      await partsApi.remove(id)
      safeSet(() => setParts(prev => prev.filter(p => p.id !== id)))
      writeLog('delete', 'part', id, existing?.name || id)
      toast(`${existing?.name || id} deleted`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to delete part', 'error')
      throw err
    }
  }

  // Customers CRUD
  const addCustomer = async (c: Customer) => {
    try {
      const created = await customersApi.create(c)
      safeSet(() => setCustomers(prev => [...prev, created]))
      writeLog('create', 'customer', created.slug, created.name || created.slug)
      toast(`${created.name} added`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to add customer', 'error')
      throw err
    }
  }

  const updateCustomer = async (slug: string, u: Partial<Customer>) => {
    try {
      const updated = await customersApi.update(slug, u)
      safeSet(() => setCustomers(prev => prev.map(c => (c.slug === slug ? updated : c))))
      writeLog('update', 'customer', slug, updated.name || slug)
      toast(`${updated.name} updated`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to update customer', 'error')
      throw err
    }
  }

  const deleteCustomer = async (slug: string) => {
    try {
      const existing = customers.find(c => c.slug === slug)
      await customersApi.remove(slug)
      safeSet(() => setCustomers(prev => prev.filter(c => c.slug !== slug)))
      writeLog('delete', 'customer', slug, existing?.name || slug)
      toast(`${existing?.name || slug} deleted`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to delete customer', 'error')
      throw err
    }
  }

  // Categories CRUD
  const addCategory = async (c: Category) => {
    try {
      const created = await categoriesApi.create(c)
      safeSet(() => setCategories(prev => [...prev, created]))
      writeLog('create', 'category', created.id, created.name || created.id)
      toast(`${created.name} added`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to add category', 'error')
      throw err
    }
  }

  const updateCategory = async (id: string, u: Partial<Category>) => {
    try {
      const updated = await categoriesApi.update(id, u)
      safeSet(() => setCategories(prev => prev.map(c => (c.id === id ? updated : c))))
      writeLog('update', 'category', id, updated.name || id)
      toast(`${updated.name} updated`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to update category', 'error')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const existing = categories.find(c => c.id === id)
      await categoriesApi.remove(id)
      safeSet(() => setCategories(prev => prev.filter(c => c.id !== id)))
      writeLog('delete', 'category', id, existing?.name || id)
      toast(`${existing?.name || id} deleted`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to delete category', 'error')
      throw err
    }
  }

  // Gallery CRUD
  const addGalleryAlbum = async (a: GalleryAlbum) => {
    try {
      const created = await galleryApi.create(a)
      safeSet(() => setGalleryAlbums(prev => [...prev, created]))
      writeLog('create', 'gallery', created.slug, created.title || created.slug)
      toast(`${created.title} added`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to add album', 'error')
      throw err
    }
  }

  const updateGalleryAlbum = async (slug: string, u: Partial<GalleryAlbum>) => {
    try {
      const updated = await galleryApi.update(slug, u)
      safeSet(() => setGalleryAlbums(prev => prev.map(a => (a.slug === slug ? updated : a))))
      writeLog('update', 'gallery', slug, updated.title || slug)
      toast(`${updated.title} updated`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to update album', 'error')
      throw err
    }
  }

  const deleteGalleryAlbum = async (slug: string) => {
    try {
      const existing = galleryAlbums.find(a => a.slug === slug)
      await galleryApi.remove(slug)
      safeSet(() => setGalleryAlbums(prev => prev.filter(a => a.slug !== slug)))
      writeLog('delete', 'gallery', slug, existing?.title || slug)
      toast(`${existing?.title || slug} deleted`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to delete album', 'error')
      throw err
    }
  }

  // Helpers
  const getProductBySlug = (s: string) => products.find(p => p.slug === s)
  const getPartsByProduct = (s: string) => parts.filter(p => p.productSlug === s)
  const getProductsByCategory = (id: string) => products.filter(p => p.categoryId === id)
  const featuredProducts = sortProductsForDisplay(products.filter(p => p.featured))
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
