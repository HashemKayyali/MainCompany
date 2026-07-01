import { Suspense } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import App from './App'
import AdminGuard from './components/AdminGuard'
import PageLoader from './components/ui/PageLoader'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import CategoriesPage from './pages/CategoriesPage'
import ContactPage from './pages/ContactPage'
import CustomBuildsPage from './pages/CustomBuildsPage'
import CustomersPage from './pages/CustomersPage'
import GalleryPage from './pages/GalleryPage'
import LegalPage from './pages/LegalPage'
import { lazyRoutes } from './utils/route-preload'

const {
  CategoryPage,
  ProductDetailsPage,
  NotFoundPage,
  AuthCallback,
  ProfilePage,
  ResetPasswordPage,
  UpdatePasswordPage,
  RentalCartPage,
  CheckoutPage,
  OrderSummaryPage,
  PurchaseQuotePage,
  MyRequestsPage,
  MyRequestDetailsPage,
  AdminLayout,
  DashboardPage,
  AdminProductsPage,
  AdminPartsPage,
  AdminCustomersPage,
  AdminCategoriesPage,
  AdminCustomBuildsPage,
  AdminAdminsPage,
  AdminUsersPage,
  AdminLogsPage,
  AdminGalleryPage,
  AdminRequestsPage,
  AdminRequestDetailsPage,
} = lazyRoutes

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader mode="route" delayMs={0} />}>{children}</Suspense>
}

function UserLoginRedirect() {
  const location = useLocation()
  return <Navigate to={{ pathname: '/login', search: location.search }} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'custom-builds', element: <CustomBuildsPage /> },
      { path: 'products/:slug', element: <S><ProductDetailsPage /></S> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/:slug', element: <S><CategoryPage /></S> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy-policy', element: <LegalPage documentKey="privacy" /> },
      { path: 'privacy', element: <LegalPage documentKey="privacy" /> },
      { path: 'terms', element: <LegalPage documentKey="terms" /> },
      { path: 'terms-of-service', element: <LegalPage documentKey="terms" /> },
      { path: 'vendor-terms', element: <LegalPage documentKey="vendorTerms" /> },
      { path: 'refund-policy', element: <LegalPage documentKey="refund" /> },
      { path: 'cookie-policy', element: <LegalPage documentKey="cookies" /> },
      { path: 'cookies', element: <LegalPage documentKey="cookies" /> },
      { path: 'profile', element: <S><ProfilePage /></S> },
      { path: 'rental-cart', element: <S><RentalCartPage /></S> },
      { path: 'checkout', element: <S><CheckoutPage /></S> },
      { path: 'order-summary/:requestNumber', element: <S><OrderSummaryPage /></S> },
      { path: 'purchase-quote', element: <S><PurchaseQuotePage /></S> },
      { path: 'my-requests', element: <S><MyRequestsPage /></S> },
      { path: 'my-requests/:requestNumber', element: <S><MyRequestDetailsPage /></S> },
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },

  { path: '/auth/callback', element: <S><AuthCallback /></S> },

  { path: '/login', element: <LoginPage /> },
  { path: '/user-login', element: <UserLoginRedirect /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/forgot-password', element: <ResetPasswordPage /> },
  { path: '/update-password', element: <UpdatePasswordPage /> },

  {
    path: '/admin',
    element: (
      <AdminGuard>
        <S><AdminLayout /></S>
      </AdminGuard>
    ),
    children: [
      { index: true, element: <S><DashboardPage /></S> },
      { path: 'products', element: <S><AdminProductsPage /></S> },
      { path: 'parts', element: <S><AdminPartsPage /></S> },
      { path: 'customers', element: <S><AdminCustomersPage /></S> },
      { path: 'categories', element: <S><AdminCategoriesPage /></S> },
      { path: 'custom-builds', element: <S><AdminCustomBuildsPage /></S> },
      { path: 'gallery', element: <S><AdminGalleryPage /></S> },
      { path: 'users', element: <S><AdminUsersPage /></S> },
      { path: 'admins', element: <S><AdminAdminsPage /></S> },
      { path: 'logs', element: <S><AdminLogsPage /></S> },
      { path: 'requests', element: <S><AdminRequestsPage /></S> },
      { path: 'requests/:type/:id', element: <S><AdminRequestDetailsPage /></S> },
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },
])
