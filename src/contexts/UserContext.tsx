import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { clearAuthPersistence, setAuthPersistence, supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import {
  avatarSelectionToProfileUpdate,
  sanitizeAvatarOptions,
  type AvatarFields,
  type AvatarSelection,
} from '../lib/avatar'
import {
  fetchProfileIdentityRow,
  isMissingAvatarColumnError,
  mapProfileAvatarFields,
} from '../services/profile.service'
import { emitProfileUpdated, onProfileUpdated } from '../lib/profile-sync'
import { useSession } from './SessionContext'

export interface AppUser extends AvatarFields {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
  role?: string | null
}

interface UserCtx {
  currentUser: AppUser | null
  isLoggedIn: boolean
  isAdmin: boolean
  loading: boolean
  register: (
    name: string,
    email: string,
    phone: string,
    pw: string,
    avatar?: AvatarSelection | null
  ) => Promise<string | true>
  login: (email: string, pw: string, rememberMe?: boolean) => Promise<string | true>
  logout: () => void
  updateProfile: (updates: {
    name: string
    phone: string
    avatar?: AvatarSelection | null
  }) => Promise<string | true>
}

const Ctx = createContext<UserCtx>({} as UserCtx)

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function UserProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: sessionLoading } = useSession()
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const safeSet = (fn: () => void) => {
    if (mountedRef.current) fn()
  }

  const isAdminRole = (role: unknown) => role === 'admin' || role === 'superadmin'

  const buildFallbackUser = useCallback((authAccount: User): AppUser => {
    const metadata = authAccount.user_metadata || {}
    const metadataName =
      typeof metadata.name === 'string' && metadata.name.trim()
        ? metadata.name.trim()
        : null
    const metadataPhone =
      typeof metadata.phone === 'string' && metadata.phone.trim()
        ? metadata.phone.trim()
        : ''
    const metadataRole =
      typeof metadata.role === 'string' && metadata.role.trim() ? metadata.role.trim() : null
    const avatar = mapProfileAvatarFields({
      avatar_url:
        typeof metadata.avatarUrl === 'string'
          ? metadata.avatarUrl
          : typeof metadata.avatar_url === 'string'
            ? metadata.avatar_url
            : typeof metadata.picture === 'string'
              ? metadata.picture
              : null,
      avatar_style:
        typeof metadata.avatarStyle === 'string' ? metadata.avatarStyle : null,
      avatar_seed:
        typeof metadata.avatarSeed === 'string' ? metadata.avatarSeed : null,
      avatar_options:
        sanitizeAvatarOptions(metadata.avatarOptions) ?? null,
    })

    return {
      id: authAccount.id,
      email: authAccount.email || '',
      name: metadataName || authAccount.email?.split('@')[0] || 'User',
      phone: metadataPhone,
      createdAt: authAccount.created_at || new Date().toISOString(),
      role: metadataRole,
      ...avatar,
    }
  }, [])

  const mapIdentityRowToUser = useCallback((data: Awaited<ReturnType<typeof fetchProfileIdentityRow>>): AppUser | null => {
    if (!data) return null
    return {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      phone: data.phone || '',
      createdAt: data.created_at,
      role: data.role ?? null,
      ...mapProfileAvatarFields(data),
    }
  }, [])

  const fetchProfile = useCallback(async (authAccount: User): Promise<AppUser | null> => {
    try {
      const data = await fetchProfileIdentityRow(authAccount.id)
      return mapIdentityRowToUser(data)
    } catch (err) {
      console.warn('Failed to fetch profile:', err)
      return null
    }
  }, [mapIdentityRowToUser])

  const recoverMissingProfile = useCallback(async (authAccount: User): Promise<AppUser | null> => {
    const fallback = buildFallbackUser(authAccount)

    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: authAccount.id,
          email: fallback.email,
          name: fallback.name,
          phone: fallback.phone || null,
          avatar_url: fallback.avatarUrl ?? null,
          avatar_style: fallback.avatarStyle ?? null,
          avatar_seed: fallback.avatarSeed ?? null,
          avatar_options: fallback.avatarOptions ?? null,
        } as ProfileInsert,
        { onConflict: 'id' }
      )

      if (error) {
        console.warn('Failed to recover missing profile row:', error)
        return fallback
      }

      const refreshed = await fetchProfile(authAccount)
      return refreshed || fallback
    } catch (err) {
      console.warn('Profile recovery fallback failed:', err)
      return fallback
    }
  }, [buildFallbackUser, fetchProfile])

  const syncCurrentUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      safeSet(() => {
        setCurrentUser(null)
        setLoading(false)
      })
      return
    }

    if (!authUser) {
      safeSet(() => setCurrentUser(null))
      return
    }

    const profile = await fetchProfile(authUser)
    if (profile) {
      safeSet(() => setCurrentUser(profile))
      return
    }

    const recovered = await recoverMissingProfile(authUser)
        safeSet(() => setCurrentUser(recovered))
  }, [authUser, fetchProfile, recoverMissingProfile])

  useEffect(() => {
    return onProfileUpdated(detail => {
      safeSet(() =>
        setCurrentUser(prev =>
          prev && prev.id === detail.userId
            ? {
                ...prev,
                name: detail.name?.trim() || prev.name,
                phone: detail.phone?.trim() || prev.phone,
                avatarUrl: detail.avatarUrl ?? prev.avatarUrl,
                avatarStyle: detail.avatarStyle ?? prev.avatarStyle,
                avatarSeed: detail.avatarSeed ?? prev.avatarSeed,
                avatarOptions: detail.avatarOptions ?? prev.avatarOptions,
              }
            : prev
        )
      )
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true

    async function syncFromSession() {
      if (!isSupabaseConfigured()) {
        safeSet(() => {
          setCurrentUser(null)
          setLoading(false)
        })
        return
      }

      if (sessionLoading) {
        safeSet(() => setLoading(true))
        return
      }

      try {
        if (!authUser) {
          safeSet(() => setCurrentUser(null))
          return
        }

        safeSet(() => setLoading(true))
        await syncCurrentUser()
      } catch (err) {
        console.warn('UserContext sync error:', err)
        safeSet(() => setCurrentUser(null))
      } finally {
        safeSet(() => setLoading(false))
      }
    }

    syncFromSession()

    return () => {
      mountedRef.current = false
    }
  }, [authUser, sessionLoading, syncCurrentUser])

  const waitForProfileRow = useCallback(async (userId: string) => {
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
      if (data?.id) return true
      await new Promise(r => setTimeout(r, 400))
    }
    return false
  }, [])

  const register = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      pw: string,
      avatar?: AvatarSelection | null
    ): Promise<string | true> => {
      if (!isSupabaseConfigured()) return 'Supabase not configured'
      if (pw.length < 6) return 'Password must be at least 6 characters'

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
              phone,
              avatarStyle: avatar?.avatarStyle ?? null,
              avatarSeed: avatar?.avatarSeed ?? null,
              avatarOptions: avatar?.avatarOptions ?? null,
            },
          },
        })

        if (authError) return authError.message
        if (!authData.user) return 'Registration failed'

        const ok = await waitForProfileRow(authData.user.id)
        if (ok) {
          let { error: profileError } = await supabase
            .from('profiles')
            .update({
              phone: phone || null,
              name,
              email,
              ...avatarSelectionToProfileUpdate(avatar),
            } as ProfileUpdate)
            .eq('id', authData.user.id)

          if (profileError && isMissingAvatarColumnError(profileError)) {
            const retry = await supabase
              .from('profiles')
              .update({
                phone: phone || null,
                name,
                email,
              } as ProfileUpdate)
              .eq('id', authData.user.id)
            profileError = retry.error
          }

          if (profileError) {
            console.warn('Profile enrichment after signup failed:', profileError)
          }
        }

        return true
      } catch (err: any) {
        return err.message || 'Registration failed'
      }
    },
    [waitForProfileRow]
  )

  // ✅ Login موحّد للجميع (admin/user) — ما بنطرد الأدمن
  const login = useCallback(async (email: string, pw: string, rememberMe = false): Promise<string | true> => {
    if (!isSupabaseConfigured()) return 'Supabase not configured'

    try {
      setAuthPersistence(rememberMe)
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) return error.message

      // ✅ نجيب البروفايل ونخزنه (فيه role)
      return true
    } catch (err: any) {
      return err.message || 'Login failed'
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: {
      name: string
      phone: string
      avatar?: AvatarSelection | null
    }): Promise<string | true> => {
      const targetId = authUser?.id || currentUser?.id
      if (!targetId) return 'You need to sign in first'

      const basePayload: ProfileUpdate = {
        name: updates.name.trim() || null,
        phone: updates.phone.trim() || null,
      }
      const avatarPayload = avatarSelectionToProfileUpdate(updates.avatar)

      try {
        let { error } = await supabase
          .from('profiles')
          .update({
            ...basePayload,
            ...avatarPayload,
          } as ProfileUpdate)
          .eq('id', targetId)

        if (error && isMissingAvatarColumnError(error)) {
          const retry = await supabase
            .from('profiles')
            .update(basePayload)
            .eq('id', targetId)
          error = retry.error
        }

        if (error) return error.message

        const refreshed =
          (authUser && (await fetchProfile(authUser))) ||
          (currentUser ? await fetchProfile({
            id: currentUser.id,
            email: currentUser.email,
            app_metadata: {},
            user_metadata: {
              name: currentUser.name,
              phone: currentUser.phone,
            },
            aud: 'authenticated',
            created_at: currentUser.createdAt,
          } as User) : null)

        safeSet(() => setCurrentUser(refreshed || currentUser || null))
        if (refreshed) {
          emitProfileUpdated({
            userId: refreshed.id,
            name: refreshed.name,
            phone: refreshed.phone,
            avatarUrl: refreshed.avatarUrl,
            avatarStyle: refreshed.avatarStyle,
            avatarSeed: refreshed.avatarSeed,
            avatarOptions: refreshed.avatarOptions,
          })
        }
        return true
      } catch (err: any) {
        return err?.message || 'Failed to update profile'
      }
    },
    [authUser, currentUser, fetchProfile]
  )

  const logout = useCallback(() => {
    if (isSupabaseConfigured()) supabase.auth.signOut()
    clearAuthPersistence()
    safeSet(() => setCurrentUser(null))
  }, [])

  const isLoggedIn = !!authUser
  const isAdmin = !!currentUser && isAdminRole(currentUser.role)

  return (
    <Ctx.Provider
      value={{
        currentUser,
        isLoggedIn,
        isAdmin,
        loading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useUser = () => useContext(Ctx)
