import type { ComponentType } from 'react'
import { lazyWithRetry } from './lazyWithRetry'

type RouteImporter<T extends ComponentType<any>> = () => Promise<{ default: T }>

function lazyRoute<T extends ComponentType<any>>(importer: RouteImporter<T>) {
  // lazyWithRetry adds: 1× retry on transient network failures, plus a
  // single full-page reload when a chunk hash no longer exists (typical
  // after a redeploy). Both are common causes of "the app didn't open
  // on first try, then worked after refresh".
  const Component = lazyWithRetry(importer as () => Promise<{ default: ComponentType<unknown> }>)
  return Object.assign(Component, { preload: importer })
}

export const routeImporters = {
  category: () => import('../pages/CategoryPage'),
  productDetails: () => import('../pages/ProductDetailsPage'),
  notFound: () => import('../pages/NotFoundPage'),
  authCallback: () => import('../pages/AuthCallback'),
  profile: () => import('../pages/ProfilePage'),
  resetPassword: () => import('../pages/ResetPasswordPage'),
  updatePassword: () => import('../pages/UpdatePasswordPage'),
  rentalCart: () => import('../pages/RentalCartPage'),
  checkout: () => import('../pages/CheckoutPage'),
  orderSummary: () => import('../pages/OrderSummaryPage'),
  purchaseQuote: () => import('../pages/PurchaseQuotePage'),
  myRequests: () => import('../pages/MyRequestsPage'),
  myRequestDetails: () => import('../pages/MyRequestDetailsPage'),
  adminLayout: () => import('../pages/admin/AdminLayout'),
  adminDashboard: () => import('../pages/admin/DashboardPage'),
  adminProducts: () => import('../pages/admin/AdminProductsPage'),
  adminParts: () => import('../pages/admin/AdminPartsPage'),
  adminCustomers: () => import('../pages/admin/AdminCustomersPage'),
  adminCategories: () => import('../pages/admin/AdminCategoriesPage'),
  adminCustomBuilds: () => import('../pages/admin/AdminCustomBuildsPage'),
  adminAdmins: () => import('../pages/admin/AdminAdminsPage'),
  adminUsers: () => import('../pages/admin/AdminUsersPage'),
  adminLogs: () => import('../pages/admin/AdminLogsPage'),
  adminGallery: () => import('../pages/admin/AdminGalleryPage'),
  adminRequests: () => import('../pages/admin/AdminRequestsPage'),
  adminRequestDetails: () => import('../pages/admin/AdminRequestDetailsPage'),
} as const

export const lazyRoutes = {
  CategoryPage: lazyRoute(routeImporters.category),
  ProductDetailsPage: lazyRoute(routeImporters.productDetails),
  NotFoundPage: lazyRoute(routeImporters.notFound),
  AuthCallback: lazyRoute(routeImporters.authCallback),
  ProfilePage: lazyRoute(routeImporters.profile),
  ResetPasswordPage: lazyRoute(routeImporters.resetPassword),
  UpdatePasswordPage: lazyRoute(routeImporters.updatePassword),
  RentalCartPage: lazyRoute(routeImporters.rentalCart),
  CheckoutPage: lazyRoute(routeImporters.checkout),
  OrderSummaryPage: lazyRoute(routeImporters.orderSummary),
  PurchaseQuotePage: lazyRoute(routeImporters.purchaseQuote),
  MyRequestsPage: lazyRoute(routeImporters.myRequests),
  MyRequestDetailsPage: lazyRoute(routeImporters.myRequestDetails),
  AdminLayout: lazyRoute(routeImporters.adminLayout),
  DashboardPage: lazyRoute(routeImporters.adminDashboard),
  AdminProductsPage: lazyRoute(routeImporters.adminProducts),
  AdminPartsPage: lazyRoute(routeImporters.adminParts),
  AdminCustomersPage: lazyRoute(routeImporters.adminCustomers),
  AdminCategoriesPage: lazyRoute(routeImporters.adminCategories),
  AdminCustomBuildsPage: lazyRoute(routeImporters.adminCustomBuilds),
  AdminAdminsPage: lazyRoute(routeImporters.adminAdmins),
  AdminUsersPage: lazyRoute(routeImporters.adminUsers),
  AdminLogsPage: lazyRoute(routeImporters.adminLogs),
  AdminGalleryPage: lazyRoute(routeImporters.adminGallery),
  AdminRequestsPage: lazyRoute(routeImporters.adminRequests),
  AdminRequestDetailsPage: lazyRoute(routeImporters.adminRequestDetails),
} as const

// Main public pages are eager in router.tsx so hero-page transitions do not wait
// for route chunks or restart the persistent hero background.
const EAGER_PUBLIC_PATHS = new Set([
  '/',
  '/products',
  '/custom-builds',
  '/categories',
  '/customers',
  '/gallery',
  '/about',
  '/contact',
])

const PUBLIC_ROUTE_PRELOADERS: Record<string, (() => Promise<unknown>) | undefined> = {
  '/profile': routeImporters.profile,
  '/rental-cart': routeImporters.rentalCart,
  '/checkout': routeImporters.checkout,
  '/purchase-quote': routeImporters.purchaseQuote,
  '/my-requests': routeImporters.myRequests,
  '/login': undefined,
  '/register': undefined,
  '/reset-password': routeImporters.resetPassword,
  '/forgot-password': routeImporters.resetPassword,
  '/update-password': routeImporters.updatePassword,
}

const PUBLIC_ROUTE_PREFIX_PRELOADERS: Array<[string, () => Promise<unknown>]> = [
  ['/products/', routeImporters.productDetails],
  ['/categories/', routeImporters.category],
  ['/order-summary/', routeImporters.orderSummary],
  ['/my-requests/', routeImporters.myRequestDetails],
]

const SECONDARY_PUBLIC_PATHS = ['/rental-cart', '/purchase-quote', '/my-requests', '/profile'] as const

const warmedPaths = new Set<string>()
let commonRoutesWarmed = false
let linkPreloadListenersInstalled = false

function normalizeRoutePath(path: string) {
  if (!path) return ''

  try {
    const url = path.startsWith('http')
      ? new URL(path)
      : new URL(path, window.location.origin)

    if (url.origin !== window.location.origin) return ''
    return url.pathname
  } catch {
    return path.split('?')[0].split('#')[0]
  }
}

function importerForPath(path: string) {
  if (EAGER_PUBLIC_PATHS.has(path)) return undefined
  return PUBLIC_ROUTE_PRELOADERS[path] ?? PUBLIC_ROUTE_PREFIX_PRELOADERS.find(([prefix]) => path.startsWith(prefix))?.[1]
}

export function preloadRoute(path: string) {
  if (typeof window === 'undefined') return

  const normalizedPath = normalizeRoutePath(path)
  const importer = importerForPath(normalizedPath)
  if (!importer || warmedPaths.has(normalizedPath)) return

  warmedPaths.add(normalizedPath)
  void importer().catch(() => {
    warmedPaths.delete(normalizedPath)
  })
}

export function preloadRoutes(paths: readonly string[]) {
  paths.forEach(preloadRoute)
}

export function warmCommonRoutes() {
  if (commonRoutesWarmed || typeof window === 'undefined') return
  commonRoutesWarmed = true

  const warmSecondary = () => preloadRoutes(SECONDARY_PUBLIC_PATHS)

  type WindowWithIdle = Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
  const w = window as WindowWithIdle
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => warmSecondary(), { timeout: 900 })
    return
  }

  setTimeout(warmSecondary, 240)
}

export function installLinkPreloadListeners() {
  if (linkPreloadListenersInstalled || typeof document === 'undefined') return () => {}
  linkPreloadListenersInstalled = true

  const preloadFromEvent = (event: Event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const link = target.closest('a[href]')
    if (!(link instanceof HTMLAnchorElement)) return
    if (link.target && link.target !== '_self') return
    if (link.download) return

    preloadRoute(link.href)
  }

  const options: AddEventListenerOptions = { capture: true, passive: true }
  document.addEventListener('pointerover', preloadFromEvent, options)
  document.addEventListener('focusin', preloadFromEvent, options)
  document.addEventListener('touchstart', preloadFromEvent, options)
  document.addEventListener('pointerdown', preloadFromEvent, options)

  return () => {
    document.removeEventListener('pointerover', preloadFromEvent, options)
    document.removeEventListener('focusin', preloadFromEvent, options)
    document.removeEventListener('touchstart', preloadFromEvent, options)
    document.removeEventListener('pointerdown', preloadFromEvent, options)
    linkPreloadListenersInstalled = false
  }
}
