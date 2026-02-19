import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // نتركها console فقط (بدون crash) عشان dev يوضح المشكلة
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '')

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}
