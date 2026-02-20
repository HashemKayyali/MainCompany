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
}

interface UserCtx {
  currentUser: AppUser | null
  isLoggedIn: boolean
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

      if (error) {
        // غالباً RLS أو الصف مش موجود (قبل trigger)
        return null
      }
      if (!data) return null
      if (isAdminRole(data.role)) return null

      return {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        phone: data.phone || '',
        createdAt: data.created_at,
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err)
      return null
    }
  }, [])

  // ✅ بدل getSession/onAuthStateChange من هون، بنعتمد على SessionProvider
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

  const register = useCallback(
    async (name: string, email: string, phone: string, pw: string): Promise<string | true> => {
      if (!isSupabaseConfigured()) return 'Supabase not configured'
      if (pw.length < 6) return 'Password must be at least 6 characters'

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { data: { name } },
        })

        if (authError) return authError.message
        if (!authData.user) return 'Registration failed'

        // ✅ مهم: عندك RLS ما بيسمح INSERT على profiles
        // لازم Trigger ينشئ row تلقائياً. بنستنى شوي ثم نعمل UPDATE (المسموح)
        await new Promise(r => setTimeout(r, 600))

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone, name, email } as Partial<ProfileRow>)
          .eq('id', authData.user.id)

        if (updateError) {
          console.warn('Could not update profile:', updateError)
          // ملاحظة للمستخدم/التطبيق: إذا ما في trigger، row مش موجود → update يفشل
        }

        return true
      } catch (err: any) {
        return err.message || 'Registration failed'
      }
    },
    []
  )

  const login = useCallback(async (email: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) return error.message

      // منع حسابات الأدمن من الدخول من واجهة المستخدم
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle<Pick<ProfileRow, 'role'>>()

        if (isAdminRole(profile?.role)) {
          await supabase.auth.signOut()
          return 'This is an admin account. Please use the admin login page.'
        }
      }

      return true
    } catch (err: any) {
      return err.message || 'Login failed'
    }
  }, [])

  const logout = useCallback(() => {
    if (isSupabaseConfigured()) supabase.auth.signOut()
    safeSet(() => setCurrentUser(null))
  }, [])

  return (
    <Ctx.Provider value={{ currentUser, isLoggedIn: !!currentUser, loading, register, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)