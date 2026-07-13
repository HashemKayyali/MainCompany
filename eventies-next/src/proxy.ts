import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import {
  applyAuthCookiePolicy,
  AUTH_PERSISTENCE_COOKIE,
  authPersistenceFromCookie,
} from '@/shared/auth-cookie-policy'

/**
 * PROXY-001 — composition design (05 §Proxy Composition, binding order):
 *
 *  (1) MATCHER excludes /_next/*, /_vercel/*, any file with an extension,
 *      /api/*, /auth/callback, /sitemap.xml, /robots.txt — see `config` below
 *      with per-class rationale (PROXY-004).
 *  (2) next-intl negotiation runs FIRST and computes the locale plus any
 *      redirect/rewrite response.
 *  (3) Supabase session refresh runs against the request; @supabase/ssr
 *      triggers a refresh only when the access token is expired.
 *  (4) Refreshed auth cookies are merged onto WHATEVER response leaves this
 *      proxy — including intl redirects — via `response.cookies.set` inside
 *      `setAll` (PROXY-002; NextResponse.redirect must not drop Set-Cookie).
 *  (5) Request-cookie propagation: `setAll` first mutates `request.cookies`,
 *      then RE-RUNS the intl handler so the forwarded request headers carry
 *      the refreshed token — downstream RSC/handlers observe it in the SAME
 *      request (PROXY-003).
 *
 * Desync rules (PROXY-005): `setAll` fires at most once per request (a single
 * getClaims() call performs at most one refresh); the per-request server
 * client (server/supabase/server-client.ts) reuses the forwarded token and
 * never refreshes again in the same request — its setAll inside RSC is a
 * no-op by design.
 *
 * AUTHORIZATION NEVER LIVES HERE (Constitution §3). This file refreshes
 * cookies and negotiates locale. Nothing else.
 */

const handleI18nRouting = createIntlMiddleware(routing)

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = handleI18nRouting(request)
  const persistence = authPersistenceFromCookie(request.cookies.get(AUTH_PERSISTENCE_COOKIE)?.value)
  const secure = request.nextUrl.protocol === 'https:'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Misconfiguration or Supabase downtime must never 500 a public page
  // (PROXY-007): pass through unauthenticated and log.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[proxy] supabase env missing — passing through unauthenticated')
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // (5) propagate to the downstream request…
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = handleI18nRouting(request)
          // (4) …and onto the outgoing response, whatever shape it has.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, applyAuthCookiePolicy(options, persistence, secure))
          )
        },
      },
    })

    // (3) getClaims validates locally and refreshes only an expired session —
    // ADR-20: no getUser() network round-trip on every request.
    await supabase.auth.getClaims()
  } catch (error) {
    // (PROXY-007) Supabase unreachable → unauthenticated pass-through, never a 500.
    console.warn('[proxy] session refresh failed — passing through unauthenticated:', error)
  }

  return response
}

/**
 * PROXY-004 — matcher exclusions with rationale:
 *  - `api`            Route Handlers manage their own auth; JSON surfaces need no locale negotiation
 *  - `auth/callback`  OAuth code exchange must see the exact original request (03: outside [locale])
 *  - `sitemap.xml`, `robots.txt`  crawler surfaces; no locale, no session
 *  - `_next`, `_vercel`           framework internals/assets
 *  - `.*\\..*`        any path with a file extension (images, fonts, icons)
 */
export const config = {
  matcher: ['/((?!api|auth/callback|sitemap\\.xml|robots\\.txt|_next|_vercel|.*\\..*).*)'],
}
