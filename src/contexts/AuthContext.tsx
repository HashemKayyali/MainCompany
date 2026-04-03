import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AvatarFields } from '../lib/avatar'
import type { Database } from '../lib/database.types'
import { onProfileUpdated, type ProfileUpdatedDetail } from '../lib/profile-sync'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  fetchProfileAvatarMap,
  fetchProfileIdentityRow,
  mapProfileAvatarFields,
} from '../services/profile.service'
import { useSession } from './SessionContext'

export type AdminRole = 'admin' | 'superadmin'

export interface AdminUser extends AvatarFields {
  id: string
  email: string
  name: string
  role: AdminRole
  createdAt?: string
}

interface AuthCtx {
  user: AdminUser | null
  isAuth: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean
  admins: AdminUser[]
  addAdmin: (email: string, name: string, role: AdminRole) => Promise<boolean>
  removeAdmin: (id: string) => Promise<boolean>
  changeAdminRole: (id: string, newRole: AdminRole) => Promise<boolean>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

type GetAllAdminsRow = Database['public']['Functions']['get_all_admins']['Returns'][number]
type SetAdminRoleResponse = Database['public']['Functions']['set_admin_role']['Returns']
type RemoveAdminResponse = Database['public']['Functions']['remove_admin']['Returns']

function hasDetailKey(detail: ProfileUpdatedDetail, key: keyof ProfileUpdatedDetail) {
  return Object.prototype.hasOwnProperty.call(detail, key)
}

async function fetchProfileIdentity(
  userId: string
): Promise<{
  role: string | null
  name: string | null
  avatarUrl: string | null
  avatarStyle: string | null
  avatarSeed: string | null
  avatarOptions: AvatarFields['avatarOptions']
}> {
  const data = await fetchProfileIdentityRow(userId)

  if (!data) {
    return {
      role: null,
      name: null,
      avatarUrl: null,
      avatarStyle: null,
      avatarSeed: null,
      avatarOptions: null,
    }
  }

  return {
    role: data.role ?? null,
    name: data.name ?? null,
    ...mapProfileAvatarFields(data),
  }
}

function rpcSucceeded(result: { ok: boolean; error?: string } | null) {
  return !!result?.ok
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: sessionLoading } = useSession()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])

  const resolveAdmin = useCallback(
    async (sessionUser: { id: string; email?: string } | null): Promise<AdminUser | null> => {
      if (!sessionUser) return null

      const profile = await fetchProfileIdentity(sessionUser.id)
      if (profile.role !== 'admin' && profile.role !== 'superadmin') return null

      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: profile.name || sessionUser.email || 'Admin',
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        avatarStyle: profile.avatarStyle,
        avatarSeed: profile.avatarSeed,
        avatarOptions: profile.avatarOptions,
      }
    },
    []
  )

  const fetchAllAdmins = useCallback(async (): Promise<AdminUser[]> => {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_admins')

      if (!rpcError && Array.isArray(rpcData)) {
        const avatarMap = await fetchProfileAvatarMap(rpcData.map(row => row.id))
        return rpcData.map((row: GetAllAdminsRow) => ({
          id: row.id,
          email: row.email || '',
          name: row.name || row.email || 'Admin',
          role: row.role as AdminRole,
          createdAt: row.created_at,
          ...(avatarMap[row.id] || {}),
        }))
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .in('role', ['admin', 'superadmin'])

      if (error || !data) return []

      const avatarMap = await fetchProfileAvatarMap(data.map(row => row.id))
      return data.map(row => ({
        id: row.id,
        email: row.email || '',
        name: row.name || row.email || 'Admin',
        role: row.role as AdminRole,
        createdAt: row.created_at,
        ...(avatarMap[row.id] || {}),
      }))
    } catch (error) {
      console.warn('[AuthContext] Failed to fetch admins:', error)
      return []
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function syncFromSession() {
      try {
        if (!isSupabaseConfigured()) {
          if (mounted) {
            setUser(null)
            setAdmins([])
            setLoading(false)
          }
          return
        }

        if (sessionLoading) {
          if (mounted) setLoading(true)
          return
        }

        const adminUser = await resolveAdmin(authUser ? { id: authUser.id, email: authUser.email } : null)
        const allAdmins = adminUser ? await fetchAllAdmins() : []

        if (mounted) {
          setUser(adminUser)
          setAdmins(allAdmins)
          setLoading(false)
        }
      } catch (error) {
        console.warn('[AuthContext] sync error:', error)
        if (mounted) {
          setUser(null)
          setAdmins([])
          setLoading(false)
        }
      }
    }

    void syncFromSession()

    return () => {
      mounted = false
    }
  }, [authUser, fetchAllAdmins, resolveAdmin, sessionLoading])

  useEffect(() => {
    return onProfileUpdated(detail => {
      setUser(prev =>
        prev && prev.id === detail.userId
          ? {
              ...prev,
              name: hasDetailKey(detail, 'name') ? detail.name?.trim() || '' : prev.name,
              avatarUrl: hasDetailKey(detail, 'avatarUrl') ? detail.avatarUrl ?? null : prev.avatarUrl,
              avatarStyle: hasDetailKey(detail, 'avatarStyle') ? detail.avatarStyle ?? null : prev.avatarStyle,
              avatarSeed: hasDetailKey(detail, 'avatarSeed') ? detail.avatarSeed ?? null : prev.avatarSeed,
              avatarOptions: hasDetailKey(detail, 'avatarOptions') ? detail.avatarOptions ?? null : prev.avatarOptions,
            }
          : prev
      )

      setAdmins(prev =>
        prev.map(admin =>
          admin.id === detail.userId
            ? {
                ...admin,
                name: hasDetailKey(detail, 'name') ? detail.name?.trim() || '' : admin.name,
                avatarUrl: hasDetailKey(detail, 'avatarUrl') ? detail.avatarUrl ?? null : admin.avatarUrl,
                avatarStyle: hasDetailKey(detail, 'avatarStyle') ? detail.avatarStyle ?? null : admin.avatarStyle,
                avatarSeed: hasDetailKey(detail, 'avatarSeed') ? detail.avatarSeed ?? null : admin.avatarSeed,
                avatarOptions: hasDetailKey(detail, 'avatarOptions') ? detail.avatarOptions ?? null : admin.avatarOptions,
              }
            : admin
        )
      )
    })
  }, [])

  const addAdmin = useCallback(
    async (email: string, _name: string, role: AdminRole): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail) return false
      if (admins.some(admin => admin.email.trim().toLowerCase() === cleanEmail)) return false

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (!existingProfile?.id) {
        return false
      }

      const { data, error } = await supabase.rpc('set_admin_role', {
        target_id: existingProfile.id,
        new_role: role,
      })

      const result = data as SetAdminRoleResponse | null

      if (error) {
        console.error('[AuthContext] set_admin_role RPC error:', error)
        return false
      }

      if (!rpcSucceeded(result)) {
        console.warn('[AuthContext] set_admin_role failed:', result?.error)
        return false
      }

      setAdmins(await fetchAllAdmins())
      return true
    },
    [admins, fetchAllAdmins]
  )

  const changeAdminRole = useCallback(
    async (id: string, newRole: AdminRole): Promise<boolean> => {
      try {
        const { data, error } = await supabase.rpc('set_admin_role', {
          target_id: id,
          new_role: newRole,
        })

        const result = data as SetAdminRoleResponse | null

        if (error) {
          console.error('[AuthContext] changeAdminRole RPC error:', error)
          return false
        }

        if (!rpcSucceeded(result)) {
          console.warn('[AuthContext] changeAdminRole failed:', result?.error)
          return false
        }

        setAdmins(await fetchAllAdmins())
        return true
      } catch (error) {
        console.error('[AuthContext] changeAdminRole error:', error)
        return false
      }
    },
    [fetchAllAdmins]
  )

  const removeAdmin = useCallback(
    async (id: string): Promise<boolean> => {
      if (id === user?.id) return false

      try {
        const { data, error } = await supabase.rpc('remove_admin', { target_id: id })
        const result = data as RemoveAdminResponse | null

        if (error) {
          console.error('[AuthContext] remove_admin RPC error:', error)
          return false
        }

        if (!rpcSucceeded(result)) {
          console.warn('[AuthContext] remove_admin failed:', result?.error)
          return false
        }

        setAdmins(await fetchAllAdmins())
        return true
      } catch (error) {
        console.error('[AuthContext] removeAdmin error:', error)
        setAdmins(prev => prev.filter(admin => admin.id !== id))
        return true
      }
    },
    [fetchAllAdmins, user?.id]
  )

  const value = useMemo<AuthCtx>(() => {
    const isSuperAdmin = user?.role === 'superadmin'

    return {
      user,
      admins,
      isAuth: !!user,
      isAdmin: !!user,
      isSuperAdmin,
      loading,
      addAdmin,
      removeAdmin,
      changeAdminRole,
    }
  }, [addAdmin, admins, changeAdminRole, loading, removeAdmin, user])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
