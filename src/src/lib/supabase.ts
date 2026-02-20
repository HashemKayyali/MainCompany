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
// ✅ ونثبت خيارات auth لتقليل مشاكل الـ auth lock (Navigator.locks) مع تعدد الـ providers
export const supabase = createClient<Database, 'public'>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // نستخدم localStorage صراحةً (وفي السيرفر بنتركها undefined)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage: (typeof window !== 'undefined' ? window.localStorage : undefined) as any,
  },
})