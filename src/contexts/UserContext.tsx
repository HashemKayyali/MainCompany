import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { getErrorMessage } from '../lib/errors'
import { clearAuthPersistence, isSupabaseConfigured, setAuthPersistence, supabase } from '../lib/supabase'
import {
  avatarSelectionToProfileUpdate,
  isAvatarSelectionEqual,
  normalizeAvatarSelection,
  sanitizeAvatarOptions,
  type AvatarFields,
  type AvatarSelection,
} from '../lib/avatar'
import {
  emitProfileUpdated,
  onProfileUpdated,
  type ProfileUpdatedDetail,
} from '../lib/profile-sync'
import {
  fetchProfileIdentityRow,
  isMissingAvatarColumnError,
  isMissingAvatarUrlColumnError,
  isMissingGeneratedAvatarColumnError,
  mapProfileAvatarFields,
} from '../services/profile.service'
import { withTimeout } from '../utils/with-timeout'
import { useSession } from './SessionContext'

export interface AppUser extends AvatarFields {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
  role?: string | null
}

export type AuthFlowResult =
  | {
      ok: true
      sessionReady: boolean
      requiresEmailConfirmation: boolean
      message: string
    }
  | {
      ok: false
      message: string
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
    pw: string
  ) => Promise<AuthFlowResult>
  login: (email: string, pw: string, rememberMe?: boolean) => Promise<AuthFlowResult>
  logout: () => Promise<void>
  updateProfile: (updates: {
    name?: string
    phone?: string
    avatarUrl?: string | null
    avatar?: AvatarSelection | null
  }) => Promise<string | true>
}

const Ctx = createContext<UserCtx>({} as UserCtx)

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

function hasDetailKey(detail: ProfileUpdatedDetail, key: keyof ProfileUpdatedDetail) {
  return Object.prototype.hasOwnProperty.call(detail, key)
}

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
      typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : null
    const metadataPhone =
      typeof metadata.phone === 'string' && metadata.phone.trim() ? metadata.phone.trim() : ''
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
      avatar_style: typeof metadata.avatarStyle === 'string' ? metadata.avatarStyle : null,
      avatar_seed: typeof metadata.avatarSeed === 'string' ? metadata.avatarSeed : null,
      avatar_options: sanitizeAvatarOptions(metadata.avatarOptions) ?? null,
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

  const mapIdentityRowToUser = useCallback(
    (data: Awaited<ReturnType<typeof fetchProfileIdentityRow>>): AppUser | null => {
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
    },
    []
  )

  const fetchProfile = useCallback(
    async (authAccount: User): Promise<AppUser | null> => {
      try {
        // Hard ceiling: never let a slow profile fetch hold the entire
        // UserContext (and therefore AdminGuard) in a loading state.
        const data = await withTimeout(
          fetchProfileIdentityRow(authAccount.id),
          8000,
          null,
          'fetchProfileIdentityRow'
        )
        return mapIdentityRowToUser(data)
      } catch (error) {
        console.warn('Failed to fetch profile:', error)
        return null
      }
    },
    [mapIdentityRowToUser]
  )

  const recoverMissingProfile = useCallback(
    async (authAccount: User): Promise<AppUser | null> => {
      const fallback = buildFallbackUser(authAccount)

      try {
        // The avatar_* columns were dropped from `profiles`
        // (20260515_drop_avatar_columns.sql), so they must never be written.
        // `role` is intentionally NOT written here: buildFallbackUser derives it
        // from user-controllable user_metadata, and this upsert INSERTs a new row
        // on recovery — the role-lock trigger is BEFORE UPDATE only and would not
        // catch a malicious role on INSERT. We let the DB default own the role.
        const { error } = await supabase.from('profiles').upsert(
          {
            id: authAccount.id,
            email: fallback.email,
            name: fallback.name,
            phone: fallback.phone || null,
          } as ProfileInsert,
          { onConflict: 'id' }
        )

        if (error) {
          console.warn('Failed to recover missing profile row:', error)
          return fallback
        }

        const refreshed = await fetchProfile(authAccount)
        return refreshed || fallback
      } catch (error) {
        console.warn('Profile recovery fallback failed:', error)
        return fallback
      }
    },
    [buildFallbackUser, fetchProfile]
  )

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
                name: hasDetailKey(detail, 'name') ? detail.name?.trim() || '' : prev.name,
                phone: hasDetailKey(detail, 'phone') ? detail.phone?.trim() || '' : prev.phone,
                avatarUrl: hasDetailKey(detail, 'avatarUrl')
                  ? detail.avatarUrl ?? null
                  : prev.avatarUrl,
                avatarStyle: hasDetailKey(detail, 'avatarStyle')
                  ? detail.avatarStyle ?? null
                  : prev.avatarStyle,
                avatarSeed: hasDetailKey(detail, 'avatarSeed')
                  ? detail.avatarSeed ?? null
                  : prev.avatarSeed,
                avatarOptions: hasDetailKey(detail, 'avatarOptions')
                  ? detail.avatarOptions ?? null
                  : prev.avatarOptions,
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
      } catch (error) {
        console.warn('UserContext sync error:', error)
        safeSet(() => setCurrentUser(null))
      } finally {
        safeSet(() => setLoading(false))
      }
    }

    void syncFromSession()

    return () => {
      mountedRef.current = false
    }
  }, [authUser, sessionLoading, syncCurrentUser])

  const waitForProfileRow = useCallback(async (userId: string) => {
    for (let index = 0; index < 6; index += 1) {
      const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
      if (data?.id) return true
      await new Promise(resolve => setTimeout(resolve, 400))
    }

    return false
  }, [])

  const register = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      pw: string
    ): Promise<AuthFlowResult> => {
      if (!isSupabaseConfigured()) {
        return { ok: false, message: 'Supabase not configured' }
      }

      if (pw.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters' }
      }

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
              phone,
            },
          },
        })

        if (authError) return { ok: false, message: authError.message }
        if (!authData.user) return { ok: false, message: 'Registration failed' }

        const sessionReady = Boolean(authData.session?.user)

        if (sessionReady) {
          const profileExists = await waitForProfileRow(authData.user.id)

          if (profileExists) {
            let { error: profileError } = await supabase
              .from('profiles')
              .update({
                phone: phone || null,
                name,
                email,
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
        }

        if (!sessionReady) {
          return {
            ok: true,
            sessionReady: false,
            requiresEmailConfirmation: true,
            message: 'Account created. Check your email to confirm your address before signing in.',
          }
        }

        return {
          ok: true,
          sessionReady: true,
          requiresEmailConfirmation: false,
          message: 'Account created successfully.',
        }
      } catch (error: unknown) {
        return { ok: false, message: getErrorMessage(error, 'Registration failed') }
      }
    },
    [waitForProfileRow]
  )

  const login = useCallback(
    async (email: string, pw: string, rememberMe = false): Promise<AuthFlowResult> => {
      if (!isSupabaseConfigured()) {
        return { ok: false, message: 'Supabase not configured' }
      }

      try {
        setAuthPersistence(rememberMe)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw })

        if (error) {
          return { ok: false, message: error.message }
        }

        if (!data.session?.user) {
          return {
            ok: false,
            message: 'Your session could not be established. Please try again.',
          }
        }

        return {
          ok: true,
          sessionReady: true,
          requiresEmailConfirmation: false,
          message: 'Signed in successfully.',
        }
      } catch (error: unknown) {
        return { ok: false, message: getErrorMessage(error, 'Login failed') }
      }
    },
    []
  )

  const updateProfile = useCallback(
    async (updates: {
      name?: string
      phone?: string
      avatarUrl?: string | null
      avatar?: AvatarSelection | null
    }): Promise<string | true> => {
      const targetId = authUser?.id || currentUser?.id
      if (!targetId) return 'You need to sign in first'

      const hasNameUpdate = Object.prototype.hasOwnProperty.call(updates, 'name')
      const hasPhoneUpdate = Object.prototype.hasOwnProperty.call(updates, 'phone')
      const hasAvatarUrlUpdate = Object.prototype.hasOwnProperty.call(updates, 'avatarUrl')
      const hasAvatarUpdate = Object.prototype.hasOwnProperty.call(updates, 'avatar')
      const currentName = currentUser?.name?.trim() || ''
      const currentPhone = currentUser?.phone?.trim() || ''
      const currentAvatarUrl = currentUser?.avatarUrl?.trim() || ''
      const currentAvatarSelection = normalizeAvatarSelection(currentUser)
      const nextName = hasNameUpdate ? updates.name?.trim() || '' : currentName
      const nextPhone = hasPhoneUpdate ? updates.phone?.trim() || '' : currentPhone
      const nextAvatarUrl = hasAvatarUrlUpdate ? updates.avatarUrl?.trim() || '' : currentAvatarUrl
      const nextAvatarSelection = hasAvatarUpdate
        ? normalizeAvatarSelection(updates.avatar ?? null)
        : currentAvatarSelection
      const payload: ProfileUpdate = {}

      if (hasNameUpdate && nextName !== currentName) {
        payload.name = nextName || null
      }

      if (hasPhoneUpdate && nextPhone !== currentPhone) {
        payload.phone = nextPhone || null
      }

      // Avatar columns were dropped from `profiles`
      // (20260515_drop_avatar_columns.sql): never write them. The avatarUrl /
      // avatar params are accepted but ignored at the DB layer; only name and
      // phone are persisted.

      if (!Object.keys(payload).length) {
        return true
      }

      const baseUser = currentUser || (authUser ? buildFallbackUser(authUser) : null)
      const optimisticUser = baseUser
        ? {
            ...baseUser,
            ...(hasNameUpdate ? { name: nextName } : {}),
            ...(hasPhoneUpdate ? { phone: nextPhone } : {}),
            ...(hasAvatarUrlUpdate ? { avatarUrl: nextAvatarUrl || null } : {}),
            ...(hasAvatarUpdate
              ? {
                  avatarStyle: nextAvatarSelection?.avatarStyle ?? null,
                  avatarSeed: nextAvatarSelection?.avatarSeed ?? null,
                  avatarOptions: nextAvatarSelection?.avatarOptions ?? null,
                }
              : {}),
          }
        : null

      try {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', targetId)

        if (error) return error.message

        safeSet(() => setCurrentUser(optimisticUser || currentUser || null))

        const refreshTarget =
          authUser ||
          (optimisticUser
            ? ({
                id: optimisticUser.id,
                email: optimisticUser.email,
                app_metadata: {},
                user_metadata: {
                  name: optimisticUser.name,
                  phone: optimisticUser.phone,
                },
                aud: 'authenticated',
                created_at: optimisticUser.createdAt,
              } as User)
            : null)

        const refreshed = refreshTarget ? await fetchProfile(refreshTarget) : null
        const finalUser = refreshed || optimisticUser || currentUser || null

        safeSet(() => setCurrentUser(finalUser))
        if (finalUser) {
          emitProfileUpdated({
            userId: finalUser.id,
            name: finalUser.name,
            phone: finalUser.phone,
            avatarUrl: finalUser.avatarUrl,
            avatarStyle: finalUser.avatarStyle,
            avatarSeed: finalUser.avatarSeed,
            avatarOptions: finalUser.avatarOptions,
          })
        }

        return true
      } catch (error: unknown) {
        return getErrorMessage(error, 'Failed to update profile')
      }
    },
    [authUser, buildFallbackUser, currentUser, fetchProfile]
  )

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
    } catch (error) {
      console.warn('Failed to sign out cleanly:', error)
    } finally {
      clearAuthPersistence()
      safeSet(() => setCurrentUser(null))
    }
  }, [])

  const isLoggedIn = !!authUser
  const isAdmin = !!currentUser && isAdminRole(currentUser.role)

  const value = useMemo<UserCtx>(
    () => ({
      currentUser,
      isLoggedIn,
      isAdmin,
      loading,
      register,
      login,
      logout,
      updateProfile,
    }),
    [currentUser, isLoggedIn, isAdmin, loading, register, login, logout, updateProfile]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useUser = () => useContext(Ctx)
