import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin'
  createdAt?: string
}

interface AuthCtx {
  user: AdminUser | null
  isAuth: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>

  admins: AdminUser[]
  isSuperAdmin: boolean
  addAdmin: () => boolean
  removeAdmin: () => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

async function fetchProfileRole(
  userId: string
): Promise<{ role: string | null; name: string | null }> {
  type ProfilePick = { role: string | null; name: string | null }

  const { data, error } = (await supabase
    .from('profiles' as any)
    .select('role,name')
    .eq('id', userId)
    .maybeSingle()) as { data: ProfilePick | null; error: any }

  if (error) return { role: null, name: null }
  return { role: data?.role ?? null, name: data?.name ?? null }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])

  /**
   * Resolve whether a session user is an admin.
   * IMPORTANT: Does NOT sign out non-admin users.
   * It just returns null so AuthContext ignores them,
   * while UserContext can still use the same Supabase session.
   */
  const resolveAdmin = useCallback(async (sessionUser: { id: string; email?: string } | null): Promise<AdminUser | null> => {
    if (!sessionUser) return null
    const prof = await fetchProfileRole(sessionUser.id)
    if (prof.role !== 'admin') return null
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: prof.name || sessionUser.email || 'Admin',
      role: 'admin',
    }
  }, [])

  // Restore session + listen changes
  useEffect(() => {
    let mounted = true

    async function init() {
      if (!isSupabaseConfigured()) {
        if (mounted) {
          setUser(null)
          setAdmins([])
          setLoading(false)
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null

      const adminUser = await resolveAdmin(sessionUser)
      if (mounted) {
        setUser(adminUser)
        setAdmins(adminUser ? [adminUser] : [])
        setLoading(false)
      }
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const sessionUser = session?.user ?? null

      if (sessionUser) {
        setLoading(true)
        const adminUser = await resolveAdmin(sessionUser)
        if (mounted) {
          setUser(adminUser)
          setAdmins(adminUser ? [adminUser] : [])
          setLoading(false)
        }
      } else {
        if (mounted) {
          setUser(null)
          setAdmins([])
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [resolveAdmin])

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, message: 'Supabase is not configured. Check your .env file.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { ok: false, message: error?.message || 'Login failed' }

    const prof = await fetchProfileRole(data.user.id)
    if (prof.role !== 'admin') {
      // Sign out ONLY when attempted through the admin login page
      await supabase.auth.signOut()
      return { ok: false, message: 'This account is not an admin.' }
    }

    // onAuthStateChange will update state automatically
    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAdmins([])
  }, [])

  const value = useMemo<AuthCtx>(() => {
    return {
      user,
      admins,
      isAuth: !!user,
      isAdmin: !!user,
      loading,
      login,
      logout,
      isSuperAdmin: false,
      addAdmin: () => false,
      removeAdmin: () => {},
    }
  }, [user, admins, loading, login, logout])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
