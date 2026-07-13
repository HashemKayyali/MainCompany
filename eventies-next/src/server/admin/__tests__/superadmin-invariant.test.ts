import { describe, expect, it } from 'vitest'
import { evaluateSuperadminChange } from '../superadmin-invariant'

describe('last active superadmin invariant', () => {
  it('denies removal or demotion of the final active superadmin', () => {
    expect(
      evaluateSuperadminChange({
        targetId: 'a',
        targetRole: 'superadmin',
        nextRole: 'user',
        activeSuperadminIds: ['a'],
      })
    ).toBe('final-superadmin-denied')
  })

  it('allows self-removal or self-demotion only when another active superadmin remains', () => {
    expect(
      evaluateSuperadminChange({
        targetId: 'a',
        targetRole: 'superadmin',
        nextRole: 'admin',
        activeSuperadminIds: ['a', 'b'],
      })
    ).toBe('allow')
  })
})
