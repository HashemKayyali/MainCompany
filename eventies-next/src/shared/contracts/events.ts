/**
 * FOUND-018 — telemetry/audit event-name contracts (05 §Audit catalog +
 * additions discovered during implementation). track() callers import from
 * here; free-string event names are a review violation.
 */
export const EVENTS = {
  authLoginFailed: 'auth.login_failed',
  authMfaEnrolled: 'auth.mfa_enrolled',
  adminRoleChanged: 'admin.role_changed',
  adminDestructiveConfirmed: 'admin.destructive_confirmed',
  ratelimitTripped: 'ratelimit.tripped',
  uploadSignatureDenied: 'upload.signature_denied',
  revalidateFailed: 'revalidate.failed',
  revalidateSucceeded: 'revalidate.succeeded',
  revalidateDenied: 'revalidate.denied',
  turnstileMisconfigured: 'turnstile.misconfigured',
  turnstileVerifyFailed: 'turnstile.verify_failed',
  bridgeAdopted: 'auth.bridge_adopted',
  bridgeFailed: 'auth.bridge_failed',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]
