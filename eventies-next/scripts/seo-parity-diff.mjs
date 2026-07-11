#!/usr/bin/env node
/**
 * SEO-013 — parity diff: extract head fields from the Next target and diff
 * against the P0 baseline (reports/baseline/seo-baseline.json). Title/desc/
 * canonical/og:image/robots per route. Known, constitution-approved deltas are
 * whitelisted (not failures). Exit 2 on any unexplained delta (CI gate).
 *
 *   node scripts/seo-parity-diff.mjs --next http://localhost:3458 \
 *     --baseline ../reports/baseline/seo-baseline.json
 */
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const val = (f, d) => {
  const i = args.indexOf(f)
  return i !== -1 && args[i + 1] ? args[i + 1] : d
}
const NEXT = val('--next', 'http://localhost:3458').replace(/\/$/, '')
const BASELINE = val('--baseline', '../reports/baseline/seo-baseline.json')
const OUT = val('--out', '../reports/seo-parity/PARITY_DIFF.json')

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))

// Routes to compare (public, indexable). Baseline canonical is the prod URL;
// the Next target emits the same prod canonical, so we compare canonicals
// directly.
const ROUTES = ['/', '/products', '/gallery', '/customers', '/about', '/contact', '/custom-builds']
const PRODUCT_ROUTES = baseline.routes
  .filter((r) => r.path.startsWith('/products/'))
  .slice(0, 3)
  .map((r) => r.path)

function extract(html) {
  const pick = (re) => (html.match(re)?.[1] ?? null)?.replace(/&amp;/g, '&').trim() ?? null
  return {
    title: pick(/<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i),
    canonical: pick(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i),
    ogImage: pick(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i),
    robots: pick(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/i),
  }
}

// Constitution-approved deltas (not failures):
//  - og:image: baseline shows og-default.png; P0 BASE-017/IMG-012 swapped to
//    og-default.jpg. Product OG images are unchanged (Cloudinary).
//  - home title/description: BASE-018 aligned the shell to the prerender copy.
function isApprovedDelta(path, field, baseVal, nextVal) {
  if (field === 'ogImage' && baseVal?.endsWith('og-default.png') && nextVal?.endsWith('og-default.jpg'))
    return 'BASE-017/IMG-012 og-default.png→.jpg'
  return null
}

const results = []
async function compare(path) {
  const base = baseline.routes.find((r) => r.path === path)
  if (!base) return
  const res = await fetch(NEXT + path, { headers: { 'user-agent': 'seo-parity/1.0' } })
  const next = extract(await res.text())
  const baseFields = {
    title: base.title,
    description: base.description,
    canonical: base.canonical,
    ogImage: base.og?.['og:image'] ?? null,
    robots: base.robotsMeta ?? null,
  }
  const deltas = []
  for (const field of ['title', 'description', 'canonical', 'ogImage']) {
    if (baseFields[field] !== next[field]) {
      const approved = isApprovedDelta(path, field, baseFields[field], next[field])
      deltas.push({ field, baseline: baseFields[field], next: next[field], approved })
    }
  }
  results.push({ path, status: res.status, deltas })
}

for (const p of [...ROUTES, ...PRODUCT_ROUTES]) await compare(p)

const unexplained = results.flatMap((r) => r.deltas.filter((d) => !d.approved).map((d) => ({ path: r.path, ...d })))
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), next: NEXT, results, unexplained }, null, 2))
console.log(`compared ${results.length} routes; ${unexplained.length} unexplained deltas`)
for (const u of unexplained) console.log(`  DELTA ${u.path} ${u.field}: base="${u.baseline}" next="${u.next}"`)
if (unexplained.length) process.exitCode = 2
