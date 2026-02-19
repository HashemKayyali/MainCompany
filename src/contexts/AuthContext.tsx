import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin'
  createdAt?: string
}

interface AuthCtx {
  user: AdminUser | null
  isAuth: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>

  // موجودين عشان صفحاتك ما تنكسر (لكن إدارة الأدمنز صارت يدويًا من Supabase)
  admins: AdminUser[]
  isSuperAdmin: boolean
  addAdmin: () => boolean
  removeAdmin: () => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

async function fetchProfileRole(
  userId: string
): Promise<{ role: string | null; name: string | null }> {
  type ProfilePick = { role: string | null; name: string | null }

  const { data, error } = (await supabase
    .from('profiles' as any) // ✅ bypass types until database.types includes profiles
    .select('role,name')
    .eq('id', userId)
    .maybeSingle()) as { data: ProfilePick | null; error: any }

  if (error) return { role: null, name: null }
  return { role: data?.role ?? null, name: data?.name ?? null }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])

  // Restore session + listen changes
  useEffect(() => {
    let mounted = true

    async function init() {
      if (!isSupabaseConfigured()) {
        // إذا ما فيه env مضبوط، خلّي الأدمن “مقفول”
        if (mounted) {
          setUser(null)
          setAdmins([])
          setLoading(false)
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null

      if (sessionUser) {
        const prof = await fetchProfileRole(sessionUser.id)
        if (prof.role === 'admin') {
          const u: AdminUser = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            name: prof.name || sessionUser.email || 'Admin',
            role: 'admin',
          }
          if (mounted) setUser(u)
        } else {
          // مستخدم مو أدمن => ما إله دخول على لوحة الأدمن
          await supabase.auth.signOut()
          if (mounted) setUser(null)
        }
      } else {
        if (mounted) setUser(null)
      }

      // (اختياري) قائمة الأدمنز للعرض فقط
      // نجيب كل profiles.role=admin (قراءة مسموحة للمصادق؟ عندنا profiles_read_own فقط، فبنخليها فاضية)
      // بما إن RLS على profiles تسمح قراءة صفك فقط، خلّي admins = [user]
      if (mounted) setAdmins(prev => (user ? [user] : []))

      if (mounted) setLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const sessionUser = session?.user ?? null
      setLoading(true)

      if (!sessionUser) {
        setUser(null)
        setAdmins([])
        setLoading(false)
        return
      }

      const prof = await fetchProfileRole(sessionUser.id)
      if (prof.role !== 'admin') {
        await supabase.auth.signOut()
        setUser(null)
        setAdmins([])
        setLoading(false)
        return
      }

      const u: AdminUser = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: prof.name || sessionUser.email || 'Admin',
        role: 'admin',
      }
      setUser(u)
      setAdmins([u])
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, message: 'Supabase is not configured. Check your .env file.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return { ok: false, message: error?.message || 'Login failed' }

    const prof = await fetchProfileRole(data.user.id)
    if (prof.role !== 'admin') {
      await supabase.auth.signOut()
      return { ok: false, message: 'This account is not an admin.' }
    }

    // onAuthStateChange رح يحدّث الstate تلقائيًا
    return { ok: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAdmins([])
  }

  const value = useMemo<AuthCtx>(() => {
    return {
      user,
      admins,
      isAuth: !!user,
      isAdmin: !!user,
      loading,
      login,
      logout,

      // legacy fields for existing UI (no admin management from UI)
      isSuperAdmin: false,
      addAdmin: () => false,
      removeAdmin: () => {},
    }
  }, [user, admins, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
