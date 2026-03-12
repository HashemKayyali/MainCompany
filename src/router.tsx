import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import AdminGuard from './components/AdminGuard'
import PageLoader from './components/ui/PageLoader'

// ── Lazy-loaded pages ──────────────────────────────────────────────
const HomePage            = lazy(() => import('./pages/HomePage'))
const ProductsPage        = lazy(() => import('./pages/ProductsPage'))
const ProductDetailsPage  = lazy(() => import('./pages/ProductDetailsPage'))
const CustomersPage       = lazy(() => import('./pages/CustomersPage'))
const GalleryPage         = lazy(() => import('./pages/GalleryPage'))
const AboutPage           = lazy(() => import('./pages/AboutPage'))
const ContactPage         = lazy(() => import('./pages/ContactPage'))
const LoginPage           = lazy(() => import('./pages/LoginPage'))
const RegisterPage        = lazy(() => import('./pages/RegisterPage'))
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'))
const AuthCallback        = lazy(() => import('./pages/AuthCallback'))
const ProfilePage         = lazy(() => import('./pages/ProfilePage'))
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'))

// Admin pages (loaded only when admin navigates)
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'))
const DashboardPage       = lazy(() => import('./pages/admin/DashboardPage'))
const AdminProductsPage   = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminPartsPage      = lazy(() => import('./pages/admin/AdminPartsPage'))
const AdminCustomersPage  = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminAdminsPage     = lazy(() => import('./pages/admin/AdminAdminsPage'))
const AdminUsersPage      = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminLogsPage       = lazy(() => import('./pages/admin/AdminLogsPage'))
const AdminGalleryPage    = lazy(() => import('./pages/admin/AdminGalleryPage'))

// ── Suspense wrapper ───────────────────────────────────────────────
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true,              element: <S><HomePage /></S> },
      { path: 'products',         element: <S><ProductsPage /></S> },
      { path: 'products/:slug',   element: <S><ProductDetailsPage /></S> },
      { path: 'customers',        element: <S><CustomersPage /></S> },
      { path: 'gallery',          element: <S><GalleryPage /></S> },
      { path: 'about',            element: <S><AboutPage /></S> },
      { path: 'contact',          element: <S><ContactPage /></S> },
      { path: 'profile',          element: <S><ProfilePage /></S> },
      { path: 'reset-password',   element: <S><ResetPasswordPage /></S> },
      { path: '*',                element: <S><NotFoundPage /></S> },
    ],
  },

  { path: '/auth/callback', element: <S><AuthCallback /></S> },

  { path: '/login',      element: <S><LoginPage /></S> },
  { path: '/user-login', element: <Navigate to="/login" replace /> },
  { path: '/register',   element: <S><RegisterPage /></S> },

  {
    path: '/admin',
    element: (
      <AdminGuard>
        <S><AdminLayout /></S>
      </AdminGuard>
    ),
    children: [
      { index: true,        element: <S><DashboardPage /></S> },
      { path: 'products',   element: <S><AdminProductsPage /></S> },
      { path: 'parts',      element: <S><AdminPartsPage /></S> },
      { path: 'customers',  element: <S><AdminCustomersPage /></S> },
      { path: 'categories', element: <S><AdminCategoriesPage /></S> },
      { path: 'gallery',    element: <S><AdminGalleryPage /></S> },
      { path: 'users',      element: <S><AdminUsersPage /></S> },
      { path: 'admins',     element: <S><AdminAdminsPage /></S> },
      { path: 'logs',       element: <S><AdminLogsPage /></S> },
    ],
  },
])
