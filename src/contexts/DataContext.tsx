import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Customer } from '../data/customers'
import { DEFAULT_CATEGORIES, DEFAULT_CUSTOMERS, DEFAULT_PARTS, DEFAULT_PRODUCTS } from '../data/defaults'
import type { GalleryAlbum } from '../data/gallery'
import type { Category, Product, ProductPart } from '../data/products/types'
import { useSession } from './SessionContext'
import { useToast } from './ToastContext'
import { useUser } from './UserContext'
import { isSupabaseConfigured } from '../lib/supabase'
import * as categoriesApi from '../services/categories.service'
import * as customersApi from '../services/customers.service'
import * as galleryApi from '../services/gallery.service'
import * as logsApi from '../services/logs.service'
import * as partsApi from '../services/parts.service'
import * as productsApi from '../services/products.service'
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

type DataSnapshot = {
  products: Product[]
  parts: ProductPart[]
  customers: Customer[]
  categories: Category[]
  galleryAlbums: GalleryAlbum[]
}

type CachedDataSnapshot = DataSnapshot & {
  savedAt: number
  version: 1
}

const Ctx = createContext<DataCtx>({} as DataCtx)

const CACHE_KEY = 'eventies:data-cache:v1'
const CACHE_VERSION = 1 as const
const MAX_RETRIES = 3
const RETRY_DELAY = 2000
const DEFAULT_SNAPSHOT: DataSnapshot = {
  products: sortProductsForDisplay(DEFAULT_PRODUCTS),
  parts: DEFAULT_PARTS,
  customers: DEFAULT_CUSTOMERS,
  categories: DEFAULT_CATEGORIES,
  galleryAlbums: [],
}

function readSnapshot() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CachedDataSnapshot>
    if (
      parsed.version !== CACHE_VERSION ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.parts) ||
      !Array.isArray(parsed.customers) ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.galleryAlbums)
    ) {
      return null
    }

    return {
      products: sortProductsForDisplay(parsed.products),
      parts: parsed.parts,
      customers: parsed.customers,
      categories: parsed.categories,
      galleryAlbums: parsed.galleryAlbums,
    } satisfies DataSnapshot
  } catch {
    return null
  }
}

function writeSnapshot(snapshot: DataSnapshot) {
  if (typeof window === 'undefined') return

  try {
    const payload: CachedDataSnapshot = {
      ...snapshot,
      savedAt: Date.now(),
      version: CACHE_VERSION,
    }

    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage failures so the app can keep rendering.
  }
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
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const cacheVisibleRef = useRef(false)

  const safeSet = useCallback((fn: () => void) => {
    if (mountedRef.current) fn()
  }, [])

  const applySnapshot = useCallback(
    (snapshot: DataSnapshot, nextError: string | null, nextLoading: boolean) => {
      cacheVisibleRef.current = true
      safeSet(() => {
        setProducts(snapshot.products)
        setParts(snapshot.parts)
        setCustomers(snapshot.customers)
        setCategories(snapshot.categories)
        setGalleryAlbums(snapshot.galleryAlbums)
        setError(nextError)
        setLoading(nextLoading)
      })
    },
    [safeSet]
  )

  const hydrateCache = useCallback(() => {
    const snapshot = readSnapshot()
    if (!snapshot) return false

    applySnapshot(snapshot, null, false)
    return true
  }, [applySnapshot])

  const writeLog = useCallback(
    (
      action: 'create' | 'update' | 'delete',
      entityType: string,
      entityId: string,
      entityName: string,
      details?: string
    ) => {
      if (!currentUser) return

      void logsApi
        .addLog({
          admin_id: currentUser.id,
          admin_name: currentUser.name || 'Admin',
          admin_email: currentUser.email || '',
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          details: details || '',
        })
        .catch(logError => {
          console.warn('[DataContext] Failed to write admin log:', logError)
        })
    },
    [currentUser]
  )

  const loadAllOnce = useCallback(async (): Promise<DataSnapshot> => {
    const [nextProducts, nextParts, nextCustomers, nextCategories, nextGalleryAlbums] =
      await Promise.all([
        productsApi.getAll(),
        partsApi.getAll(),
        customersApi.getAll(),
        categoriesApi.getAll(),
        galleryApi.getAll().catch(() => []),
      ])

    return {
      products: sortProductsForDisplay(nextProducts),
      parts: nextParts,
      customers: nextCustomers,
      categories: nextCategories,
      galleryAlbums: nextGalleryAlbums,
    }
  }, [])

  const loadData = useCallback(
    async (background = false) => {
      if (sessionLoading) return

      const keepVisibleContent = background || cacheVisibleRef.current

      if (!keepVisibleContent) {
        safeSet(() => {
          setLoading(true)
          setError(null)
        })
      }

      if (!isSupabaseConfigured()) {
        retryCount.current = 0
        applySnapshot(DEFAULT_SNAPSHOT, null, false)
        return
      }

      try {
        const snapshot = await loadAllOnce()
        retryCount.current = 0
        applySnapshot(snapshot, null, false)
      } catch (loadError: any) {
        console.error('Failed to load data from Supabase:', loadError)

        if (!keepVisibleContent) {
          safeSet(() => setError(loadError?.message || 'Failed to load data'))
        }

        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1
          const delay = RETRY_DELAY * retryCount.current

          if (retryTimer.current) clearTimeout(retryTimer.current)
          retryTimer.current = setTimeout(() => {
            void loadData(background || cacheVisibleRef.current)
          }, delay)

          return
        }

        retryCount.current = 0

        if (keepVisibleContent) {
          safeSet(() => setLoading(false))
          return
        }

        applySnapshot(DEFAULT_SNAPSHOT, 'Supabase unavailable. Showing default content.', false)
      }
    },
    [applySnapshot, loadAllOnce, safeSet, sessionLoading]
  )

  const refreshAll = useCallback(async () => {
    await loadData(cacheVisibleRef.current)
  }, [loadData])

  useEffect(() => {
    mountedRef.current = true
    const hasCache = hydrateCache()
    void loadData(hasCache)

    return () => {
      mountedRef.current = false
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [hydrateCache, loadData])

  useEffect(() => {
    if (loading) return
    if (
      !products.length &&
      !parts.length &&
      !customers.length &&
      !categories.length &&
      !galleryAlbums.length
    ) {
      return
    }

    if (snapshotTimer.current) clearTimeout(snapshotTimer.current)
    snapshotTimer.current = setTimeout(() => {
      writeSnapshot({ products, parts, customers, categories, galleryAlbums })
      snapshotTimer.current = null
    }, 1500)
  }, [categories, customers, galleryAlbums, loading, parts, products])

  const addProduct = useCallback(
    async (product: Product) => {
      try {
        const created = await productsApi.create(product)
        safeSet(() => setProducts(prev => sortProductsForDisplay([...prev, created])))
        writeLog('create', 'product', created.slug, created.name || created.slug)
        toast(`${created.name} added`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to add product', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateProduct = useCallback(
    async (slug: string, updates: Partial<Product>) => {
      try {
        const updated = await productsApi.update(slug, updates)
        safeSet(() =>
          setProducts(prev =>
            sortProductsForDisplay(prev.map(product => (product.slug === slug ? updated : product)))
          )
        )
        writeLog('update', 'product', slug, updated.name || slug)
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to update product', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const deleteProduct = useCallback(
    async (slug: string) => {
      try {
        const existing = products.find(product => product.slug === slug)
        await productsApi.remove(slug)
        safeSet(() => {
          setProducts(prev => prev.filter(product => product.slug !== slug))
          setParts(prev => prev.filter(part => part.productSlug !== slug))
        })
        writeLog('delete', 'product', slug, existing?.name || slug)
        toast(`${existing?.name || slug} deleted`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to delete product', 'error')
        throw actionError
      }
    },
    [products, safeSet, toast, writeLog]
  )

  const addPart = useCallback(
    async (part: ProductPart) => {
      try {
        const created = await partsApi.create(part)
        safeSet(() => setParts(prev => [...prev, created]))
        writeLog('create', 'part', created.id, created.name || created.id)
        toast(`${created.name} added`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to add part', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updatePart = useCallback(
    async (id: string, updates: Partial<ProductPart>) => {
      try {
        const updated = await partsApi.update(id, updates)
        safeSet(() => setParts(prev => prev.map(part => (part.id === id ? updated : part))))
        writeLog('update', 'part', id, updated.name || id)
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to update part', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const deletePart = useCallback(
    async (id: string) => {
      try {
        const existing = parts.find(part => part.id === id)
        await partsApi.remove(id)
        safeSet(() => setParts(prev => prev.filter(part => part.id !== id)))
        writeLog('delete', 'part', id, existing?.name || id)
        toast(`${existing?.name || id} deleted`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to delete part', 'error')
        throw actionError
      }
    },
    [parts, safeSet, toast, writeLog]
  )

  const addCustomer = useCallback(
    async (customer: Customer) => {
      try {
        const created = await customersApi.create(customer)
        safeSet(() => setCustomers(prev => [...prev, created]))
        writeLog('create', 'customer', created.slug, created.name || created.slug)
        toast(`${created.name} added`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to add customer', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCustomer = useCallback(
    async (slug: string, updates: Partial<Customer>) => {
      try {
        const updated = await customersApi.update(slug, updates)
        safeSet(() =>
          setCustomers(prev =>
            prev.map(customer => (customer.slug === slug ? updated : customer))
          )
        )
        writeLog('update', 'customer', slug, updated.name || slug)
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to update customer', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const deleteCustomer = useCallback(
    async (slug: string) => {
      try {
        const existing = customers.find(customer => customer.slug === slug)
        await customersApi.remove(slug)
        safeSet(() => setCustomers(prev => prev.filter(customer => customer.slug !== slug)))
        writeLog('delete', 'customer', slug, existing?.name || slug)
        toast(`${existing?.name || slug} deleted`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to delete customer', 'error')
        throw actionError
      }
    },
    [customers, safeSet, toast, writeLog]
  )

  const addCategory = useCallback(
    async (category: Category) => {
      try {
        const created = await categoriesApi.create(category)
        safeSet(() => setCategories(prev => [...prev, created]))
        writeLog('create', 'category', created.id, created.name || created.id)
        toast(`${created.name} added`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to add category', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      try {
        const updated = await categoriesApi.update(id, updates)
        safeSet(() =>
          setCategories(prev =>
            prev.map(category => (category.id === id ? updated : category))
          )
        )
        writeLog('update', 'category', id, updated.name || id)
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to update category', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        const existing = categories.find(category => category.id === id)
        await categoriesApi.remove(id)
        safeSet(() => setCategories(prev => prev.filter(category => category.id !== id)))
        writeLog('delete', 'category', id, existing?.name || id)
        toast(`${existing?.name || id} deleted`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to delete category', 'error')
        throw actionError
      }
    },
    [categories, safeSet, toast, writeLog]
  )

  const addGalleryAlbum = useCallback(
    async (album: GalleryAlbum) => {
      try {
        const created = await galleryApi.create(album)
        safeSet(() => setGalleryAlbums(prev => [...prev, created]))
        writeLog('create', 'gallery', created.slug, created.title || created.slug)
        toast(`${created.title} added`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to add album', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateGalleryAlbum = useCallback(
    async (slug: string, updates: Partial<GalleryAlbum>) => {
      try {
        const updated = await galleryApi.update(slug, updates)
        safeSet(() =>
          setGalleryAlbums(prev =>
            prev.map(album => (album.slug === slug ? updated : album))
          )
        )
        writeLog('update', 'gallery', slug, updated.title || slug)
        toast(`${updated.title} updated`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to update album', 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const deleteGalleryAlbum = useCallback(
    async (slug: string) => {
      try {
        const existing = galleryAlbums.find(album => album.slug === slug)
        await galleryApi.remove(slug)
        safeSet(() => setGalleryAlbums(prev => prev.filter(album => album.slug !== slug)))
        writeLog('delete', 'gallery', slug, existing?.title || slug)
        toast(`${existing?.title || slug} deleted`, 'success')
      } catch (actionError: any) {
        toast(actionError?.message || 'Failed to delete album', 'error')
        throw actionError
      }
    },
    [galleryAlbums, safeSet, toast, writeLog]
  )

  const getProductBySlug = useCallback(
    (slug: string) => products.find(product => product.slug === slug),
    [products]
  )

  const getPartsByProduct = useCallback(
    (slug: string) => parts.filter(part => part.productSlug === slug),
    [parts]
  )

  const getProductsByCategory = useCallback(
    (id: string) => products.filter(product => product.categoryId === id),
    [products]
  )

  const featuredProducts = useMemo(
    () => sortProductsForDisplay(products.filter(product => product.featured)),
    [products]
  )

  const allCategoryTags = useMemo(
    () => Array.from(new Set(products.flatMap(product => product.categoryTags || []))),
    [products]
  )

  const resetToDefaults = useCallback(() => {
    retryCount.current = 0
    applySnapshot(DEFAULT_SNAPSHOT, null, false)
  }, [applySnapshot])

  const value = useMemo(
    () => ({
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
    }),
    [
      addCategory,
      addCustomer,
      addGalleryAlbum,
      addPart,
      addProduct,
      allCategoryTags,
      categories,
      customers,
      deleteCategory,
      deleteCustomer,
      deleteGalleryAlbum,
      deletePart,
      deleteProduct,
      error,
      featuredProducts,
      galleryAlbums,
      getPartsByProduct,
      getProductBySlug,
      getProductsByCategory,
      loading,
      parts,
      products,
      refreshAll,
      resetToDefaults,
      updateCategory,
      updateCustomer,
      updateGalleryAlbum,
      updatePart,
      updateProduct,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
