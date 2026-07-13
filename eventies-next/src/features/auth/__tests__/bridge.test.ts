// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * AUTHP-001 unit layer — the PURE bridge logic (storage reading, remember-me
 * inference, soft failure). The experimental questions Q1–Q8 are NOT answered
 * here: they require the proven topology (ROUTE-010 gate) — see
 * reports/p1b-evidence/ runbooks.
 */

const mocks = vi.hoisted(() => ({
  getClient: vi.fn(),
  getSession: vi.fn(),
  setSession: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('@/lib/supabase-browser', () => ({
  getSupabaseBrowserClient: (persistence?: string) => {
    mocks.getClient(persistence)
    return {
      auth: {
        getSession: mocks.getSession,
        setSession: mocks.setSession,
        getUser: mocks.getUser,
      },
    }
  },
}))

import { inferRememberMe, legacyStorageKey, readLegacyTokens, runAuthBridge } from '../bridge'

const TOKEN_KEY = legacyStorageKey('https://dqizzlcsioqykfeldtsj.supabase.co')
const VALID_BLOB = JSON.stringify({ access_token: 'at-1', refresh_token: 'rt-1' })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie = 'ev-bridge-adopted=; path=/; max-age=0'
  mocks.getClient.mockReset()
  mocks.getSession.mockReset().mockResolvedValue({ data: { session: null } })
  mocks.setSession.mockReset()
  mocks.getUser.mockReset()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dqizzlcsioqykfeldtsj.supabase.co'
})

describe('legacy storage layout', () => {
  it('derives the exact legacy key from the project ref', () => {
    expect(TOKEN_KEY).toBe('sb-dqizzlcsioqykfeldtsj-auth-token')
  })

  it('reads tokens from localStorage first, then sessionStorage', () => {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token: 'ss', refresh_token: 'ss-r' }))
    expect(readLegacyTokens(localStorage, sessionStorage, TOKEN_KEY)?.access_token).toBe('ss')
    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    expect(readLegacyTokens(localStorage, sessionStorage, TOKEN_KEY)?.access_token).toBe('at-1')
  })

  it('rejects malformed blobs without throwing', () => {
    localStorage.setItem(TOKEN_KEY, 'not-json')
    expect(readLegacyTokens(localStorage, sessionStorage, TOKEN_KEY)).toBeNull()
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token: 42 }))
    expect(readLegacyTokens(localStorage, sessionStorage, TOKEN_KEY)).toBeNull()
  })
})

describe('remember-me inference (mirrors legacy getStoredPersistenceMode)', () => {
  it('persistent marker → true; session marker → false; token-in-local → true; default → true', () => {
    localStorage.setItem('bl-auth-persistence', 'persistent')
    expect(inferRememberMe(localStorage, sessionStorage, TOKEN_KEY)).toBe(true)
    localStorage.clear()

    sessionStorage.setItem('bl-auth-persistence', 'session')
    expect(inferRememberMe(localStorage, sessionStorage, TOKEN_KEY)).toBe(false)
    sessionStorage.clear()

    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    expect(inferRememberMe(localStorage, sessionStorage, TOKEN_KEY)).toBe(true)
    localStorage.clear()

    expect(inferRememberMe(localStorage, sessionStorage, TOKEN_KEY)).toBe(true)
  })
})

describe('runAuthBridge soft-failure guarantees', () => {
  it('no legacy token → no-legacy-session, storages untouched', async () => {
    const result = await runAuthBridge()
    expect(result.status).toBe('no-legacy-session')
    expect(mocks.setSession).not.toHaveBeenCalled()
  })

  it('adopts a valid legacy session and NEVER clears legacy keys (Q3/Q7 invariant)', async () => {
    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    localStorage.setItem('bl-auth-persistence', 'persistent')
    mocks.setSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

    const result = await runAuthBridge()
    expect(result).toEqual({ status: 'adopted', rememberMe: true, userId: 'u1' })
    // THE invariant: legacy keys still present, byte-identical.
    expect(localStorage.getItem(TOKEN_KEY)).toBe(VALID_BLOB)
    expect(localStorage.getItem('bl-auth-persistence')).toBe('persistent')
    expect(document.cookie).toContain('ev-bridge-adopted=1')
  })

  it('sets session persistence before adopting a session-scoped legacy token', async () => {
    sessionStorage.setItem(TOKEN_KEY, VALID_BLOB)
    sessionStorage.setItem('bl-auth-persistence', 'session')
    mocks.setSession.mockResolvedValue({ data: { session: { user: { id: 'u2' } } }, error: null })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u2' } }, error: null })

    const result = await runAuthBridge()

    expect(result).toEqual({ status: 'adopted', rememberMe: false, userId: 'u2' })
    expect(mocks.getClient).toHaveBeenCalledWith('session')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe(VALID_BLOB)
  })

  it('expired/invalid refresh token → soft failed, no loop, keys untouched (Q4/Q6 shape)', async () => {
    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    mocks.setSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid Refresh Token' },
    })

    const result = await runAuthBridge()
    expect(result.status).toBe('failed')
    expect(localStorage.getItem(TOKEN_KEY)).toBe(VALID_BLOB)
    expect(document.cookie).not.toContain('ev-bridge-adopted=1')
  })

  it('setSession throwing → failed result, never a thrown error (Q6)', async () => {
    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    mocks.setSession.mockRejectedValue(new Error('network down'))
    const result = await runAuthBridge()
    expect(result.status).toBe('failed')
  })

  it('existing cookie session is never disturbed (Q1 no-unwanted-logout shape)', async () => {
    localStorage.setItem(TOKEN_KEY, VALID_BLOB)
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'existing' } } } })
    const result = await runAuthBridge()
    expect(result).toEqual({ status: 'skipped', reason: 'already-adopted' })
    expect(mocks.setSession).not.toHaveBeenCalled()
  })

  it('adopted flag suppresses re-runs', async () => {
    document.cookie = 'ev-bridge-adopted=1; path=/'
    const result = await runAuthBridge()
    expect(result).toEqual({ status: 'skipped', reason: 'already-adopted' })
    expect(mocks.getSession).not.toHaveBeenCalled()
  })
})
