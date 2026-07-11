import { NextResponse, type NextRequest } from 'next/server'

/**
 * ROUTE-006 instrumentation (preview-only): an OAuth-callback-SHAPED route —
 * consumes query params (`code`, `state`, `redirect`) and answers with a 303
 * redirect carrying them as fragments of the target, exactly the shape
 * /auth/callback will have in P3. Proves query strings + 303 traverse the
 * rewrite topology intact. No real auth is involved; disabled in production.
 */
export function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const url = request.nextUrl
  const code = url.searchParams.get('code') ?? 'missing'
  const state = url.searchParams.get('state') ?? 'missing'

  const target = new URL('/', url)
  target.searchParams.set('probe', 'callback-shape')
  target.searchParams.set('code-length', String(code.length))
  target.searchParams.set('state-echo', state)

  return NextResponse.redirect(target, 303)
}
