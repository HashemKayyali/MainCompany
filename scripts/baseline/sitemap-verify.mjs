#!/usr/bin/env node
/**
 * BASE-020 — Sitemap runtime verification.
 *
 * Fetches prod /sitemap.xml, checks well-formedness, and diffs its URL set
 * against the live DB using the same filters api/sitemap.ts uses
 * (products: is_active=true; categories: ALL — the missing-visibility-filter
 * question is part of what this records). Anon key from .env.local; no
 * secret values are written to the report.
 *
 * Rerunnable: node scripts/baseline/sitemap-verify.mjs [--base https://host] [--out path.json]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const args = process.argv.slice(2)
const argValue = (f, d) => {
  const i = args.indexOf(f)
  return i !== -1 && args[i + 1] ? args[i + 1] : d
}
const BASE_URL = argValue('--base', 'https://www.eventiesjo.com').replace(/\/$/, '')
const OUT_PATH = argValue('--out', 'reports/baseline/sitemap-verification.json')

function loadEnvLocal() {
  const env = {}
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = loadEnvLocal()
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !ANON_KEY) throw new Error('Supabase env missing from .env.local')

async function rest(path, params) {
  const url = new URL(`/rest/v1/${path}`, SUPABASE_URL)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${path} query failed: ${res.status}`)
  return res.json()
}

// 1. Fetch + well-formedness
const res = await fetch(`${BASE_URL}/sitemap.xml`, { headers: { 'user-agent': 'eventies-sitemap-verify/1.0' } })
const xml = await res.text()
const checks = {
  httpStatus: res.status,
  contentType: res.headers.get('content-type'),
  hasXmlDeclaration: xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
  hasUrlsetNamespace: xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
  balancedUrlTags: (xml.match(/<url>/g) ?? []).length === (xml.match(/<\/url>/g) ?? []).length,
  balancedLocTags: (xml.match(/<loc>/g) ?? []).length === (xml.match(/<\/loc>/g) ?? []).length,
  closesUrlset: xml.trimEnd().endsWith('</urlset>'),
}
const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname)

// 2. DB truth using the sitemap's own filters
const products = await rest('products', { select: 'slug,is_active', is_active: 'eq.true', order: 'slug.asc' })
const categories = await rest('categories', { select: '*', order: 'slug.asc', limit: '100' })
const categoryColumns = categories.length ? Object.keys(categories[0]) : []

const STATIC_PATHS = ['/', '/products', '/customers', '/gallery', '/about', '/contact']
const expected = new Set([
  ...STATIC_PATHS,
  ...products.map(p => `/products/${p.slug}`).filter(p => p !== '/products/null'),
  ...categories.map(c => `/categories/${c.slug}`).filter(c => c !== '/categories/null'),
])

const actual = new Set(sitemapUrls)
const missingFromSitemap = [...expected].filter(u => !actual.has(u)).sort()
const extraInSitemap = [...actual].filter(u => !expected.has(u)).sort()

const report = {
  task: 'BASE-020',
  capturedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  wellFormedness: checks,
  counts: {
    sitemapUrls: sitemapUrls.length,
    dbActiveProducts: products.length,
    dbCategories: categories.length,
    expectedTotal: expected.size,
  },
  diff: { missingFromSitemap, extraInSitemap },
  categoryVisibilityQuestion: {
    categoryColumns,
    visibilityLikeColumns: categoryColumns.filter(c => /active|visible|published|hidden/i.test(c)),
    note: 'api/sitemap.ts applies NO filter to categories; SEO-009 must decide against these columns.',
  },
  knownGaps: ['/custom-builds is intentionally absent today (SEO-009 adds it)', 'legal pages absent (SEO-009 decision)'],
}

mkdirSync(dirname(OUT_PATH), { recursive: true })
writeFileSync(OUT_PATH, JSON.stringify(report, null, 2))
const ok = Object.values(checks).every(v => v === true || v === 200 || String(v).includes('xml'))
console.log(`sitemap URLs: ${sitemapUrls.length} | expected: ${expected.size} | missing: ${missingFromSitemap.length} | extra: ${extraInSitemap.length}`)
console.log(`well-formed: ${ok} | visibility-like category columns: ${report.categoryVisibilityQuestion.visibilityLikeColumns.join(', ') || 'none'}`)
console.log(`Wrote ${OUT_PATH}`)
