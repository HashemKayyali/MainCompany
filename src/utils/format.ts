export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const buildWhatsAppUrl = (phone: string, msg: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
export const buildMailtoUrl = (email: string, subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
export const sanitize = (s: string): string => {
  const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }
  return s.replace(/[<>"&]/g, c => map[c] || c)
}
