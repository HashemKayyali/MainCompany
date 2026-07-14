import { beforeEach, describe, expect, it, vi } from 'vitest'

const { serviceRoleRestFetchMock } = vi.hoisted(() => ({
  serviceRoleRestFetchMock: vi.fn(),
}))

vi.mock('@/server/supabase/service-role-rest', () => ({
  serviceRoleRestFetch: serviceRoleRestFetchMock,
}))

import { writeScrubbedAppEvent } from '../app-events-sink'

describe('DBMIG-003 app_events sink', () => {
  beforeEach(() => {
    serviceRoleRestFetchMock.mockReset()
  })

  it('writes only the scrubbed payload to app_events', async () => {
    serviceRoleRestFetchMock.mockResolvedValue(new Response(null, { status: 201 }))

    await writeScrubbedAppEvent('auth.login_succeeded', {
      provider: 'password',
      email: '[redacted]',
    })

    expect(serviceRoleRestFetchMock).toHaveBeenCalledOnce()
    const [path, init] = serviceRoleRestFetchMock.mock.calls[0]!
    expect(path).toBe('/rest/v1/app_events')
    expect(JSON.parse(String(init.body))).toEqual({
      event: 'auth.login_succeeded',
      payload: { provider: 'password', email: '[redacted]' },
    })
  })

  it('does not throw when the service-role capability is unavailable', async () => {
    serviceRoleRestFetchMock.mockResolvedValue(null)
    await expect(writeScrubbedAppEvent('auth.bridge_adopted', {})).resolves.toBeUndefined()
  })
})
