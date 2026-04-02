export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
export const isRequired = (v: string) => v.trim().length > 0
export const isPhone = (p: string) => !p.trim() || /^\+?[\d\s\-()]{7,18}$/.test(p.trim())

/** Strip potential XSS vectors and enforce max length */
export const sanitizeInput = (str: string, maxLen = 500): string =>
  str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen)

export interface ValidationError { field: string; message: string }

export const validateContactForm = (f: Record<string, string>): ValidationError[] => {
  const e: ValidationError[] = []
  if (!isRequired(f.name)) e.push({ field: 'name', message: 'Name is required' })
  if (f.name && f.name.length > 100) e.push({ field: 'name', message: 'Name is too long (max 100)' })
  if (!isEmail(f.email)) e.push({ field: 'email', message: 'Valid email required' })
  if (f.phone && !isPhone(f.phone)) e.push({ field: 'phone', message: 'Invalid phone number' })
  if (f.message && f.message.length > 2000) e.push({ field: 'message', message: 'Message too long (max 2000)' })
  return e
}
