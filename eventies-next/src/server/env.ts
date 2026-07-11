import 'server-only'

import { z } from 'zod'

/**
 * FOUND-031 — env schema validation, fail-fast on the server.
 * Client-inlined NEXT_PUBLIC_* values are also asserted here so a
 * misconfigured deployment dies loudly at first server touch instead of
 * emitting broken pages. Server-only secrets are OPTIONAL by design: their
 * absence disables a capability (observability, turnstile) — it must never
 * block boot (05: fail closed at the feature, not the app).
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  // server-only; never NEXT_PUBLIC_ (SEC-010 / QG-ARCH-4 confinement)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cached: ServerEnv | undefined

export function serverEnv(): ServerEnv {
  if (cached) return cached
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  })
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(`[env] invalid or missing server environment: ${missing}`)
  }
  cached = parsed.data
  return cached
}
