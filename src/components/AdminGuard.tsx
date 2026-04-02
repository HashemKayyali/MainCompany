import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import PageLoader from './ui/PageLoader'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { loading, isAdmin, isLoggedIn } = useUser()

  if (loading) return <PageLoader />

  if (!isLoggedIn) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />
  }

  if (!isAdmin) return <Navigate to="/profile" replace />
  return <>{children}</>
}
