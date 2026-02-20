import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface SessionCtx {
  authUser: User | null
  loading: boolean
}

const Ctx = createContext<SessionCtx>({} as SessionCtx)

/**
 * ✅ مصدر واحد لحالة Supabase Auth
 * ليش؟ لأنه كان عندنا أكثر من Provider يعمل getSession + onAuthStateChange بنفس الوقت
 * وهذا ممكن يسبب lock contention (Navigator.locks) ويعطي timeout.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    if (!isSupabaseConfigured()) {
      if (mounted.current) {
        setAuthUser(null)
        setLoading(false)
      }
      return () => {
        mounted.current = false
      }
    }

    let unsubscribed = false

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        const u = data.session?.user ?? null
        if (!unsubscribed && mounted.current) setAuthUser(u)
      } catch (e) {
        console.warn('[SessionContext] init error:', e)
        if (!unsubscribed && mounted.current) setAuthUser(null)
      } finally {
        if (!unsubscribed && mounted.current) setLoading(false)
      }
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (unsubscribed || !mounted.current) return
      setAuthUser(session?.user ?? null)
    })

    return () => {
      unsubscribed = true
      mounted.current = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({ authUser, loading }), [authUser, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useSession = () => useContext(Ctx)
