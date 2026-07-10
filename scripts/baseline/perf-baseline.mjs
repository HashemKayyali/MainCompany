#!/usr/bin/env node
/**
 * BASE-004 — Performance baseline capture (Phase 0 safety net).
 *
 * Runs Lighthouse against 4 production routes × (mobile, desktop) and writes:
 *  - reports/baseline/perf/<route>__<formfactor>.json   (trimmed: scores + metrics + key diagnostics)
 *  - full raw LHRs to reports/baseline/perf/raw/ (gitignored — derived metrics only in git)
 *
 * Rerunnable: node scripts/baseline/perf-baseline.mjs [--base https://host]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const i = args.indexOf('--base')
const BASE_URL = (i !== -1 ? args[i + 1] : 'https://www.eventiesjo.com').replace(/\/$/, '')

const ROUTES = [
  { path: '/', slug: 'home' },
  { path: '/products', slug: 'products' },
  { path: '/products/3d-booth-event-space-design', slug: 'product-detail' },
  { path: '/gallery', slug: 'gallery' },
]
const FORM_FACTORS = ['mobile', 'desktop']

const OUT_DIR = 'reports/baseline/perf'
const RAW_DIR = `${OUT_DIR}/raw`
mkdirSync(RAW_DIR, { recursive: true })

const KEY_AUDITS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
  'server-response-time',
  'total-byte-weight',
  'unused-javascript',
  'render-blocking-resources',
  'largest-contentful-paint-element',
]

function trim(lhr) {
  return {
    task: 'BASE-004',
    fetchTime: lhr.fetchTime,
    requestedUrl: lhr.requestedUrl,
    finalDisplayedUrl: lhr.finalDisplayedUrl,
    formFactor: lhr.configSettings.formFactor,
    lighthouseVersion: lhr.lighthouseVersion,
    scores: Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, v.score])),
    metrics: Object.fromEntries(
      KEY_AUDITS.map((id) => {
        const a = lhr.audits[id]
        return [id, a ? { score: a.score, numericValue: a.numericValue ?? null, displayValue: a.displayValue ?? null } : null]
      }),
    ),
  }
}

for (const route of ROUTES) {
  for (const ff of FORM_FACTORS) {
    const rawPath = `${RAW_DIR}/${route.slug}__${ff}.json`
    const url = BASE_URL + route.path
    console.log(`Lighthouse: ${url} [${ff}]`)
    const lhArgs = [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${rawPath}`,
      '--quiet',
      '--chrome-flags=--headless=new',
    ]
    if (ff === 'desktop') lhArgs.push('--preset=desktop')
    execFileSync('npx', lhArgs, { stdio: 'inherit', shell: true, timeout: 300_000 })
    const lhr = JSON.parse(readFileSync(rawPath, 'utf8'))
    writeFileSync(`${OUT_DIR}/${route.slug}__${ff}.json`, JSON.stringify(trim(lhr), null, 2))
    console.log(`  perf=${lhr.categories.performance.score} LCP=${lhr.audits['largest-contentful-paint'].displayValue}`)
  }
}
console.log('Done — trimmed baselines in', OUT_DIR)
