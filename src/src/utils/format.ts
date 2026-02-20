export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const buildWhatsAppUrl = (phone: string, msg: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
export const buildMailtoUrl = (email: string, subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
export const hashPassword = async (pw: string): Promise<string> => {
  const enc = new TextEncoder().encode(pw + 'BL_SALT_2025')
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
export const sanitize = (s: string): string => {
  const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }
  return s.replace(/[<>"&]/g, c => map[c] || c)
}
