import 'server-only'

import type { NextRequest } from 'next/server'

export function requestIp(request: NextRequest): string {
  return (
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export function isTrustedMutationRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]
  if (contentType !== 'application/json') return false

  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite && !['same-origin', 'same-site', 'none'].includes(secFetchSite)) return false

  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === request.nextUrl.host
  } catch {
    return false
  }
}
