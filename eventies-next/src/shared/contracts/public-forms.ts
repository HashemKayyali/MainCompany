export type PublicFormKind = 'contact' | 'support' | 'custom-build'

export type PublicFormSuccess = { ok: true; submissionId: string }
export type PublicFormFailure = {
  ok: false
  code: 'INVALID' | 'CHALLENGE' | 'RATE_LIMITED' | 'DUPLICATE' | 'ORIGIN' | 'UNAVAILABLE'
  fieldErrors?: Record<string, string>
}
export type PublicFormResponse = PublicFormSuccess | PublicFormFailure

/**
 * Expo-callable contract: POST JSON to /api/forms/{kind}. Browser callers also
 * send Origin/Sec-Fetch-Site; every caller supplies a fresh Turnstile token.
 * Responses never expose database/provider error text.
 */
