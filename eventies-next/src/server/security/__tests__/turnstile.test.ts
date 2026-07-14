import { beforeEach, describe, expect, it, vi } from 'vitest'

const { serverEnvMock, trackMock, claimMock } = vi.hoisted(() => ({
  serverEnvMock: vi.fn(),
  trackMock: vi.fn(),
  claimMock: vi.fn(),
}))

vi.mock('@/server/env', () => ({ serverEnv: serverEnvMock }))
vi.mock('@/server/observability/track', () => ({ track: trackMock }))
vi.mock('../turnstile-replay-store', () => ({ claimVerifiedTurnstileToken: claimMock }))

import { verifyTurnstileToken } from '../turnstile'

describe('FORM-TS server verification and replay protection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    serverEnvMock.mockReset()
    trackMock.mockReset()
    claimMock.mockReset()
    serverEnvMock.mockReturnValue({ TURNSTILE_SECRET_KEY: 'test-secret' })
  })

  it('fails closed for a missing token without calling Cloudflare', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(verifyTurnstileToken('')).resolves.toEqual({
      ok: false,
      errorCodes: ['missing-input-response'],
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns provider failure codes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), {
        status: 200,
      })
    )

    await expect(verifyTurnstileToken('invalid-token')).resolves.toEqual({
      ok: false,
      errorCodes: ['invalid-input-response'],
    })
    expect(claimMock).not.toHaveBeenCalled()
  })

  it('accepts the first verified token and rejects a replay', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(JSON.stringify({ success: true }), { status: 200 })
    )
    claimMock.mockResolvedValueOnce('claimed').mockResolvedValueOnce('duplicate')

    await expect(verifyTurnstileToken('verified-token')).resolves.toEqual({ ok: true })
    await expect(verifyTurnstileToken('verified-token')).resolves.toEqual({
      ok: false,
      errorCodes: ['timeout-or-duplicate'],
    })
    expect(trackMock).toHaveBeenCalledWith('turnstile.replay_rejected', {})
  })

  it('fails closed when the durable replay store is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    )
    claimMock.mockResolvedValue('unavailable')

    await expect(verifyTurnstileToken('verified-token')).resolves.toEqual({
      ok: false,
      errorCodes: ['replay-store-unavailable'],
    })
  })
})
