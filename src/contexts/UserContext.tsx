import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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

// Helper to update profile bypassing strict types
async function updateProfile(userId: string, fields: Record<string, string>): Promise<{ error: any }> {
  const query = supabase.from('profiles' as any) as any
  const { error } = await query.update(fields).eq('id', userId)
  return { error }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper: fetch profile for auth user
  const fetchProfile = useCallback(async (authUserId: string): Promise<AppUser | null> => {
    try {
      const { data } = await (supabase
        .from('profiles' as any)
        .select('id, name, email, phone, role, created_at')
        .eq('id', authUserId)
        .maybeSingle()) as { data: any; error: any }

      if (!data) return null
      // Only return user profiles (not admin profiles)
      if (data.role === 'admin') return null
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

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data.session?.user
        if (sessionUser && mounted) {
          const profile = await fetchProfile(sessionUser.id)
          if (mounted) setCurrentUser(profile)
        }
      } catch (err) {
        console.warn('UserContext init error:', err)
      }
      if (mounted) setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (!session?.user) {
        setCurrentUser(null)
        return
      }
      try {
        const profile = await fetchProfile(session.user.id)
        if (mounted) setCurrentUser(profile)
      } catch (err) {
        console.warn('UserContext auth change error:', err)
      }
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [fetchProfile])

  const register = useCallback(async (name: string, email: string, phone: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'
    if (pw.length < 6) return 'Password must be at least 6 characters'

    try {
      // Sign up with metadata (trigger creates profile row)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: pw,
        options: { data: { name } }
      })
      if (authError) return authError.message
      if (!authData.user) return 'Registration failed'

      // Small delay to let the DB trigger create the profile row
      await new Promise(r => setTimeout(r, 500))

      // Update profile with phone
      const { error: updateError } = await updateProfile(authData.user.id, { phone, name, email })

      if (updateError) console.warn('Could not update profile phone:', updateError)

      // onAuthStateChange will update currentUser
      return true
    } catch (err: any) {
      return err.message || 'Registration failed'
    }
  }, [])

  const login = useCallback(async (email: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) return error.message
      return true
    } catch (err: any) {
      return err.message || 'Login failed'
    }
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
    setCurrentUser(null)
  }, [])

  return (
    <Ctx.Provider value={{ currentUser, isLoggedIn: !!currentUser, loading, register, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)