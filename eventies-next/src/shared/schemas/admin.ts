import { z } from 'zod'

export const destructiveConfirmationSchema = z.object({
  operation: z.enum([
    'product',
    'category',
    'gallery',
    'custom_build',
    'role',
    'admin',
    'broadcast',
    'bulk',
    'cloudinary',
  ]),
  targetId: z.string().min(1).max(128),
  confirmation: z.string().min(1).max(128),
})

export const adminCatalogMutationSchema = z.object({
  entity: z.enum(['product', 'category', 'part', 'build', 'customer', 'gallery']),
  slug: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(200),
  nameAr: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(10_000).nullable().optional(),
  descriptionAr: z.string().trim().max(10_000).nullable().optional(),
})

export const uploadAuthorizationSchema = z.object({
  action: z.literal('sign-upload'),
  folder: z.enum([
    'eventies/products',
    'eventies/categories',
    'eventies/gallery',
    'eventies/customers',
    'eventies/builds',
  ]),
  idempotencyKey: z.uuid(),
})

export const uploadPolicy = {
  preset: 'eventies_admin_signed',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const,
  maxFileSize: 10 * 1024 * 1024,
  hourlyQuota: 30,
  dailyQuota: 300,
} as const
