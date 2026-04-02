import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import App from './App'
import AdminGuard from './components/AdminGuard'
import PageLoader from './components/ui/PageLoader'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const CustomersPage = lazy(() => import('./pages/CustomersPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const RentalCartPage = lazy(() => import('./pages/RentalCartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSummaryPage = lazy(() => import('./pages/OrderSummaryPage'))
const PurchaseQuotePage = lazy(() => import('./pages/PurchaseQuotePage'))
const MyRequestsPage = lazy(() => import('./pages/MyRequestsPage'))
const MyRequestDetailsPage = lazy(() => import('./pages/MyRequestDetailsPage'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminPartsPage = lazy(() => import('./pages/admin/AdminPartsPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminAdminsPage = lazy(() => import('./pages/admin/AdminAdminsPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'))
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'))
const AdminRequestDetailsPage = lazy(() => import('./pages/admin/AdminRequestDetailsPage'))

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
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

  { path: '/login', element: <S><LoginPage /></S> },
  { path: '/user-login', element: <UserLoginRedirect /> },
  { path: '/register', element: <S><RegisterPage /></S> },

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
