import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useUser()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}