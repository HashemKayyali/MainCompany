#!/usr/bin/env node
/**
 * CAT-024 visual-parity evidence — captures full-page screenshots of the same
 * public routes from BOTH apps at 4 viewports (1440×1000 & 390×844, EN & AR)
 * and writes them under docs/reconstruction/visual-parity/shots/.
 *
 *   node scripts/visual-parity-shots.mjs --app legacy --base http://localhost:5174
 *   node scripts/visual-parity-shots.mjs --app next   --base http://localhost:3462
 *
 * The legacy Vite app is EN-only (no /ar), so AR shots there fall back to the
 * EN URL — the comparison target for /ar is still the Vite design.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const val = (f, d) => {
  const i = args.indexOf(f)
  return i !== -1 && args[i + 1] ? args[i + 1] : d
}
const APP = val('--app', 'next') // 'legacy' | 'next'
const BASE = val('--base', 'http://localhost:3462').replace(/\/$/, '')
const OUT = join('..', 'docs', 'reconstruction', 'visual-parity', 'shots', APP)
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  ['home', '/'],
  ['products', '/products'],
  ['product-detail', '/products/3d-booth-event-space-design'],
  ['categories', '/categories'],
  ['category-detail', '/categories/screens'],
  ['gallery', '/gallery'],
  ['custom-builds', '/custom-builds'],
  ['customers', '/customers'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['legal', '/privacy-policy'],
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]
const LOCALES = ['en', 'ar']

function url(route, locale) {
  // Next: AR under /ar; legacy Vite is EN-only → always EN URL.
  if (locale === 'ar' && APP === 'next')
    return `${BASE}/ar${route === '/' ? '' : route}` || `${BASE}/ar`
  return `${BASE}${route}`
}

const browser = await chromium.launch()
let ok = 0
let fail = 0
for (const [label, route] of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const locale of LOCALES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        locale: locale === 'ar' ? 'ar-JO' : 'en-US',
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()
      const target = url(route, locale)
      try {
        await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(1200) // let lazy images / reveals settle
        const file = join(OUT, `${label}__${vp.name}__${locale}.png`)
        await page.screenshot({ path: file, fullPage: true })
        ok++
        process.stdout.write('.')
      } catch (e) {
        fail++
        process.stdout.write('!')
        console.error(`\n  ${target}: ${String(e).slice(0, 120)}`)
      }
      await context.close()
    }
  }
}
await browser.close()
console.log(`\n${APP}: ${ok} shots ok, ${fail} failed → ${OUT}`)
