import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { useSession } from './SessionContext'

export interface AppUser {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
  role?: string | null
}

interface UserCtx {
  currentUser: AppUser | null
  isLoggedIn: boolean
  isAdmin: boolean
  loading: boolean
  register: (name: string, email: string, phone: string, pw: string) => Promise<string | true>
  login: (email: string, pw: string) => Promise<string | true>
  logout: () => void
}

const Ctx = createContext<UserCtx>({} as UserCtx)

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export function UserProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: sessionLoading } = useSession()
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const safeSet = (fn: () => void) => {
    if (mountedRef.current) fn()
  }

  const isAdminRole = (role: unknown) => role === 'admin' || role === 'superadmin'

  const fetchProfile = useCallback(async (authUserId: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, role, created_at')
        .eq('id', authUserId)
        .maybeSingle<Pick<ProfileRow, 'id' | 'name' | 'email' | 'phone' | 'role' | 'created_at'>>()

      if (error || !data) return null

      return {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone || '',
        createdAt: data.created_at,
        role: (data as any).role ?? null,
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err)
      return null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    async function syncFromSession() {
      if (!isSupabaseConfigured()) {
        safeSet(() => {
          setCurrentUser(null)
          setLoading(false)
        })
        return
      }

      if (sessionLoading) {
        safeSet(() => setLoading(true))
        return
      }

      try {
        if (!authUser) {
          safeSet(() => setCurrentUser(null))
          return
        }

        const profile = await fetchProfile(authUser.id)
        safeSet(() => setCurrentUser(profile))
      } catch (err) {
        console.warn('UserContext sync error:', err)
        safeSet(() => setCurrentUser(null))
      } finally {
        safeSet(() => setLoading(false))
      }
    }

    syncFromSession()

    return () => {
      mountedRef.current = false
    }
  }, [authUser, sessionLoading, fetchProfile])

  const waitForProfileRow = useCallback(async (userId: string) => {
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
      if (data?.id) return true
      await new Promise(r => setTimeout(r, 400))
    }
    return false
  }, [])

  const register = useCallback(
    async (name: string, email: string, phone: string, pw: string): Promise<string | true> => {
      if (!isSupabaseConfigured()) return 'Supabase not configured'
      if (pw.length < 6) return 'Password must be at least 6 characters'

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { name, phone },
          },
        })

        if (authError) return authError.message
        if (!authData.user) return 'Registration failed'

        const ok = await waitForProfileRow(authData.user.id)
        if (ok) {
          await supabase
            .from('profiles')
            .update({ phone: phone || null, name, email } as Partial<ProfileRow>)
            .eq('id', authData.user.id)
        }

        return true
      } catch (err: any) {
        return err.message || 'Registration failed'
      }
    },
    [waitForProfileRow]
  )

  // ✅ Login موحّد للجميع (admin/user) — ما بنطرد الأدمن
  const login = useCallback(async (email: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) return error.message

      // ✅ نجيب البروفايل ونخزنه (فيه role)
      if (data.user) {
        const profile = await fetchProfile(data.user.id)
        safeSet(() => setCurrentUser(profile))
      }

      return true
    } catch (err: any) {
      return err.message || 'Login failed'
    }
  }, [fetchProfile])

  const logout = useCallback(() => {
    if (isSupabaseConfigured()) supabase.auth.signOut()
    safeSet(() => setCurrentUser(null))
  }, [])

  const isAdmin = !!currentUser && isAdminRole(currentUser.role)

  return (
    <Ctx.Provider value={{ currentUser, isLoggedIn: !!currentUser, isAdmin, loading, register, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)