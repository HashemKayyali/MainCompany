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

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .transform((value) => value.toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))

export const adminListFilterSchema = z.object({
  search: z.string().trim().max(120).default(''),
  status: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export const requestStatusMutationSchema = z.object({
  requestType: z.enum(['rental', 'purchase']),
  requestId: z.uuid(),
  status: z.enum([
    'pending',
    'reviewing',
    'approved',
    'quoted',
    'confirmed',
    'rejected',
    'cancelled',
  ]),
  note: z.string().trim().max(1000).nullable().optional(),
  assigneeId: z.uuid().nullable().optional(),
  idempotencyKey: z.uuid(),
})

export const quoteMutationSchema = z.object({
  requestId: z.uuid(),
  amount: z.number().finite().nonnegative().max(100_000_000),
  currency: z.enum(['JOD', 'USD', 'SAR']),
  note: z.string().trim().max(2000).nullable().optional(),
  idempotencyKey: z.uuid(),
})

export const adminChatMessageSchema = z.object({
  conversationId: z.uuid(),
  body: z.string().trim().min(1).max(4000),
  clientMessageId: z.uuid(),
})

export const adminNotificationSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    titleAr: z.string().trim().max(180).nullable().optional(),
    message: z.string().trim().min(1).max(1000),
    messageAr: z.string().trim().max(1000).nullable().optional(),
    targetUrl: z
      .string()
      .trim()
      .max(500)
      .regex(/^\/(?!\/|\\)/)
      .nullable()
      .optional(),
    audience: z.object({ clients: z.boolean(), admins: z.boolean(), superadmins: z.boolean() }),
    idempotencyKey: z.uuid(),
  })
  .refine((value) => Object.values(value.audience).some(Boolean), { path: ['audience'] })

export const adminMediaSchema = z.object({
  operation: z.enum(['upload', 'replace', 'delete']),
  folder: uploadAuthorizationSchema.shape.folder,
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/),
  publicId: z
    .string()
    .trim()
    .min(1)
    .max(240)
    .regex(/^eventies\/(products|categories|gallery|customers|builds)\/[a-zA-Z0-9/_-]+$/),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  size: z.number().int().positive().max(uploadPolicy.maxFileSize),
  idempotencyKey: z.uuid(),
})

export const adminCatalogRecordSchema = adminCatalogMutationSchema.extend({
  slug: slugSchema,
  active: z.boolean().default(true),
  idempotencyKey: z.uuid(),
})
