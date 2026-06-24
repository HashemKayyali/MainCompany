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
  home: () => import('../pages/HomePage'),
  products: () => import('../pages/ProductsPage'),
  category: () => import('../pages/CategoryPage'),
  productDetails: () => import('../pages/ProductDetailsPage'),
  customers: () => import('../pages/CustomersPage'),
  gallery: () => import('../pages/GalleryPage'),
  about: () => import('../pages/AboutPage'),
  contact: () => import('../pages/ContactPage'),
  notFound: () => import('../pages/NotFoundPage'),
  authCallback: () => import('../pages/AuthCallback'),
  profile: () => import('../pages/ProfilePage'),
  resetPassword: () => import('../pages/ResetPasswordPage'),
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
  adminAdmins: () => import('../pages/admin/AdminAdminsPage'),
  adminUsers: () => import('../pages/admin/AdminUsersPage'),
  adminLogs: () => import('../pages/admin/AdminLogsPage'),
  adminGallery: () => import('../pages/admin/AdminGalleryPage'),
  adminRequests: () => import('../pages/admin/AdminRequestsPage'),
  adminRequestDetails: () => import('../pages/admin/AdminRequestDetailsPage'),
} as const

export const lazyRoutes = {
  HomePage: lazyRoute(routeImporters.home),
  ProductsPage: lazyRoute(routeImporters.products),
  CategoryPage: lazyRoute(routeImporters.category),
  ProductDetailsPage: lazyRoute(routeImporters.productDetails),
  CustomersPage: lazyRoute(routeImporters.customers),
  GalleryPage: lazyRoute(routeImporters.gallery),
  AboutPage: lazyRoute(routeImporters.about),
  ContactPage: lazyRoute(routeImporters.contact),
  NotFoundPage: lazyRoute(routeImporters.notFound),
  AuthCallback: lazyRoute(routeImporters.authCallback),
  ProfilePage: lazyRoute(routeImporters.profile),
  ResetPasswordPage: lazyRoute(routeImporters.resetPassword),
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
  AdminAdminsPage: lazyRoute(routeImporters.adminAdmins),
  AdminUsersPage: lazyRoute(routeImporters.adminUsers),
  AdminLogsPage: lazyRoute(routeImporters.adminLogs),
  AdminGalleryPage: lazyRoute(routeImporters.adminGallery),
  AdminRequestsPage: lazyRoute(routeImporters.adminRequests),
  AdminRequestDetailsPage: lazyRoute(routeImporters.adminRequestDetails),
} as const

const PUBLIC_ROUTE_PRELOADERS: Record<string, (() => Promise<unknown>) | undefined> = {
  '/': routeImporters.home,
  '/products': routeImporters.products,
  '/customers': routeImporters.customers,
  '/gallery': routeImporters.gallery,
  '/about': routeImporters.about,
  '/contact': routeImporters.contact,
}

const PRIORITY_PUBLIC_PATHS = ['/products', '/contact'] as const
const SECONDARY_PUBLIC_PATHS = ['/customers', '/gallery', '/about'] as const

const warmedPaths = new Set<string>()
let commonRoutesWarmed = false

export function preloadRoute(path: string) {
  const normalizedPath = path.split('?')[0].split('#')[0]
  const importer = PUBLIC_ROUTE_PRELOADERS[normalizedPath]
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

  const warmPriority = () => preloadRoutes(PRIORITY_PUBLIC_PATHS)
  const warmSecondary = () => preloadRoutes(SECONDARY_PUBLIC_PATHS)

  setTimeout(warmPriority, 120)

  type WindowWithIdle = Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
  const w = window as WindowWithIdle
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => warmSecondary(), { timeout: 1400 })
    return
  }

  setTimeout(warmSecondary, 360)
}
