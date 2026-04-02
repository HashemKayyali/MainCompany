import { isSupabaseConfigured, supabase } from '../lib/supabase'

export async function requireAuthenticatedSession(actionLabel = 'continue') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error

  if (!data.session?.user) {
    throw new Error(`Please sign in before ${actionLabel}.`)
  }

  return data.session.user
}
