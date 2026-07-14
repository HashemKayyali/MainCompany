import 'server-only'

import { serviceRoleRestFetch } from '@/server/supabase/service-role-rest'
import type { ScrubbedPayload } from './scrub'

const MAX_EVENT_LENGTH = 128
const WRITE_TIMEOUT_MS = 2_000

/**
 * DBMIG-003 — best-effort, server-only sink for already-scrubbed telemetry.
 * Failures never fail the user request: structured logs remain the fallback
 * and the status-only warning contains no payload or URL.
 */
export async function writeScrubbedAppEvent(
  event: string,
  payload: ScrubbedPayload,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WRITE_TIMEOUT_MS)

  try {
    const response = await serviceRoleRestFetch(
      '/rest/v1/app_events',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          prefer: 'return=minimal',
        },
        body: JSON.stringify({
          event: event.slice(0, MAX_EVENT_LENGTH),
          payload,
        }),
      },
      fetchImpl
    )

    if (response && !response.ok) {
      console.warn(`[app_event_sink] write failed with status ${response.status}`)
    }
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network'
    console.warn(`[app_event_sink] ${reason} failure`)
  } finally {
    clearTimeout(timeout)
  }
}
