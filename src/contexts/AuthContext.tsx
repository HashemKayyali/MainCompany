import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSession } from './SessionContext'
import type { Database } from '../lib/database.types'

export type AdminRole = 'admin' | 'superadmin'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  createdAt?: string
}

interface AuthCtx {
  user: AdminUser | null
  isAuth: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean

  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>

  admins: AdminUser[]
  addAdmin: (email: string, name: string, role: AdminRole) => boolean
  removeAdmin: (id: string) => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

type ProfileRow = Database['public']['Tables']['profiles']['Row']

async function fetchProfileRole(userId: string): Promise<{ role: string | null; name: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role,name')
    .eq('id', userId)
    .maybeSingle<Pick<ProfileRow, 'role' | 'name'>>()

  if (error) return { role: null, name: null }
  return { role: data?.role ?? null, name: data?.name ?? null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: sessionLoading } = useSession()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])

  const resolveAdmin = useCallback(
    async (sessionUser: { id: string; email?: string } | null): Promise<AdminUser | null> => {
      if (!sessionUser) return null

      const prof = await fetchProfileRole(sessionUser.id)
      if (prof.role !== 'admin' && prof.role !== 'superadmin') return null

      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: prof.name || sessionUser.email || 'Admin',
        role: prof.role as AdminRole,
      }
    },
    []
  )

  // Fetch ALL admin/superadmin profiles from DB
  const fetchAllAdmins = useCallback(async (): Promise<AdminUser[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .in('role', ['admin', 'superadmin'])

      if (error || !data) return []

      return (data as any[]).map((row: any) => ({
        id: row.id,
        email: row.email || '',
        name: row.name || row.email || 'Admin',
        role: row.role as AdminRole,
        createdAt: row.created_at,
      }))
    } catch {
      return []
    }
  }, [])

  // ✅ بدل getSession/onAuthStateChange من هون، بنعتمد على SessionProvider (مصدر واحد)
  useEffect(() => {
    let mounted = true

    async function syncFromSession() {
      try {
        if (!isSupabaseConfigured()) {
          if (mounted) {
            setUser(null)
            setAdmins([])
            setLoading(false)
          }
          return
        }

        // لسه SessionProvider عم يحمّل
        if (sessionLoading) {
          if (mounted) setLoading(true)
          return
        }

        const adminUser = await resolveAdmin(authUser ? { id: authUser.id, email: authUser.email } : null)
        const allAdmins = adminUser ? await fetchAllAdmins() : []

        if (mounted) {
          setUser(adminUser)
          setAdmins(allAdmins)
          setLoading(false)
        }
      } catch (e) {
        console.warn('[AuthContext] sync error:', e)
        if (mounted) {
          setUser(null)
          setAdmins([])
          setLoading(false)
        }
      }
    }

    syncFromSession()
    return () => {
      mounted = false
    }
  }, [authUser, sessionLoading, resolveAdmin, fetchAllAdmins])

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, message: 'Supabase is not configured. Check your .env file.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { ok: false, message: error?.message || 'Login failed' }

    const prof = await fetchProfileRole(data.user.id)
    if (prof.role !== 'admin' && prof.role !== 'superadmin') {
      await supabase.auth.signOut()
      return { ok: false, message: 'This account is not an admin.' }
    }

    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut()
    setUser(null)
    setAdmins([])
  }, [])

  // UI-only admin management (no DB write)
  const addAdmin = useCallback(
    (email: string, name: string, role: AdminRole) => {
      const cleanEmail = (email || '').trim().toLowerCase()
      const cleanName = (name || '').trim()
      if (!cleanEmail || !cleanName) return false
      if (admins.some(a => a.email.trim().toLowerCase() === cleanEmail)) return false

      const newAdmin: AdminUser = {
        id: `local-${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role,
        createdAt: new Date().toISOString(),
      }
      setAdmins(prev => [...prev, newAdmin])
      return true
    },
    [admins]
  )

  const removeAdmin = useCallback((id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id))
  }, [])

  const value = useMemo<AuthCtx>(() => {
    const isSuperAdmin = user?.role === 'superadmin'
    return {
      user,
      admins,
      isAuth: !!user,
      isAdmin: !!user,
      isSuperAdmin,
      loading,
      login,
      logout,
      addAdmin,
      removeAdmin,
    }
  }, [user, admins, loading, login, logout, addAdmin, removeAdmin])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)