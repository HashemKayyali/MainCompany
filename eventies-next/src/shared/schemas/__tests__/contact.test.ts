import { describe, expect, it } from 'vitest'
import { contactSchema, fieldErrorKeys } from '../contact'

/** FOUND-014 — sample schema + typed error-key map. */
describe('contact schema foundation', () => {
  it('accepts a valid submission', () => {
    const result = contactSchema.safeParse({
      name: 'Hashem',
      email: 'someone@example.com',
      phone: '+962 79 123 4567',
      message: 'I would like to rent a VR booth for a school event.',
    })
    expect(result.success).toBe(true)
  })

  it('returns i18n KEYS (not copy) for invalid fields', () => {
    const result = contactSchema.safeParse({ name: 'H', email: 'nope', message: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const keys = fieldErrorKeys(result.error)
      expect(keys.name).toBe('forms.errors.nameTooShort')
      expect(keys.email).toBe('forms.errors.emailInvalid')
      expect(keys.message).toBe('forms.errors.messageTooShort')
    }
  })

  it('allows empty phone but rejects a malformed one', () => {
    expect(
      contactSchema.safeParse({
        name: 'Hashem',
        email: 'a@b.co',
        phone: '',
        message: 'long enough message',
      }).success
    ).toBe(true)
    const bad = contactSchema.safeParse({
      name: 'Hashem',
      email: 'a@b.co',
      phone: 'abc',
      message: 'long enough message',
    })
    expect(bad.success).toBe(false)
  })
})
