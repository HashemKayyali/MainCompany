import { clearAuthPersistence, setAuthPersistence, supabase } from '../lib/supabase'

export interface AdminUser {
  id: string; email: string; name: string; role: string
}

export async function signIn(email: string, password: string, rememberMe = false) {
  setAuthPersistence(rememberMe)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  clearAuthPersistence()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
