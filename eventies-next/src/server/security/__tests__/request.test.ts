import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { isTrustedMutationRequest, requestIp } from '../request'

function req(headers: Record<string, string>) {
  return new NextRequest('https://eventies.example/api/forms/contact', {
    method: 'POST',
    headers,
  })
}

describe('SEC-005 mutation request checks', () => {
  it('accepts same-origin JSON', () => {
    expect(
      isTrustedMutationRequest(
        req({ 'content-type': 'application/json', origin: 'https://eventies.example' })
      )
    ).toBe(true)
  })

  it('rejects cross-site and form-encoded requests', () => {
    expect(
      isTrustedMutationRequest(
        req({ 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' })
      )
    ).toBe(false)
    expect(
      isTrustedMutationRequest(req({ 'content-type': 'application/x-www-form-urlencoded' }))
    ).toBe(false)
  })

  it('uses the leftmost forwarded address', () => {
    expect(requestIp(req({ 'x-forwarded-for': '203.0.113.1, 10.0.0.2' }))).toBe('203.0.113.1')
  })
})
