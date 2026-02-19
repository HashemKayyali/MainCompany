import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}

export const SUPABASE_ENABLED = isSupabaseConfigured()

if (!SUPABASE_ENABLED) {
  console.warn('[Supabase] Missing/invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

// ✅ أهم تعديل: نحدد schema 'public' صراحةً
export const supabase = createClient<Database, 'public'>(supabaseUrl || '', supabaseAnonKey || '')