import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import PageLoader from './ui/PageLoader'

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isLoggedIn } = useUser()

  if (loading) return <PageLoader />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (currentUser?.role !== 'superadmin') return <Navigate to="/admin" replace />
  return <>{children}</>
}
