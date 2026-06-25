import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

type AuthPersistenceMode = 'persistent' | 'session'

const AUTH_PERSISTENCE_KEY = 'bl-auth-persistence'
const AUTH_PERSISTENCE_PERSISTENT = 'persistent'
const AUTH_PERSISTENCE_SESSION = 'session'
const supabaseProjectRef = (() => {
  try {
    if (!supabaseUrl) return 'local'
    return new URL(supabaseUrl).hostname.split('.')[0] || 'local'
  } catch {
    return 'local'
  }
})()
const SUPABASE_STORAGE_PREFIX = `sb-${supabaseProjectRef}-`
const SUPABASE_STORAGE_KEY = `${SUPABASE_STORAGE_PREFIX}auth-token`

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}

export const SUPABASE_ENABLED = isSupabaseConfigured()

function getStorage(mode: AuthPersistenceMode): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  return mode === 'persistent' ? window.localStorage : window.sessionStorage
}

function safeGetItem(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function safeSetItem(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value)
  } catch {
    // noop
  }
}

function safeRemoveItem(storage: Storage | undefined, key: string) {
  try {
    storage?.removeItem(key)
  } catch {
    // noop
  }
}

function clearSupabaseKeys(storage: Storage | undefined) {
  if (!storage) return

  try {
    const keys: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key?.startsWith(SUPABASE_STORAGE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => storage.removeItem(key))
  } catch {
    // noop
  }
}

function getStoredPersistenceMode(): AuthPersistenceMode {
  const persistentStorage = getStorage('persistent')
  const sessionStorage = getStorage('session')

  if (safeGetItem(persistentStorage, AUTH_PERSISTENCE_KEY) === AUTH_PERSISTENCE_PERSISTENT) {
    return 'persistent'
  }

  if (safeGetItem(sessionStorage, AUTH_PERSISTENCE_KEY) === AUTH_PERSISTENCE_SESSION) {
    return 'session'
  }

  if (safeGetItem(persistentStorage, SUPABASE_STORAGE_KEY)) {
    return 'persistent'
  }

  return 'persistent'
}

function getActiveAuthStorage() {
  return getStorage(getStoredPersistenceMode())
}

export function setAuthPersistence(rememberMe: boolean) {
  const persistentStorage = getStorage('persistent')
  const sessionStorage = getStorage('session')

  if (rememberMe) {
    safeSetItem(persistentStorage, AUTH_PERSISTENCE_KEY, AUTH_PERSISTENCE_PERSISTENT)
    safeRemoveItem(sessionStorage, AUTH_PERSISTENCE_KEY)
    clearSupabaseKeys(sessionStorage)
    return
  }

  safeSetItem(sessionStorage, AUTH_PERSISTENCE_KEY, AUTH_PERSISTENCE_SESSION)
  safeRemoveItem(persistentStorage, AUTH_PERSISTENCE_KEY)
  clearSupabaseKeys(persistentStorage)
}

export function clearAuthPersistence() {
  const persistentStorage = getStorage('persistent')
  const sessionStorage = getStorage('session')

  safeRemoveItem(persistentStorage, AUTH_PERSISTENCE_KEY)
  safeRemoveItem(sessionStorage, AUTH_PERSISTENCE_KEY)
  clearSupabaseKeys(persistentStorage)
  clearSupabaseKeys(sessionStorage)
}

const authStorageAdapter = {
  getItem(key: string) {
    return safeGetItem(getActiveAuthStorage(), key)
  },
  setItem(key: string, value: string) {
    safeSetItem(getActiveAuthStorage(), key, value)
  },
  removeItem(key: string) {
    safeRemoveItem(getStorage('persistent'), key)
    safeRemoveItem(getStorage('session'), key)
  },
}

if (!SUPABASE_ENABLED) {
  console.warn('[Supabase] Missing/invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient<Database, 'public'>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Disabled to avoid racing with explicit exchangeCodeForSession calls in
      // AuthCallback and UpdatePasswordPage. We handle the OAuth code / recovery
      // hash exchange manually so we can reliably show success/error UI.
      detectSessionInUrl: false,
      storageKey: SUPABASE_STORAGE_KEY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: authStorageAdapter as any,
    },
  }
)
