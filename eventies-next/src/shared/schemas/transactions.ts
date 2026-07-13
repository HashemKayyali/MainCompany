import { z } from 'zod'

const contact = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254)),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{7,20}$/),
  companyName: z.string().trim().max(160).default(''),
  city: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(400),
  notes: z.string().trim().max(4000).default(''),
})

export const rentalItemSchema = z
  .object({
    productId: z.uuid(),
    productSlug: z.string().trim().min(1).max(200),
    productTitle: z.string().trim().min(1).max(300),
    productImage: z.string().max(2000).default(''),
    unitPrice: z.number().nonnegative(),
    currency: z.string().trim().min(3).max(8),
    quantity: z.number().int().min(1).max(100),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    minimumRentalDays: z.number().int().min(1).max(365),
    stockActive: z.number().int().nonnegative(),
  })
  .refine((item) => item.endDate >= item.startDate, { path: ['endDate'], message: 'dateRange' })

export const quoteItemSchema = z.object({
  productId: z.uuid(),
  productSlug: z.string().trim().min(1).max(200),
  productTitle: z.string().trim().min(1).max(300),
  productImage: z.string().max(2000).default(''),
  quantity: z.number().int().min(1).max(100),
  note: z.string().trim().max(1000).default(''),
})

export const rentalRequestSchema = contact.extend({
  eventName: z.string().trim().max(200).default(''),
  idempotencyKey: z.uuid(),
  items: z.array(rentalItemSchema).min(1).max(50),
})

export const purchaseQuoteSchema = contact.extend({
  idempotencyKey: z.uuid(),
  items: z.array(quoteItemSchema).min(1).max(50),
})

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{7,20}$/)
    .or(z.literal('')),
})

export type RentalRequestInput = z.infer<typeof rentalRequestSchema>
export type PurchaseQuoteInput = z.infer<typeof purchaseQuoteSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
