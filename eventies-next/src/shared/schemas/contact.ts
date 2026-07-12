import { z } from 'zod'

/**
 * FOUND-014 — Zod foundation sample schema (contact form; FORM-001 completes
 * the set in P3 mirroring validators.ts + DB constraints). Error MESSAGES are
 * KEYS, not copy: the UI resolves them through next-intl so AR validation
 * text works without schema changes (08).
 */
export const contactSchema = z.object({
  name: z
    .string({ error: 'forms.errors.nameRequired' })
    .trim()
    .min(2, 'forms.errors.nameTooShort')
    .max(120, 'forms.errors.nameTooLong'),
  email: z.email('forms.errors.emailInvalid').max(254, 'forms.errors.emailTooLong'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, 'forms.errors.phoneInvalid')
    .optional()
    .or(z.literal('')),
  message: z
    .string({ error: 'forms.errors.messageRequired' })
    .trim()
    .min(10, 'forms.errors.messageTooShort')
    .max(2000, 'forms.errors.messageTooLong'),
})

export const publicFormSchema = contactSchema.extend({
  turnstileToken: z.string().min(1, 'forms.errors.challengeRequired').max(2048),
  productSlug: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().max(160).optional().default(''),
  address: z.string().trim().max(240).optional().default(''),
  subject: z.string().trim().max(160).optional().default(''),
})

export type PublicFormInput = z.infer<typeof publicFormSchema>

export type ContactInput = z.infer<typeof contactSchema>

/** Flatten a ZodError into { fieldName: messageKey } for the UI layer. */
export function fieldErrorKeys(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_form'
    if (!(path in out)) out[path] = issue.message
  }
  return out
}
