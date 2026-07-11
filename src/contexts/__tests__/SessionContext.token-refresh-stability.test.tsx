// @vitest-environment jsdom
import { act } from 'react'
import { memo, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

/**
 * AU-RS (BASE-010) — TOKEN_REFRESHED reference-stability regression test.
 *
 * Encodes the load-bearing behavior of SessionContext.tsx:87-89: when Supabase
 * re-emits the same signed-in user (TOKEN_REFRESHED / SIGNED_IN on tab
 * refocus), the context must keep the PREVIOUS user object reference so no
 * consumer cascade fires (UserContext reload → guard loader → page unmount)
 * and an open modal survives. This is the contract AUTH-006 must reproduce in
 * the Next app.
 */

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  authCallback: null as AuthCallback | null,
}))

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mocks.getSession(...args),
      onAuthStateChange: (cb: AuthCallback) => {
        mocks.authCallback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
    },
  },
}))

import { SessionProvider, useSession } from '../SessionContext'

function makeUser(id: string): User {
  return {
    id,
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  } as User
}

function makeSession(user: User): Session {
  return {
    user,
    access_token: `token-${user.id}-${Date.now()}`,
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
  } as Session
}

const seenUserRefs: Array<User | null> = []
let modalMountCount = 0

/** Stand-in for an open modal: counts mounts; a remount = the legacy bug. */
const ModalStandIn = memo(function ModalStandIn({ userId }: { userId: string }) {
  useEffect(() => {
    modalMountCount += 1
  }, [])
  return <div data-testid="modal">modal open for {userId}</div>
})

function Consumer() {
  const { authUser, loading } = useSession()
  seenUserRefs.push(authUser)
  if (loading) return <div data-testid="loading" />
  if (!authUser) return <div data-testid="anon" />
  return <ModalStandIn userId={authUser.id} />
}

let container: HTMLDivElement
let root: Root

async function renderProvider() {
  await act(async () => {
    root.render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>
    )
  })
  // Let the mocked getSession promise resolve and state settle.
  await act(async () => {
    await Promise.resolve()
  })
}

describe('AU-RS: TOKEN_REFRESHED keeps user object identity', () => {
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.authCallback = null
    mocks.getSession.mockReset()
    seenUserRefs.length = 0
    modalMountCount = 0
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('re-emitting the same user id preserves the reference and the open modal survives', async () => {
    const userA = makeUser('user-a')
    mocks.getSession.mockResolvedValue({ data: { session: makeSession(userA) } })

    await renderProvider()

    expect(container.querySelector('[data-testid="modal"]')?.textContent).toContain('user-a')
    expect(mocks.authCallback, 'listener registered').toBeTruthy()
    const mountsAfterLogin = modalMountCount
    const refAfterLogin = seenUserRefs[seenUserRefs.length - 1]
    expect(refAfterLogin?.id).toBe('user-a')

    // Supabase fires TOKEN_REFRESHED with a FRESH user object (same id).
    const refreshedCopy = makeUser('user-a')
    expect(refreshedCopy).not.toBe(refAfterLogin)
    await act(async () => {
      mocks.authCallback!('TOKEN_REFRESHED', makeSession(refreshedCopy))
    })

    const refAfterRefresh = seenUserRefs[seenUserRefs.length - 1]
    expect(refAfterRefresh, 'user reference identity preserved across TOKEN_REFRESHED').toBe(refAfterLogin)
    expect(modalMountCount, 'modal did not remount').toBe(mountsAfterLogin)
    expect(container.querySelector('[data-testid="modal"]')?.textContent).toContain('user-a')
  })

  it('a real account switch DOES emit a new reference', async () => {
    const userA = makeUser('user-a')
    mocks.getSession.mockResolvedValue({ data: { session: makeSession(userA) } })

    await renderProvider()
    const refA = seenUserRefs[seenUserRefs.length - 1]
    expect(refA?.id).toBe('user-a')

    await act(async () => {
      mocks.authCallback!('SIGNED_IN', makeSession(makeUser('user-b')))
    })

    const refB = seenUserRefs[seenUserRefs.length - 1]
    expect(refB).not.toBe(refA)
    expect(refB?.id).toBe('user-b')
  })

  it('sign-out clears the user', async () => {
    const userA = makeUser('user-a')
    mocks.getSession.mockResolvedValue({ data: { session: makeSession(userA) } })

    await renderProvider()
    expect(container.querySelector('[data-testid="modal"]')).toBeTruthy()

    await act(async () => {
      mocks.authCallback!('SIGNED_OUT', null)
    })
    expect(seenUserRefs[seenUserRefs.length - 1]).toBeNull()
    expect(container.querySelector('[data-testid="anon"]')).toBeTruthy()
  })
})
