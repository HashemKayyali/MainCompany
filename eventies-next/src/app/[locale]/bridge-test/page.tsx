import type { Metadata } from 'next'
import { BridgeTestClient } from './bridge-test-client'

/**
 * AUTHP-002 — /bridge-test: preview-only P1B experiment surface.
 * noindex ALWAYS (05: prototype routes are noindex + preview-only); links
 * back to a Vite route for the Q3/Q7 round-trip checks.
 */
export const metadata: Metadata = {
  title: 'P1B bridge test',
  robots: { index: false, follow: false },
}

export default function BridgeTestPage() {
  return (
    <main>
      <h1>P1B — auth bridge test</h1>
      <BridgeTestClient />
    </main>
  )
}
