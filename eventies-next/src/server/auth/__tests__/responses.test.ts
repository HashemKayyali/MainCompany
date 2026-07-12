import { describe, expect, it } from 'vitest'
import { authFailure } from '../responses'

describe('AU-EN uniform responses', () => {
  it('returns identical public shape for every auth failure class', async () => {
    const invalid = await authFailure(400).json()
    const denied = await authFailure(403).json()
    expect(invalid).toEqual(denied)
  })
})
