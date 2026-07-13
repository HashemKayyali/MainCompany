// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PERSISTENT_AUTH_MAX_AGE } from '@/shared/auth-cookie-policy'

type BrowserClientOptions = {
  cookieOptions?: unknown
  cookies?: {
    setAll: (
      cookies: Array<{
        name: string
        value: string
        options: { expires?: Date; maxAge?: number; path?: string }
      }>,
      headers: Record<string, string>
    ) => void
  }
  isSingleton?: boolean
}

const mocks = vi.hoisted(() => ({
  options: undefined as BrowserClientOptions | undefined,
}))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn((_url: string, _key: string, options: BrowserClientOptions) => {
    mocks.options = options
    return { auth: {} }
  }),
}))

describe('AUTH-007 browser cookie boundary', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    document.cookie = 'eventies-auth-persistence=; path=/; max-age=0'
  })

  it('intercepts SDK writes instead of relying on an overridden cookieOptions maxAge', async () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set')
    const { getSupabaseBrowserClient } = await import('@/lib/supabase-browser')

    getSupabaseBrowserClient('session')

    expect(mocks.options?.isSingleton).toBe(false)
    expect(mocks.options?.cookieOptions).toBeUndefined()
    expect(mocks.options?.cookies?.setAll).toBeTypeOf('function')

    cookieSetter.mockClear()
    mocks.options?.cookies?.setAll(
      [
        {
          name: 'sb-session',
          value: 'rotated-token',
          options: { maxAge: PERSISTENT_AUTH_MAX_AGE, path: '/' },
        },
      ],
      {}
    )
    expect(cookieSetter).toHaveBeenCalledWith(expect.not.stringContaining('Max-Age'))

    cookieSetter.mockClear()
    mocks.options?.cookies?.setAll(
      [
        {
          name: 'sb-session.1',
          value: '',
          options: { expires: new Date(0), maxAge: 0, path: '/' },
        },
      ],
      {}
    )
    expect(cookieSetter).toHaveBeenCalledWith(expect.stringContaining('Max-Age=0'))
  })
})
