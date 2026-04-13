import { Suspense } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import App from './App'
import AdminGuard from './components/AdminGuard'
import PageLoader from './components/ui/PageLoader'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { lazyRoutes } from './utils/route-preload'

const {
  HomePage,
  ProductsPage,
  ProductDetailsPage,
  CustomersPage,
  GalleryPage,
  AboutPage,
  ContactPage,
  NotFoundPage,
  AuthCallback,
  ProfilePage,
  ResetPasswordPage,
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
  AdminAdminsPage,
  AdminUsersPage,
  AdminLogsPage,
  AdminGalleryPage,
  AdminRequestsPage,
  AdminRequestDetailsPage,
} = lazyRoutes

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader mode="route" delayMs={90} />}>{children}</Suspense>
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
      { index: true, element: <S><HomePage /></S> },
      { path: 'products', element: <S><ProductsPage /></S> },
      { path: 'products/:slug', element: <S><ProductDetailsPage /></S> },
      { path: 'customers', element: <S><CustomersPage /></S> },
      { path: 'gallery', element: <S><GalleryPage /></S> },
      { path: 'about', element: <S><AboutPage /></S> },
      { path: 'contact', element: <S><ContactPage /></S> },
      { path: 'profile', element: <S><ProfilePage /></S> },
      { path: 'reset-password', element: <S><ResetPasswordPage /></S> },
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
      { path: 'gallery', element: <S><AdminGalleryPage /></S> },
      { path: 'users', element: <S><AdminUsersPage /></S> },
      { path: 'admins', element: <S><AdminAdminsPage /></S> },
      { path: 'logs', element: <S><AdminLogsPage /></S> },
      { path: 'requests', element: <S><AdminRequestsPage /></S> },
      { path: 'requests/:type/:id', element: <S><AdminRequestDetailsPage /></S> },
    ],
  },
])
