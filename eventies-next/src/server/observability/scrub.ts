import 'server-only'

/**
 * SEC-007 — PII scrubber. 05 §Audit/PII: no message bodies, emails, phones in
 * Sentry/app_events; identifiers hashed where a join key is needed. The
 * redaction unit test (redaction.test.ts) is blocking.
 */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g
// +9627XXXXXXXX / 07XXXXXXXX and general international forms
const PHONE_RE = /(?:\+?\d[\s-]?){8,15}/g
const JWT_RE = /eyJ[\w-]+\.[\w-]+\.[\w-]+/g

const BLOCKED_KEYS = new Set([
  'email',
  'phone',
  'password',
  'message',
  'body',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'name',
  'full_name',
])

export function scrubString(value: string): string {
  return value.replace(JWT_RE, '[jwt]').replace(EMAIL_RE, '[email]').replace(PHONE_RE, '[phone]')
}

export async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase().trim())
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export type ScrubbedPayload = Record<string, string | number | boolean | null>

export function scrubPayload(payload: Record<string, unknown>): ScrubbedPayload {
  const out: ScrubbedPayload = {}
  for (const [key, raw] of Object.entries(payload)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) {
      out[key] = '[redacted]'
      continue
    }
    if (typeof raw === 'string') out[key] = scrubString(raw)
    else if (typeof raw === 'number' || typeof raw === 'boolean' || raw === null) out[key] = raw
    else out[key] = scrubString(JSON.stringify(raw ?? null))
  }
  return out
}
