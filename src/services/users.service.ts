import { clearAuthPersistence, setAuthPersistence, supabase } from '../lib/supabase'

export interface AppUser {
  id: string; name: string; email: string; phone: string
}

export async function register(name: string, email: string, phone: string, password: string): Promise<AppUser> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email, password, options: { data: { name } }
  })
  if (authError) throw authError
  if (!authData.user) throw new Error('Registration failed')
  // Trigger auto-creates profile, update phone
  await (supabase.from('profiles' as any).update({ phone, name }).eq('id', authData.user.id) as any)
  return { id: authData.user.id, name, email, phone }
}

export async function login(email: string, password: string, rememberMe = false) {
  setAuthPersistence(rememberMe)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  await supabase.auth.signOut()
  clearAuthPersistence()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data } = await (supabase.from('profiles' as any).select('*').eq('id', session.user.id).maybeSingle() as any)
  if (!data) return null
  return { id: data.id, name: data.name || '', email: data.email || session.user.email || '', phone: data.phone || '' }
}
