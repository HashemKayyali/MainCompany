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
import type { CustomBuild, CustomBuildCategory } from '../data/custom-builds'
import { DEFAULT_CUSTOM_BUILD_CATEGORIES, DEFAULT_CUSTOM_BUILDS } from '../data/custom-builds'
import { DEFAULT_CATEGORIES, DEFAULT_CUSTOMERS, DEFAULT_PARTS, DEFAULT_PRODUCTS } from '../data/defaults'
import type { GalleryAlbum } from '../data/gallery'
import type { Category, Product, ProductPart } from '../data/products/types'
import { useSession } from './SessionContext'
import { useToast } from './ToastContext'
import { useUser } from './UserContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import * as categoriesApi from '../services/categories.service'
import * as customBuildsApi from '../services/custom-builds.service'
import * as customersApi from '../services/customers.service'
import * as galleryApi from '../services/gallery.service'
import * as logsApi from '../services/logs.service'
import * as partsApi from '../services/parts.service'
import * as productsApi from '../services/products.service'
import { sortProductsForDisplay } from '../utils/product-order'
import { diffEntities, summarizeChanges, summarizeCreate, summarizeDelete } from '../utils/entity-diff'

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

  customBuilds: CustomBuild[]
  customBuildCategories: CustomBuildCategory[]
  addCustomBuild: (b: CustomBuild) => Promise<void>
  updateCustomBuild: (id: string, b: Partial<CustomBuild>) => Promise<void>
  deleteCustomBuild: (id: string) => Promise<void>
  addCustomBuildCategory: (c: CustomBuildCategory) => Promise<void>
  updateCustomBuildCategory: (id: string, c: Partial<CustomBuildCategory>) => Promise<void>
  deleteCustomBuildCategory: (id: string) => Promise<void>

  getProductBySlug: (s: string) => Product | undefined
  getPartsByProduct: (s: string) => ProductPart[]
  getProductsByCategory: (id: string) => Product[]
  featuredProducts: Product[]
  allCategoryTags: string[]

  refreshAll: () => Promise<void>
  resetToDefaults: () => void
}

type ProductDataCtx = Pick<
  DataCtx,
  'products' | 'getProductBySlug' | 'getProductsByCategory' | 'featuredProducts' | 'allCategoryTags'
>

// partsLoading lets ProductDetails distinguish "parts still loading" from
// "product genuinely has no parts" now that parts are lazy (batch 2).
type PartDataCtx = Pick<DataCtx, 'parts' | 'getPartsByProduct'> & { partsLoading: boolean }
// customersLoading lets lazy consumers (e.g. the search dialog) avoid
// rendering a premature "no customer results" state while customers load.
type CustomerDataCtx = Pick<DataCtx, 'customers'> & { customersLoading: boolean }
type CategoryDataCtx = Pick<DataCtx, 'categories'>
type GalleryDataCtx = Pick<DataCtx, 'galleryAlbums'> & { galleryLoading: boolean }
type CustomBuildDataCtx = Pick<DataCtx, 'customBuilds' | 'customBuildCategories'>
type DataMetaCtx = Pick<DataCtx, 'loading' | 'error' | 'refreshAll' | 'resetToDefaults'>
type DataActionsCtx = Pick<
  DataCtx,
  | 'addProduct'
  | 'updateProduct'
  | 'deleteProduct'
  | 'addPart'
  | 'updatePart'
  | 'deletePart'
  | 'addCustomer'
  | 'updateCustomer'
  | 'deleteCustomer'
  | 'addCategory'
  | 'updateCategory'
  | 'deleteCategory'
  | 'addGalleryAlbum'
  | 'updateGalleryAlbum'
  | 'deleteGalleryAlbum'
  | 'addCustomBuild'
  | 'updateCustomBuild'
  | 'deleteCustomBuild'
  | 'addCustomBuildCategory'
  | 'updateCustomBuildCategory'
  | 'deleteCustomBuildCategory'
>

type DataSnapshot = {
  products: Product[]
  parts: ProductPart[]
  customers: Customer[]
  categories: Category[]
  galleryAlbums: GalleryAlbum[]
  customBuilds: CustomBuild[]
  customBuildCategories: CustomBuildCategory[]
}

const Ctx = createContext<DataCtx>({} as DataCtx)
const ProductsCtx = createContext<ProductDataCtx>({} as ProductDataCtx)
const PartsCtx = createContext<PartDataCtx>({} as PartDataCtx)
const CustomersCtx = createContext<CustomerDataCtx>({} as CustomerDataCtx)
const CategoriesCtx = createContext<CategoryDataCtx>({} as CategoryDataCtx)
const GalleryCtx = createContext<GalleryDataCtx>({} as GalleryDataCtx)
const CustomBuildsCtx = createContext<CustomBuildDataCtx>({} as CustomBuildDataCtx)
const DataMetaCtx = createContext<DataMetaCtx>({} as DataMetaCtx)
const DataActionsCtx = createContext<DataActionsCtx>({} as DataActionsCtx)

// Resource-level lazy loading (Batch 1). Each key is loaded independently and
// only when a consumer actually needs it. `ensureResource` (exposed through
// EnsureCtx) loads a resource at most once per session; the split hooks below
// call it on mount, so a page only pays for the tables it renders.
const RESOURCE_KEYS = ['products', 'categories', 'customers', 'gallery', 'parts', 'customBuilds'] as const
type ResourceKey = (typeof RESOURCE_KEYS)[number]

type CachedDataSnapshot = DataSnapshot & {
  savedAt: number
  version: 6
  validResources: ResourceKey[]
  resourceSavedAt: Partial<Record<ResourceKey, number>>
}
// Loaded eagerly at app mount because the global Navbar mega-menu, Footer
// and ProductCard need them on every route.
const EAGER_RESOURCES: ResourceKey[] = ['products', 'categories']

const EnsureCtx = createContext<(key: ResourceKey) => Promise<void>>(async () => {})

const CACHE_KEY = 'eventies:data-cache:v6'
const LEGACY_CACHE_KEYS = ['eventies:data-cache:v5'] as const
const CACHE_VERSION = 6 as const
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 750
const DEMO_DEFAULTS_ENABLED = import.meta.env.DEV && !isSupabaseConfigured()

const EMPTY_SNAPSHOT: DataSnapshot = {
  products: [],
  parts: [],
  customers: [],
  categories: [],
  galleryAlbums: [],
  customBuilds: [],
  customBuildCategories: [],
}

const DEFAULT_SNAPSHOT: DataSnapshot = {
  products: sortProductsForDisplay(DEFAULT_PRODUCTS),
  parts: DEFAULT_PARTS,
  customers: DEFAULT_CUSTOMERS,
  categories: DEFAULT_CATEGORIES,
  galleryAlbums: [],
  customBuilds: DEFAULT_CUSTOM_BUILDS,
  customBuildCategories: DEFAULT_CUSTOM_BUILD_CATEGORIES,
}

// One fetcher per resource. Each returns only the snapshot slice it owns, so a
// resource load never touches unrelated state. Errors intentionally propagate
// to loadResource so retry/backoff and later-session recovery remain effective.
const RESOURCE_LOADERS: Record<ResourceKey, () => Promise<Partial<DataSnapshot>>> = {
  products: async () => ({ products: sortProductsForDisplay(await productsApi.getAll()) }),
  categories: async () => ({ categories: await categoriesApi.getAll() }),
  customers: async () => ({ customers: await customersApi.getAll() }),
  gallery: async () => ({ galleryAlbums: await galleryApi.getAll() }),
  parts: async () => ({ parts: await partsApi.getAll() }),
  customBuilds: async () => {
    const [builds, buildCategories] = await Promise.all([
      customBuildsApi.getAll(),
      customBuildsApi.getCategories(),
    ])
    return { customBuilds: builds, customBuildCategories: buildCategories }
  },
}

function removeStorageKey(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage failures; cache cleanup must never break rendering.
  }
}

function clearSnapshotCache() {
  removeStorageKey(CACHE_KEY)
  LEGACY_CACHE_KEYS.forEach(removeStorageKey)
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined

  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    httpStatus?: unknown
    code?: unknown
  }

  for (const value of [candidate.status, candidate.statusCode, candidate.httpStatus, candidate.code]) {
    const numeric = typeof value === 'number' ? value : Number(value)
    if (Number.isInteger(numeric) && numeric >= 100 && numeric <= 599) return numeric
  }

  return undefined
}

function isRetryableLoadError(error: unknown) {
  const status = getErrorStatus(error)
  if (status !== undefined) {
    return status === 408 || status === 425 || status === 429 || status >= 500
  }

  const message = getErrorMessage(error, '').toLowerCase()
  if (!message) return error instanceof TypeError

  return (
    error instanceof TypeError ||
    /failed to fetch|fetch failed|network error|network request failed|timeout|timed out|connection reset|connection refused|temporarily unavailable|service unavailable|bad gateway|gateway timeout|internal server error/.test(
      message
    )
  )
}

function getRetryDelay(attempt: number) {
  return RETRY_BASE_DELAY_MS * 2 ** attempt
}

function readSnapshot(): {
  snapshot: DataSnapshot
  validResources: Set<ResourceKey>
  resourceSavedAt: Partial<Record<ResourceKey, number>>
} | null {
  if (typeof window === 'undefined') return null

  LEGACY_CACHE_KEYS.forEach(removeStorageKey)

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CachedDataSnapshot>
    const rawResourceSavedAt =
      typeof parsed.resourceSavedAt === 'object' && parsed.resourceSavedAt !== null
        ? parsed.resourceSavedAt
        : {}
    const now = Date.now()
    const resourceSavedAt: Partial<Record<ResourceKey, number>> = {}
    const validResources = Array.isArray(parsed.validResources)
      ? parsed.validResources.filter((key): key is ResourceKey => {
          if (!RESOURCE_KEYS.includes(key as ResourceKey)) return false
          const savedAt = Number(rawResourceSavedAt[key as ResourceKey])
          const age = now - savedAt
          if (!Number.isFinite(savedAt) || age < 0 || age > CACHE_TTL_MS) return false
          resourceSavedAt[key as ResourceKey] = savedAt
          return true
        })
      : []

    if (
      parsed.version !== CACHE_VERSION ||
      !Number.isFinite(Number(parsed.savedAt)) ||
      validResources.length === 0 ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.parts) ||
      !Array.isArray(parsed.customers) ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.galleryAlbums) ||
      !Array.isArray(parsed.customBuilds) ||
      !Array.isArray(parsed.customBuildCategories)
    ) {
      removeStorageKey(CACHE_KEY)
      return null
    }

    const validSet = new Set(validResources)
    return {
      snapshot: {
        products: validSet.has('products') ? sortProductsForDisplay(parsed.products) : [],
        parts: validSet.has('parts') ? parsed.parts : [],
        customers: validSet.has('customers') ? parsed.customers : [],
        categories: validSet.has('categories') ? parsed.categories : [],
        galleryAlbums: validSet.has('gallery') ? parsed.galleryAlbums : [],
        customBuilds: validSet.has('customBuilds') ? parsed.customBuilds : [],
        customBuildCategories: validSet.has('customBuilds') ? parsed.customBuildCategories : [],
      },
      validResources: validSet,
      resourceSavedAt,
    }
  } catch {
    removeStorageKey(CACHE_KEY)
    return null
  }
}

function writeSnapshot(
  snapshot: DataSnapshot,
  resourceSavedAt: Readonly<Partial<Record<ResourceKey, number>>>
) {
  if (typeof window === 'undefined') return

  const now = Date.now()
  const freshResourceSavedAt: Partial<Record<ResourceKey, number>> = {}
  const cacheableResources = RESOURCE_KEYS.filter(key => {
    const savedAt = Number(resourceSavedAt[key])
    const age = now - savedAt
    if (!Number.isFinite(savedAt) || age < 0 || age > CACHE_TTL_MS) return false
    freshResourceSavedAt[key] = savedAt
    return true
  })

  if (cacheableResources.length === 0) {
    removeStorageKey(CACHE_KEY)
    return
  }

  try {
    const payload: CachedDataSnapshot = {
      ...snapshot,
      savedAt: now,
      version: CACHE_VERSION,
      validResources: cacheableResources,
      resourceSavedAt: freshResourceSavedAt,
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
  const [customBuilds, setCustomBuilds] = useState<CustomBuild[]>([])
  const [customBuildCategories, setCustomBuildCategories] = useState<CustomBuildCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Resources that have finished loading for the current UI session. A failed
  // request is marked finished so lazy consumers can render an empty/error state
  // instead of spinning forever; only successful network data or trusted cache
  // is eligible for persistence.
  const [loadedResources, setLoadedResources] = useState<ReadonlySet<ResourceKey>>(new Set())

  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotIdleHandle = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const validResourcesRef = useRef<Set<ResourceKey>>(new Set())
  const resourceSavedAtRef = useRef<Partial<Record<ResourceKey, number>>>({})
  // Per-resource load bookkeeping: which resources have been requested this
  // session, and the in-flight promise for each (so concurrent callers and
  // React StrictMode double-invokes share one request instead of racing).
  const requestedRef = useRef<Set<ResourceKey>>(new Set())
  const inFlightRef = useRef<Map<ResourceKey, Promise<void>>>(new Map())

  const safeSet = useCallback((fn: () => void) => {
    if (mountedRef.current) fn()
  }, [])

  const applySnapshot = useCallback(
    (snapshot: DataSnapshot, nextError: string | null, nextLoading: boolean) => {
      safeSet(() => {
        setProducts(snapshot.products)
        setParts(snapshot.parts)
        setCustomers(snapshot.customers)
        setCategories(snapshot.categories)
        setGalleryAlbums(snapshot.galleryAlbums)
        setCustomBuilds(snapshot.customBuilds)
        setCustomBuildCategories(snapshot.customBuildCategories)
        setError(nextError)
        setLoading(nextLoading)
      })
    },
    [safeSet]
  )

  const markLoaded = useCallback(
    (keys: ResourceKey[]) => {
      if (!keys.length) return
      safeSet(() =>
        setLoadedResources(prev => {
          if (keys.every(key => prev.has(key))) return prev
          const next = new Set(prev)
          keys.forEach(key => next.add(key))
          return next
        })
      )
    },
    [safeSet]
  )

  const hydrateCache = useCallback(() => {
    const cached = readSnapshot()
    if (!cached) return new Set<ResourceKey>()

    validResourcesRef.current = new Set(cached.validResources)
    resourceSavedAtRef.current = { ...cached.resourceSavedAt }
    applySnapshot(cached.snapshot, null, false)
    markLoaded([...cached.validResources])
    return new Set(cached.validResources)
  }, [applySnapshot, markLoaded])

  const writeLog = useCallback(
    (
      action: 'create' | 'update' | 'delete',
      entityType: string,
      entityId: string,
      entityName: string,
      snapshot?: {
        before?: Record<string, unknown> | null
        after?: Record<string, unknown> | null
      }
    ) => {
      if (!currentUser) return

      let details:
        | string
        | {
            summary: string
            changes?: ReturnType<typeof diffEntities>
            before?: Record<string, unknown> | null
            after?: Record<string, unknown> | null
          }
        = ''

      if (snapshot) {
        if (action === 'create') {
          const { changes, summary } = summarizeCreate(snapshot.after)
          details = { summary, changes, before: null, after: snapshot.after }
        } else if (action === 'delete') {
          const { changes, summary } = summarizeDelete(snapshot.before)
          details = { summary, changes, before: snapshot.before, after: null }
        } else {
          const changes = diffEntities(snapshot.before, snapshot.after)
          details = {
            summary: summarizeChanges(changes),
            changes,
            before: snapshot.before,
            after: snapshot.after,
          }
        }
      }

      void logsApi
        .addLog({
          admin_id: currentUser.id,
          admin_name: currentUser.name || 'Admin',
          admin_email: currentUser.email || '',
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          details,
        })
        .catch(logError => {
          console.warn('[DataContext] Failed to write admin log:', logError)
        })
    },
    [currentUser]
  )

  const applyResourcePart = useCallback(
    (part: Partial<DataSnapshot>) => {
      safeSet(() => {
        if (part.products) setProducts(part.products)
        if (part.parts) setParts(part.parts)
        if (part.customers) setCustomers(part.customers)
        if (part.categories) setCategories(part.categories)
        if (part.galleryAlbums) setGalleryAlbums(part.galleryAlbums)
        if (part.customBuilds) setCustomBuilds(part.customBuilds)
        if (part.customBuildCategories) setCustomBuildCategories(part.customBuildCategories)
      })
    },
    [safeSet]
  )

  // Fetch one resource independently. Only transient failures are retried;
  // permanent responses such as 401/403/402 fail immediately instead of causing
  // long request storms. On failure we keep trusted cache already on screen, or
  // leave the slice empty when no cache exists — demo defaults are never injected
  // into a configured production app.
  const loadResource = useCallback(
    (key: ResourceKey): Promise<void> => {
      const existing = inFlightRef.current.get(key)
      if (existing) return existing

      const run = (async () => {
        for (let attempt = 0; ; attempt += 1) {
          try {
            const part = await RESOURCE_LOADERS[key]()
            applyResourcePart(part)
            validResourcesRef.current.add(key)
            resourceSavedAtRef.current[key] = Date.now()
            markLoaded([key])
            return
          } catch (loadError: unknown) {
            const shouldRetry = attempt < MAX_RETRIES && isRetryableLoadError(loadError)
            if (shouldRetry) {
              await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)))
              if (!mountedRef.current) return
              continue
            }

            console.error(`Failed to load "${key}" from Supabase:`, loadError)
            markLoaded([key])
            requestedRef.current.delete(key)
            throw loadError
          }
        }
      })().finally(() => {
        inFlightRef.current.delete(key)
      })

      inFlightRef.current.set(key, run)
      return run
    },
    [applyResourcePart, markLoaded]
  )

  // Public entry point: load a resource at most once after a successful load
  // (revalidation still happens once when hydrated from cache — SWR). A final
  // network failure clears the request mark so a later visit can retry. Never throws.
  const ensureResource = useCallback(
    (key: ResourceKey): Promise<void> => {
      if (requestedRef.current.has(key)) {
        return inFlightRef.current.get(key) ?? Promise.resolve()
      }
      requestedRef.current.add(key)
      return loadResource(key).catch(() => {})
    },
    [loadResource]
  )

  // refreshAll re-fetches every resource (used by admin screens). Forces a
  // fresh load rather than honoring the once-per-session guard.
  const refreshAll = useCallback(async () => {
    RESOURCE_KEYS.forEach(key => requestedRef.current.add(key))
    await Promise.all(RESOURCE_KEYS.map(key => loadResource(key).catch(() => {})))
  }, [loadResource])

  useEffect(() => {
    mountedRef.current = true
    const cachedResources = hydrateCache()

    if (!isSupabaseConfigured()) {
      applySnapshot(
        DEMO_DEFAULTS_ENABLED ? DEFAULT_SNAPSHOT : EMPTY_SNAPSHOT,
        DEMO_DEFAULTS_ENABLED ? null : 'Live data service is not configured.',
        false
      )
      markLoaded([...RESOURCE_KEYS])
      return () => {
        mountedRef.current = false
      }
    }

    if (sessionLoading) return

    // Only products + categories load at mount; everything else is pulled in
    // lazily by the split hooks when a page that needs it renders. Cached live
    // data is displayed immediately and then revalidated in the background.
    const hasCompleteEagerCache = EAGER_RESOURCES.every(key => cachedResources.has(key))
    if (!hasCompleteEagerCache) {
      safeSet(() => {
        setLoading(true)
        setError(null)
      })
    }

    EAGER_RESOURCES.forEach(key => requestedRef.current.add(key))
    void Promise.allSettled(EAGER_RESOURCES.map(key => loadResource(key))).then(results => {
      const missingResources = results.flatMap((result, index) =>
        result.status === 'rejected' && !cachedResources.has(EAGER_RESOURCES[index])
          ? [EAGER_RESOURCES[index]]
          : []
      )

      safeSet(() => {
        setLoading(false)
        setError(
          missingResources.length > 0
            ? 'Unable to load live data right now. Please try again shortly.'
            : null
        )
      })
    })

    return () => {
      mountedRef.current = false
    }
  }, [applySnapshot, hydrateCache, loadResource, markLoaded, safeSet, sessionLoading])

  useEffect(() => {
    if (loading || !isSupabaseConfigured()) return

    const resourceSavedAt = { ...resourceSavedAtRef.current }
    if (Object.keys(resourceSavedAt).length === 0) return

    if (snapshotTimer.current) clearTimeout(snapshotTimer.current)

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (snapshotIdleHandle.current !== null) {
      idleWindow.cancelIdleCallback?.(snapshotIdleHandle.current)
      snapshotIdleHandle.current = null
    }

    const snapshot = {
      products,
      parts,
      customers,
      categories,
      galleryAlbums,
      customBuilds,
      customBuildCategories,
    }

    snapshotTimer.current = setTimeout(() => {
      snapshotTimer.current = null

      const persist = () => {
        writeSnapshot(snapshot, resourceSavedAt)
        snapshotIdleHandle.current = null
      }

      if (idleWindow.requestIdleCallback) {
        snapshotIdleHandle.current = idleWindow.requestIdleCallback(persist, { timeout: 3000 })
      } else {
        persist()
      }
    }, 1500)

    return () => {
      if (snapshotTimer.current) {
        clearTimeout(snapshotTimer.current)
        snapshotTimer.current = null
      }
      if (snapshotIdleHandle.current !== null) {
        idleWindow.cancelIdleCallback?.(snapshotIdleHandle.current)
        snapshotIdleHandle.current = null
      }
    }
  }, [
    categories,
    customBuildCategories,
    customBuilds,
    customers,
    galleryAlbums,
    loadedResources,
    loading,
    parts,
    products,
  ])

  const addProduct = useCallback(
    async (product: Product) => {
      try {
        const created = await productsApi.create(product)
        safeSet(() => setProducts(prev => sortProductsForDisplay([...prev, created])))
        writeLog('create', 'product', created.slug, created.name || created.slug, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.name} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add product'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateProduct = useCallback(
    async (slug: string, updates: Partial<Product>) => {
      try {
        const previous = products.find(product => product.slug === slug)
        const updated = await productsApi.update(slug, updates)
        safeSet(() =>
          setProducts(prev =>
            sortProductsForDisplay(prev.map(product => (product.slug === slug ? updated : product)))
          )
        )
        writeLog('update', 'product', slug, updated.name || slug, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update product'), 'error')
        throw actionError
      }
    },
    [products, safeSet, toast, writeLog]
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
        writeLog('delete', 'product', slug, existing?.name || slug, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.name || slug} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete product'), 'error')
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
        writeLog('create', 'part', created.id, created.name || created.id, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.name} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add part'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updatePart = useCallback(
    async (id: string, updates: Partial<ProductPart>) => {
      try {
        const previous = parts.find(part => part.id === id)
        const updated = await partsApi.update(id, updates)
        safeSet(() => setParts(prev => prev.map(part => (part.id === id ? updated : part))))
        writeLog('update', 'part', id, updated.name || id, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update part'), 'error')
        throw actionError
      }
    },
    [parts, safeSet, toast, writeLog]
  )

  const deletePart = useCallback(
    async (id: string) => {
      try {
        const existing = parts.find(part => part.id === id)
        await partsApi.remove(id)
        safeSet(() => setParts(prev => prev.filter(part => part.id !== id)))
        writeLog('delete', 'part', id, existing?.name || id, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.name || id} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete part'), 'error')
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
        writeLog('create', 'customer', created.slug, created.name || created.slug, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.name} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add customer'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCustomer = useCallback(
    async (slug: string, updates: Partial<Customer>) => {
      try {
        const previous = customers.find(customer => customer.slug === slug)
        const updated = await customersApi.update(slug, updates)
        safeSet(() =>
          setCustomers(prev =>
            prev.map(customer => (customer.slug === slug ? updated : customer))
          )
        )
        writeLog('update', 'customer', slug, updated.name || slug, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update customer'), 'error')
        throw actionError
      }
    },
    [customers, safeSet, toast, writeLog]
  )

  const deleteCustomer = useCallback(
    async (slug: string) => {
      try {
        const existing = customers.find(customer => customer.slug === slug)
        await customersApi.remove(slug)
        safeSet(() => setCustomers(prev => prev.filter(customer => customer.slug !== slug)))
        writeLog('delete', 'customer', slug, existing?.name || slug, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.name || slug} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete customer'), 'error')
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
        writeLog('create', 'category', created.id, created.name || created.id, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.name} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add category'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      try {
        const previous = categories.find(category => category.id === id)
        const updated = await categoriesApi.update(id, updates)
        safeSet(() =>
          setCategories(prev =>
            prev.map(category => (category.id === id ? updated : category))
          )
        )
        writeLog('update', 'category', id, updated.name || id, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update category'), 'error')
        throw actionError
      }
    },
    [categories, safeSet, toast, writeLog]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        const existing = categories.find(category => category.id === id)
        await categoriesApi.remove(id)
        safeSet(() => setCategories(prev => prev.filter(category => category.id !== id)))
        writeLog('delete', 'category', id, existing?.name || id, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.name || id} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete category'), 'error')
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
        writeLog('create', 'gallery', created.slug, created.title || created.slug, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.title} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add album'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateGalleryAlbum = useCallback(
    async (slug: string, updates: Partial<GalleryAlbum>) => {
      try {
        const previous = galleryAlbums.find(album => album.slug === slug)
        const updated = await galleryApi.update(slug, updates)
        safeSet(() =>
          setGalleryAlbums(prev =>
            prev.map(album => (album.slug === slug ? updated : album))
          )
        )
        writeLog('update', 'gallery', slug, updated.title || slug, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.title} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update album'), 'error')
        throw actionError
      }
    },
    [galleryAlbums, safeSet, toast, writeLog]
  )

  const deleteGalleryAlbum = useCallback(
    async (slug: string) => {
      try {
        const existing = galleryAlbums.find(album => album.slug === slug)
        await galleryApi.remove(slug)
        safeSet(() => setGalleryAlbums(prev => prev.filter(album => album.slug !== slug)))
        writeLog('delete', 'gallery', slug, existing?.title || slug, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.title || slug} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete album'), 'error')
        throw actionError
      }
    },
    [galleryAlbums, safeSet, toast, writeLog]
  )

  const addCustomBuild = useCallback(
    async (build: CustomBuild) => {
      try {
        const created = await customBuildsApi.create(build)
        safeSet(() =>
          setCustomBuilds(prev =>
            [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          )
        )
        writeLog('create', 'custom_build', created.id || created.title, created.title, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.title} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add custom build'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCustomBuild = useCallback(
    async (id: string, updates: Partial<CustomBuild>) => {
      try {
        const previous = customBuilds.find(build => build.id === id)
        const updated = await customBuildsApi.update(id, updates)
        safeSet(() =>
          setCustomBuilds(prev =>
            prev
              .map(build => (build.id === id ? updated : build))
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          )
        )
        writeLog('update', 'custom_build', id, updated.title || id, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.title} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update custom build'), 'error')
        throw actionError
      }
    },
    [customBuilds, safeSet, toast, writeLog]
  )

  const deleteCustomBuild = useCallback(
    async (id: string) => {
      try {
        const existing = customBuilds.find(build => build.id === id)
        await customBuildsApi.remove(id)
        safeSet(() => setCustomBuilds(prev => prev.filter(build => build.id !== id)))
        writeLog('delete', 'custom_build', id, existing?.title || id, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.title || 'Custom build'} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete custom build'), 'error')
        throw actionError
      }
    },
    [customBuilds, safeSet, toast, writeLog]
  )

  const addCustomBuildCategory = useCallback(
    async (category: CustomBuildCategory) => {
      try {
        const created = await customBuildsApi.createCategory(category)
        safeSet(() =>
          setCustomBuildCategories(prev =>
            [...prev, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          )
        )
        writeLog('create', 'custom_build_category', created.id || created.name, created.name, {
          after: created as unknown as Record<string, unknown>,
        })
        toast(`${created.name} added`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to add custom build category'), 'error')
        throw actionError
      }
    },
    [safeSet, toast, writeLog]
  )

  const updateCustomBuildCategory = useCallback(
    async (id: string, updates: Partial<CustomBuildCategory>) => {
      try {
        const previous = customBuildCategories.find(category => category.id === id)
        const updated = await customBuildsApi.updateCategory(id, updates)
        safeSet(() =>
          setCustomBuildCategories(prev =>
            prev
              .map(category => (category.id === id ? updated : category))
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          )
        )
        writeLog('update', 'custom_build_category', id, updated.name || id, {
          before: previous as unknown as Record<string, unknown>,
          after: updated as unknown as Record<string, unknown>,
        })
        toast(`${updated.name} updated`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to update custom build category'), 'error')
        throw actionError
      }
    },
    [customBuildCategories, safeSet, toast, writeLog]
  )

  const deleteCustomBuildCategory = useCallback(
    async (id: string) => {
      try {
        const existing = customBuildCategories.find(category => category.id === id)
        await customBuildsApi.removeCategory(id)
        safeSet(() => setCustomBuildCategories(prev => prev.filter(category => category.id !== id)))
        writeLog('delete', 'custom_build_category', id, existing?.name || id, {
          before: existing as unknown as Record<string, unknown>,
        })
        toast(`${existing?.name || 'Custom build category'} deleted`, 'success')
      } catch (actionError: unknown) {
        toast(getErrorMessage(actionError, 'Failed to delete custom build category'), 'error')
        throw actionError
      }
    },
    [customBuildCategories, safeSet, toast, writeLog]
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
    clearSnapshotCache()
    validResourcesRef.current.clear()
    resourceSavedAtRef.current = {}
    requestedRef.current.clear()
    safeSet(() => setLoadedResources(new Set()))

    if (!isSupabaseConfigured()) {
      applySnapshot(
        DEMO_DEFAULTS_ENABLED ? DEFAULT_SNAPSHOT : EMPTY_SNAPSHOT,
        DEMO_DEFAULTS_ENABLED ? null : 'Live data service is not configured.',
        false
      )
      markLoaded([...RESOURCE_KEYS])
      return
    }

    applySnapshot(EMPTY_SNAPSHOT, null, true)
    void refreshAll().finally(() => {
      const eagerDataAvailable = EAGER_RESOURCES.every(key => validResourcesRef.current.has(key))
      safeSet(() => {
        setLoading(false)
        setError(
          eagerDataAvailable
            ? null
            : 'Unable to load live data right now. Please try again shortly.'
        )
      })
    })
  }, [applySnapshot, markLoaded, refreshAll, safeSet])

  const productValue = useMemo<ProductDataCtx>(
    () => ({
      products,
      getProductBySlug,
      getProductsByCategory,
      featuredProducts,
      allCategoryTags,
    }),
    [
      allCategoryTags,
      featuredProducts,
      getProductBySlug,
      getProductsByCategory,
      products,
    ]
  )

  const partValue = useMemo<PartDataCtx>(
    () => ({
      parts,
      getPartsByProduct,
      partsLoading: !loadedResources.has('parts'),
    }),
    [getPartsByProduct, loadedResources, parts]
  )

  const customerValue = useMemo<CustomerDataCtx>(
    () => ({ customers, customersLoading: !loadedResources.has('customers') }),
    [customers, loadedResources]
  )
  const categoryValue = useMemo<CategoryDataCtx>(() => ({ categories }), [categories])
  const galleryValue = useMemo<GalleryDataCtx>(
    () => ({ galleryAlbums, galleryLoading: !loadedResources.has('gallery') }),
    [galleryAlbums, loadedResources]
  )
  const customBuildValue = useMemo<CustomBuildDataCtx>(
    () => ({ customBuilds, customBuildCategories }),
    [customBuildCategories, customBuilds]
  )

  const metaValue = useMemo<DataMetaCtx>(
    () => ({
      loading,
      error,
      refreshAll,
      resetToDefaults,
    }),
    [error, loading, refreshAll, resetToDefaults]
  )

  const actionsValue = useMemo<DataActionsCtx>(
    () => ({
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
      addGalleryAlbum,
      updateGalleryAlbum,
      deleteGalleryAlbum,
      addCustomBuild,
      updateCustomBuild,
      deleteCustomBuild,
      addCustomBuildCategory,
      updateCustomBuildCategory,
      deleteCustomBuildCategory,
    }),
    [
      addCustomBuild,
      addCustomBuildCategory,
      addCategory,
      addCustomer,
      addGalleryAlbum,
      addPart,
      addProduct,
      deleteCustomBuild,
      deleteCustomBuildCategory,
      deleteCategory,
      deleteCustomer,
      deleteGalleryAlbum,
      deletePart,
      deleteProduct,
      updateCustomBuild,
      updateCustomBuildCategory,
      updateCategory,
      updateCustomer,
      updateGalleryAlbum,
      updatePart,
      updateProduct,
    ]
  )

  const value = useMemo<DataCtx>(
    () => ({
      ...productValue,
      ...partValue,
      ...customerValue,
      ...categoryValue,
      ...galleryValue,
      ...customBuildValue,
      ...metaValue,
      ...actionsValue,
    }),
    [actionsValue, categoryValue, customBuildValue, customerValue, galleryValue, metaValue, partValue, productValue]
  )

  return (
    <EnsureCtx.Provider value={ensureResource}>
      <ProductsCtx.Provider value={productValue}>
        <PartsCtx.Provider value={partValue}>
          <CustomersCtx.Provider value={customerValue}>
            <CategoriesCtx.Provider value={categoryValue}>
              <GalleryCtx.Provider value={galleryValue}>
                <CustomBuildsCtx.Provider value={customBuildValue}>
                  <DataMetaCtx.Provider value={metaValue}>
                    <DataActionsCtx.Provider value={actionsValue}>
                      <Ctx.Provider value={value}>{children}</Ctx.Provider>
                    </DataActionsCtx.Provider>
                  </DataMetaCtx.Provider>
                </CustomBuildsCtx.Provider>
              </GalleryCtx.Provider>
            </CategoriesCtx.Provider>
          </CustomersCtx.Provider>
        </PartsCtx.Provider>
      </ProductsCtx.Provider>
    </EnsureCtx.Provider>
  )
}

// Ensure one resource is loaded when a consumer that needs it mounts. Stable
// identity of ensureResource keeps this effect to a single run per key.
// `enabled` lets a consumer defer the load (e.g. a dialog that only needs the
// resource once opened); the load fires the first time enabled becomes true.
function useEnsureResource(key: ResourceKey, enabled = true) {
  const ensure = useContext(EnsureCtx)
  useEffect(() => {
    if (enabled) void ensure(key)
  }, [ensure, key, enabled])
}

// Compatibility hook: legacy consumers of the whole data bag still get every
// resource. Kept until each page is migrated to the split hooks (later batches).
export const useData = () => {
  const ensure = useContext(EnsureCtx)
  useEffect(() => {
    RESOURCE_KEYS.forEach(key => void ensure(key))
  }, [ensure])
  return useContext(Ctx)
}

export const useProductsData = () => {
  useEnsureResource('products')
  return useContext(ProductsCtx)
}
export const usePartsData = () => {
  useEnsureResource('parts')
  return useContext(PartsCtx)
}
// `enabled` defaults true (all existing callers load customers on mount). Pass
// a boolean to defer — the search dialog uses this to load customers only once
// it is opened, keeping customers off the app-startup path.
export const useCustomersData = (enabled = true) => {
  useEnsureResource('customers', enabled)
  return useContext(CustomersCtx)
}
export const useCategoriesData = () => {
  useEnsureResource('categories')
  return useContext(CategoriesCtx)
}
export const useGalleryData = (enabled = true) => {
  useEnsureResource('gallery', enabled)
  return useContext(GalleryCtx)
}
export const useCustomBuildsData = () => {
  useEnsureResource('customBuilds')
  return useContext(CustomBuildsCtx)
}
export const useDataMeta = () => useContext(DataMetaCtx)
export const useDataActions = () => useContext(DataActionsCtx)
