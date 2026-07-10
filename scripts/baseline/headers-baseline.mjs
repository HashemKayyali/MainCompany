#!/usr/bin/env node
/**
 * BASE-005 — Security-header baseline capture (Phase 0 safety net).
 *
 * HEAD-requests production routes and records the security-relevant response
 * headers: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy, X-Robots-Tag, Content-Security-Policy(-Report-Only),
 * Cache-Control. No cookies or secrets are recorded.
 *
 * Rerunnable: node scripts/baseline/headers-baseline.mjs [--base https://host] [--out path.json]
 */
const args = process.argv.slice(2)
function argValue(flag, fallback) {
  const i = args.indexOf(flag)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const BASE_URL = argValue('--base', 'https://www.eventiesjo.com').replace(/\/$/, '')
const OUT_PATH = argValue('--out', 'reports/baseline/security-headers-baseline.json')

/** Indexable sample + the full vercel.json noindex list + cached asset prefixes. */
const ROUTES = [
  '/',
  '/products',
  '/gallery',
  '/sitemap.xml',
  '/robots.txt',
  // vercel.json X-Robots-Tag noindex list (BASE-002 inventory)
  '/login',
  '/register',
  '/user-login',
  '/forgot-password',
  '/auth/callback',
  '/reset-password',
  '/update-password',
  '/profile',
  '/rental-cart',
  '/checkout',
  '/order-summary/TEST-000',
  '/purchase-quote',
  '/my-requests',
  '/my-requests/TEST-000',
  '/admin',
  '/admin/products',
  // private route MISSING from the noindex list (discovery D-P0-04) — captured as evidence
  '/notifications',
  // cache-header surfaces
  '/images/og-default.png',
  '/brand/favicon.svg',
]

const CAPTURED_HEADERS = [
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'x-robots-tag',
  'content-security-policy',
  'content-security-policy-report-only',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cache-control',
  'content-type',
]

async function capture(path) {
  const res = await fetch(BASE_URL + path, {
    method: 'HEAD',
    headers: { 'user-agent': 'eventies-headers-baseline/1.0' },
    redirect: 'manual',
  })
  const headers = {}
  for (const h of CAPTURED_HEADERS) headers[h] = res.headers.get(h)
  return { path, status: res.status, location: res.headers.get('location'), headers }
}

const results = []
for (const p of ROUTES) {
  try {
    results.push(await capture(p))
    process.stdout.write('.')
  } catch (e) {
    results.push({ path: p, error: String(e) })
    process.stdout.write('!')
  }
}
console.log()

const { writeFileSync, mkdirSync } = await import('node:fs')
const { dirname } = await import('node:path')
mkdirSync(dirname(OUT_PATH), { recursive: true })
writeFileSync(
  OUT_PATH,
  JSON.stringify(
    { task: 'BASE-005', capturedAt: new Date().toISOString(), baseUrl: BASE_URL, routes: results },
    null,
    2,
  ),
)
console.log(`Wrote ${OUT_PATH} — ${results.length} routes`)
