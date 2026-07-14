import 'server-only'

import { writeScrubbedAppEvent } from './app-events-sink'
import { scrubPayload, type ScrubbedPayload } from './scrub'

/**
 * FOUND-016 — track(): the single server-side event funnel.
 * Event catalog seeds from 05 §Audit: auth.login_failed, auth.mfa_enrolled,
 * admin.role_changed, admin.destructive_confirmed, ratelimit.tripped,
 * upload.signature_denied, revalidate.failed…
 *
 * P1 wiring: structured stdout (Vercel log drain) + Sentry breadcrumb when a
 * DSN exists. The app_events DB sink activates once DBMIG-003's migration is
 * applied (Wave A); until then DB writes are skipped, never queued.
 */
export async function track(event: string, payload: Record<string, unknown> = {}): Promise<void> {
  const scrubbed: ScrubbedPayload = scrubPayload(payload)
  const record = {
    event,
    at: new Date().toISOString(),
    ...scrubbed,
  }

  // Structured log — always.
  console.log(`[app_event] ${JSON.stringify(record)}`)

  // Durable DB sink — best effort and already scrubbed.
  await writeScrubbedAppEvent(event, scrubbed)

  // Sentry — optional capability (FOUND-016); import lazily so the app never
  // pays for it when unconfigured.
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.addBreadcrumb({ category: 'app_event', message: event, data: scrubbed })
    } catch {
      // Sentry unavailable — the log line above already captured the event.
    }
  }
}
