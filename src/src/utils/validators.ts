export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
export const isRequired = (v: string) => v.trim().length > 0
export interface ValidationError { field: string; message: string }
export const validateContactForm = (f: Record<string, string>): ValidationError[] => {
  const e: ValidationError[] = []
  if (!isRequired(f.name)) e.push({ field: 'name', message: 'Name is required' })
  if (!isEmail(f.email)) e.push({ field: 'email', message: 'Valid email required' })
  if (!isRequired(f.product)) e.push({ field: 'product', message: 'Select a product' })
  return e
}
