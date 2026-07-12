import { describe, expect, it } from 'vitest'
import { purchaseQuoteSchema, rentalRequestSchema } from '../transactions'

const base = {
  customerName: 'Ada User',
  email: 'ADA@EXAMPLE.COM',
  phone: '+962 777 000 000',
  companyName: '',
  city: 'Amman',
  address: 'Venue',
  notes: '',
  idempotencyKey: '00000000-0000-4000-8000-000000000009',
}

describe('REQ-013 transaction schemas', () => {
  it('accepts a valid rental and normalizes email', () => {
    const value = rentalRequestSchema.parse({
      ...base,
      eventName: '',
      items: [
        {
          productId: '00000000-0000-4000-8000-000000000001',
          productSlug: 'bike',
          productTitle: 'Bike',
          productImage: '',
          unitPrice: 2,
          currency: 'JOD',
          quantity: 1,
          startDate: '2026-07-20',
          endDate: '2026-07-21',
          minimumRentalDays: 1,
          stockActive: 2,
        },
      ],
    })
    expect(value.email).toBe('ada@example.com')
  })
  it('rejects reversed dates and quantities over the DB cap', () => {
    const parsed = rentalRequestSchema.safeParse({
      ...base,
      eventName: '',
      items: [
        {
          productId: '00000000-0000-4000-8000-000000000001',
          productSlug: 'bike',
          productTitle: 'Bike',
          productImage: '',
          unitPrice: 2,
          currency: 'JOD',
          quantity: 101,
          startDate: '2026-07-22',
          endDate: '2026-07-21',
          minimumRentalDays: 1,
          stockActive: 2,
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })
  it('requires quote items', () => {
    expect(purchaseQuoteSchema.safeParse({ ...base, items: [] }).success).toBe(false)
  })
})
