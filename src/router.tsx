import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CustomersPage from './pages/CustomersPage'
import GalleryPage from './pages/GalleryPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminPartsPage from './pages/admin/AdminPartsPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminAdminsPage from './pages/admin/AdminAdminsPage'
import AdminGalleryPage from './pages/admin/AdminGalleryPage'
import AuthCallback from './pages/AuthCallback'
import AdminGuard from './components/AdminGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  { path: '/auth/callback', element: <AuthCallback /> },

  { path: '/login', element: <LoginPage /> },
  { path: '/user-login', element: <Navigate to="/login" replace /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'parts', element: <AdminPartsPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'gallery', element: <AdminGalleryPage /> },
      { path: 'admins', element: <AdminAdminsPage /> },
    ],
  },
])