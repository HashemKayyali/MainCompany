import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearAuthPersistence, setAuthPersistence, supabase, isSupabaseConfigured } from '../lib/supabase'
import { useSession } from './SessionContext'
import type { AvatarFields } from '../lib/avatar'
import {
  fetchProfileIdentityRow,
  fetchProfileAvatarMap,
  mapProfileAvatarFields,
} from '../services/profile.service'
import { onProfileUpdated } from '../lib/profile-sync'

export type AdminRole = 'admin' | 'superadmin'

export interface AdminUser extends AvatarFields {
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

  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>

  admins: AdminUser[]
  addAdmin: (email: string, name: string, role: AdminRole) => Promise<boolean>
  removeAdmin: (id: string) => Promise<boolean>
  changeAdminRole: (id: string, newRole: AdminRole) => Promise<boolean>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

async function fetchProfileIdentity(
  userId: string
): Promise<{
  role: string | null
  name: string | null
  avatarUrl: string | null
  avatarStyle: string | null
  avatarSeed: string | null
  avatarOptions: AvatarFields['avatarOptions']
}> {
  const data = await fetchProfileIdentityRow(userId)

  if (!data) {
    return {
      role: null,
      name: null,
      avatarUrl: null,
      avatarStyle: null,
      avatarSeed: null,
      avatarOptions: null,
    }
  }

  const avatar = mapProfileAvatarFields(data)
  return {
    role: data?.role ?? null,
    name: data?.name ?? null,
    ...avatar,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: sessionLoading } = useSession()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])

  const resolveAdmin = useCallback(
    async (sessionUser: { id: string; email?: string } | null): Promise<AdminUser | null> => {
      if (!sessionUser) return null

      const prof = await fetchProfileIdentity(sessionUser.id)
      if (prof.role !== 'admin' && prof.role !== 'superadmin') return null

      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: prof.name || sessionUser.email || 'Admin',
        role: prof.role as AdminRole,
        avatarUrl: prof.avatarUrl,
        avatarStyle: prof.avatarStyle,
        avatarSeed: prof.avatarSeed,
        avatarOptions: prof.avatarOptions,
      }
    },
    []
  )

  // Fetch ALL admin/superadmin profiles from DB
  // Uses RPC function if available (bypasses RLS), falls back to direct query
  const fetchAllAdmins = useCallback(async (): Promise<AdminUser[]> => {
    try {
      // ✅ Approach 1: Try RPC function (bypasses RLS — recommended)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_admins') as any
      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        const avatarMap = await fetchProfileAvatarMap(rpcData.map((row: any) => row.id))
        return rpcData.map((row: any) => ({
          id: row.id,
          email: row.email || '',
          name: row.name || row.email || 'Admin',
          role: row.role as AdminRole,
          createdAt: row.created_at,
          ...(avatarMap[row.id] || {}),
        }))
      }

      // ✅ Approach 2: Direct query (works if RLS allows admins to read all profiles)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .in('role', ['admin', 'superadmin'])

      if (error || !data) return []

      const avatarMap = await fetchProfileAvatarMap((data as any[]).map((row: any) => row.id))

      return (data as any[]).map((row: any) => ({
        id: row.id,
        email: row.email || '',
        name: row.name || row.email || 'Admin',
        role: row.role as AdminRole,
        createdAt: row.created_at,
        ...(avatarMap[row.id] || {}),
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

  useEffect(() => {
    return onProfileUpdated(detail => {
      setUser(prev =>
        prev && prev.id === detail.userId
          ? {
              ...prev,
              name: detail.name?.trim() || prev.name,
              avatarUrl: detail.avatarUrl ?? prev.avatarUrl,
              avatarStyle: detail.avatarStyle ?? prev.avatarStyle,
              avatarSeed: detail.avatarSeed ?? prev.avatarSeed,
              avatarOptions: detail.avatarOptions ?? prev.avatarOptions,
            }
          : prev
      )

      setAdmins(prev =>
        prev.map(admin =>
          admin.id === detail.userId
            ? {
                ...admin,
                name: detail.name?.trim() || admin.name,
                avatarUrl: detail.avatarUrl ?? admin.avatarUrl,
                avatarStyle: detail.avatarStyle ?? admin.avatarStyle,
                avatarSeed: detail.avatarSeed ?? admin.avatarSeed,
                avatarOptions: detail.avatarOptions ?? admin.avatarOptions,
              }
            : admin
        )
      )
    })
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, message: 'Supabase is not configured. Check your .env file.' }
    }

    setAuthPersistence(rememberMe)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { ok: false, message: error?.message || 'Login failed' }

    const prof = await fetchProfileIdentity(data.user.id)
    if (prof.role !== 'admin' && prof.role !== 'superadmin') {
      await supabase.auth.signOut()
      clearAuthPersistence()
      return { ok: false, message: 'This account is not an admin.' }
    }

    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut()
    clearAuthPersistence()
    setUser(null)
    setAdmins([])
  }, [])

  // ✅ Admin management via RPC functions (no Edge Functions needed)
  const addAdmin = useCallback(
    async (email: string, _name: string, role: AdminRole): Promise<boolean> => {
      const cleanEmail = (email || '').trim().toLowerCase()
      if (!cleanEmail) return false
      if (admins.some(a => a.email.trim().toLowerCase() === cleanEmail)) return false

      // Find user by email — must be registered
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (!existingProfile?.id) {
        // User not found
        return false
      }

      // Use RPC to set role
      const { data, error } = await supabase.rpc('set_admin_role', {
        target_id: existingProfile.id,
        new_role: role,
      }) as any

      if (error) {
        console.error('[AuthContext] set_admin_role RPC error:', error)
        return false
      }
      if (data && !data.ok) {
        console.warn('[AuthContext] set_admin_role failed:', data.error)
        return false
      }

      // Refresh admin list
      const allAdmins = await fetchAllAdmins()
      setAdmins(allAdmins)
      return true
    },
    [admins, fetchAllAdmins]
  )

  // ✅ Change an existing admin's role
  const changeAdminRole = useCallback(async (id: string, newRole: AdminRole): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('set_admin_role', {
        target_id: id,
        new_role: newRole,
      }) as any

      if (error) {
        console.error('[AuthContext] changeAdminRole RPC error:', error)
        return false
      }
      if (data && !data.ok) {
        console.warn('[AuthContext] changeAdminRole failed:', data.error)
        return false
      }

      const allAdmins = await fetchAllAdmins()
      setAdmins(allAdmins)
      return true
    } catch (err) {
      console.error('[AuthContext] changeAdminRole error:', err)
      return false
    }
  }, [fetchAllAdmins])

  const removeAdmin = useCallback(async (id: string): Promise<boolean> => {
    if (id === user?.id) return false

    try {
      const { data, error } = await supabase.rpc('remove_admin', { target_id: id }) as any
      if (error) {
        console.error('[AuthContext] remove_admin RPC error:', error)
        return false
      }
      if (data && !data.ok) {
        console.warn('[AuthContext] remove_admin failed:', data.error)
        return false
      }

      // Refresh admin list
      const allAdmins = await fetchAllAdmins()
      setAdmins(allAdmins)
      return true
    } catch (err) {
      console.error('[AuthContext] remove_admin error:', err)
      // Fallback: local remove
      setAdmins(prev => prev.filter(a => a.id !== id))
      return true
    }
  }, [user, fetchAllAdmins])

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
      changeAdminRole,
    }
  }, [user, admins, loading, login, logout, addAdmin, removeAdmin, changeAdminRole])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
