import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper: fetch profile for auth user
  async function fetchProfile(authUserId: string): Promise<AppUser | null> {
    const { data } = await (supabase
      .from('profiles' as any)
      .select('id, name, email, phone, role, created_at')
      .eq('id', authUserId)
      .maybeSingle()) as { data: any; error: any }

    if (!data) return null
    return {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      phone: data.phone || '',
      createdAt: data.created_at,
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      if (sessionUser && mounted) {
        const profile = await fetchProfile(sessionUser.id)
        if (profile && mounted) setCurrentUser(profile)
      }
      if (mounted) setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (!session?.user) { setCurrentUser(null); return }
      const profile = await fetchProfile(session.user.id)
      if (profile && mounted) setCurrentUser(profile)
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const register = async (name: string, email: string, phone: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'
    if (pw.length < 6) return 'Password must be at least 6 characters'

    // Sign up with metadata (trigger creates profile row)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pw,
      options: { data: { name } }
    })
    if (authError) return authError.message
    if (!authData.user) return 'Registration failed'

    // Update profile with phone
    const { error: updateError } = await (supabase
      .from('profiles' as any)
      .update({ phone, name })
      .eq('id', authData.user.id)) as { error: any }

    if (updateError) console.warn('Could not update profile phone:', updateError)

    // onAuthStateChange will update currentUser
    return true
  }

  const login = async (email: string, pw: string): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) return error.message
    return true
  }

  const logout = () => {
    supabase.auth.signOut()
    setCurrentUser(null)
  }

  return (
    <Ctx.Provider value={{ currentUser, isLoggedIn: !!currentUser, loading, register, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)
