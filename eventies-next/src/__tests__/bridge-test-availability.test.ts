import { describe, expect, it } from 'vitest'
import { isBridgeTestAvailable } from '@/app/[locale]/bridge-test/availability'

describe('AUTHP-002 preview-only bridge surface', () => {
  it('is available on Vercel Preview', () => {
    expect(isBridgeTestAvailable({ VERCEL_ENV: 'preview' })).toBe(true)
  })

  it('is unavailable on Vercel Production', () => {
    expect(isBridgeTestAvailable({ VERCEL_ENV: 'production' })).toBe(false)
  })

  it('requires an explicit opt-in for local development', () => {
    expect(isBridgeTestAvailable({})).toBe(false)
    expect(isBridgeTestAvailable({ ENABLE_BRIDGE_TEST: 'true' })).toBe(true)
  })
})
