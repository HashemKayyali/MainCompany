import { lazy, type ComponentType } from 'react'

type RouteImporter<T extends ComponentType<any>> = () => Promise<{ default: T }>

function lazyRoute<T extends ComponentType<any>>(importer: RouteImporter<T>) {
  const Component = lazy(importer)
  return Object.assign(Component, { preload: importer })
}

export const routeImporters = {
  home: () => import('../pages/HomePage'),
  products: () => import('../pages/ProductsPage'),
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

export function warmCommonRoutes() {
  if (commonRoutesWarmed || typeof window === 'undefined') return
  commonRoutesWarmed = true

  const run = () => {
    preloadRoute('/products')
    preloadRoute('/customers')
    preloadRoute('/gallery')
    preloadRoute('/about')
    preloadRoute('/contact')
  }

  if ('requestIdleCallback' in window) {
    ;(window as Window & {
      requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    }).requestIdleCallback(() => run(), { timeout: 1400 })
    return
  }

  window.setTimeout(run, 320)
}
