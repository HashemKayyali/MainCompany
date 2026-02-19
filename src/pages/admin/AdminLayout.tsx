import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Sidebar from '../../components/admin/Sidebar'

export default function AdminLayout() {
  const { isAuth, loading } = useAuth()
  const { isDark } = useTheme()

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-void-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="card-surface rounded-2xl p-6 text-sm opacity-80">Loading…</div>
      </div>
    )
  }

  if (!isAuth) return <Navigate to="/login" replace />

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-void-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
