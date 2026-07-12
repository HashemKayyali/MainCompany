import { z } from 'zod'

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254))
export const passwordSchema = z.string().min(8).max(128)

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(true),
  turnstileToken: z.string().max(2048).optional(),
})

export const signupSchema = loginSchema.extend({ name: z.string().trim().min(2).max(120) })
export const resetSchema = z.object({
  email: emailSchema,
  locale: z.enum(['en', 'ar']).default('en'),
  turnstileToken: z.string().min(1).max(2048),
})
