import { NextResponse, type NextRequest } from 'next/server'

/**
 * ROUTE-005 instrumentation (preview-only): proves the cookie round-trip
 * through the rewrite topology — request cookies forwarded to the rewritten
 * origin, Set-Cookie propagated back unmodified. Values are never echoed,
 * only names + a deterministic probe cookie. Disabled in production.
 */
export function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const seen = request.cookies.getAll().map((c) => c.name)
  const response = NextResponse.json({
    probe: 'cookie-echo',
    requestCookieNames: seen,
    deployment: process.env.VERCEL_ENV ?? 'unknown',
  })
  response.cookies.set('rt-cookie-probe', `set-${Date.now()}`, {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  })
  return response
}
