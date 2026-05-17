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

    // Hard safety: if Supabase auth.getSession() hangs (slow Wi-Fi,
    // corporate firewall blocking *.supabase.co, etc.) the whole app
    // would otherwise stay frozen on the PageLoader forever. Treat any
    // session lookup that takes longer than 7s as "no session" and
    // unblock rendering. If the real session resolves later the
    // onAuthStateChange listener below will pick it up and update state.
    const SESSION_TIMEOUT_MS = 7000

    async function init() {
      let settled = false
      const timeout = new Promise<{ data: { session: null } }>(resolve => {
        window.setTimeout(() => {
          if (!settled) {
            console.warn(
              `[SessionContext] getSession() timed out after ${SESSION_TIMEOUT_MS}ms — assuming no session.`
            )
            resolve({ data: { session: null } })
          }
        }, SESSION_TIMEOUT_MS)
      })

      try {
        const result = await Promise.race([
          supabase.auth.getSession().finally(() => {
            settled = true
          }),
          timeout,
        ])
        const session = (result as { data: { session: { user: User } | null } }).data.session
        if (!unsubscribed && mounted.current) setAuthUser(session?.user ?? null)
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
      const nextUser = session?.user ?? null
      // Keep the SAME object reference when the signed-in user has not
      // actually changed (Supabase fires TOKEN_REFRESHED / SIGNED_IN on
      // tab refocus). Emitting a fresh reference for the same user would
      // cascade: UserContext re-runs and flips loading→true, AdminGuard
      // swaps the page for <PageLoader/>, the page unmounts, and any open
      // modal / unsaved form is destroyed. Only emit on a real change
      // (sign-in / sign-out / account switch).
      setAuthUser(prev =>
        prev?.id && nextUser?.id && prev.id === nextUser.id ? prev : nextUser
      )
      // Also flip loading off in case the timeout fired before the real
      // session arrived — the listener is the authoritative source.
      setLoading(false)
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
