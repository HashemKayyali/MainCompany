#!/usr/bin/env node
/**
 * BASE-003 — SEO baseline capture (Phase 0 safety net).
 *
 * Fetches every public production route and extracts the SEO-relevant surface:
 * title / meta description / canonical / meta robots / X-Robots-Tag header /
 * Open Graph / Twitter / JSON-LD. Output is versioned JSON used as the parity
 * target for the Next.js reconstruction (QG-SEO gate, 11_SEO_CONSTITUTION.md).
 *
 * Rerunnable:  node scripts/baseline/seo-baseline.mjs [--base https://host] [--out path.json]
 * Self-test:   node scripts/baseline/seo-baseline.mjs --self-test
 */

const args = process.argv.slice(2)
function argValue(flag, fallback) {
  const i = args.indexOf(flag)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const BASE_URL = argValue('--base', 'https://www.eventiesjo.com').replace(/\/$/, '')
const OUT_PATH = argValue('--out', 'reports/baseline/seo-baseline.json')

/** Public routes that are NOT expected in the sitemap (aliases, non-prerendered pages). */
const EXTRA_PUBLIC_ROUTES = [
  '/categories',
  '/privacy-policy',
  '/privacy',
  '/terms',
  '/terms-of-service',
  '/vendor-terms',
  '/refund-policy',
  '/cookie-policy',
  '/cookies',
]

const UA = 'eventies-seo-baseline/1.0 (Phase 0 parity capture)'

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
}

function extractTag(html, regex) {
  const m = html.match(regex)
  return m ? decodeEntities(m[1].trim()) : null
}

function extractAllMeta(html) {
  const metas = []
  const re = /<meta\s+[^>]*?>/gi
  for (const tag of html.match(re) ?? []) {
    const name = tag.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1]
    const content = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]
    if (name && content !== undefined) metas.push({ name: name.toLowerCase(), content: decodeEntities(content) })
  }
  return metas
}

function extractJsonLd(html) {
  const blocks = []
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]))
    } catch {
      blocks.push({ __parseError: true, raw: m[1].slice(0, 500) })
    }
  }
  return blocks
}

export function extractSeo(html) {
  const metas = extractAllMeta(html)
  const pick = (n) => metas.find((m) => m.name === n)?.content ?? null
  const pickAll = (prefix) =>
    Object.fromEntries(metas.filter((m) => m.name.startsWith(prefix)).map((m) => [m.name, m.content]))
  return {
    title: extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick('description'),
    canonical: extractTag(html, /<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i)
      ?? extractTag(html, /<link\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']canonical["']/i),
    robotsMeta: pick('robots'),
    og: pickAll('og:'),
    twitter: pickAll('twitter:'),
    jsonLd: extractJsonLd(html),
    h1: extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g, '').trim() ?? null,
  }
}

async function fetchRoute(path) {
  const url = BASE_URL + path
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' })
  const html = await res.text()
  return {
    path,
    status: res.status,
    finalUrl: res.url,
    redirected: res.url !== url,
    xRobotsTag: res.headers.get('x-robots-tag'),
    contentType: res.headers.get('content-type'),
    ...extractSeo(html),
  }
}

async function getSitemapPaths() {
  const res = await fetch(BASE_URL + '/sitemap.xml', { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`)
  const xml = await res.text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  return locs.map((loc) => new URL(loc).pathname.replace(/\/$/, '') || '/')
}

function selfTest() {
  const html = `<html><head><title>T &amp; Co</title>
    <meta name="description" content="Desc"/>
    <link rel="canonical" href="https://x.example/p"/>
    <meta name="robots" content="noindex"/>
    <meta property="og:title" content="OG T"/>
    <meta name="twitter:card" content="summary"/>
    <script type="application/ld+json">{"@type":"Product","name":"P"}</script>
    </head><body><h1>Hello <b>World</b></h1></body></html>`
  const out = extractSeo(html)
  const assert = (cond, msg) => {
    if (!cond) {
      console.error(`SELF-TEST FAIL: ${msg}`)
      process.exit(1)
    }
  }
  assert(out.title === 'T & Co', 'title')
  assert(out.description === 'Desc', 'description')
  assert(out.canonical === 'https://x.example/p', 'canonical')
  assert(out.robotsMeta === 'noindex', 'robots')
  assert(out.og['og:title'] === 'OG T', 'og')
  assert(out.twitter['twitter:card'] === 'summary', 'twitter')
  assert(out.jsonLd[0]?.name === 'P', 'jsonld')
  assert(out.h1 === 'Hello World', 'h1')
  console.log('SELF-TEST PASS (8 assertions)')
  process.exit(0)
}

async function main() {
  if (args.includes('--self-test')) selfTest()

  const sitemapPaths = await getSitemapPaths()
  const paths = [...new Set([...sitemapPaths, ...EXTRA_PUBLIC_ROUTES])].sort()
  console.log(`Capturing ${paths.length} routes from ${BASE_URL} (${sitemapPaths.length} from sitemap)`)

  const results = []
  for (const p of paths) {
    try {
      results.push(await fetchRoute(p))
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
      {
        task: 'BASE-003',
        capturedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        routeCount: results.length,
        sitemapRouteCount: sitemapPaths.length,
        routes: results,
      },
      null,
      2,
    ),
  )
  const errors = results.filter((r) => r.error).length
  console.log(`Wrote ${OUT_PATH} — ${results.length} routes, ${errors} errors`)
  if (errors) process.exitCode = 2
}

main()
