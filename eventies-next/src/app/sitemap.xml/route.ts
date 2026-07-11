import { getAnonServerClient } from '@/server/dal/anon-client'
import { SITE_URL } from '@/server/metadata/site'
import { routing } from '@/i18n/routing'

/**
 * SEO-008/009 — sitemap. Ported ~verbatim from the audited api/sitemap.ts
 * (live query, no-store — a deleted product disappears automatically), then
 * HARDENED: adds /custom-builds, per-locale `xhtml:link` alternates (en/ar +
 * x-default, 08 §Metadata), and keeps the category live query. Legal pages are
 * intentionally excluded (thin/duplicated aliases — SEO-009 decision).
 *
 * Route Handler lives OUTSIDE [locale] and is excluded from the proxy matcher
 * (03 §Route Handlers). Reads run through a cookie-less anon client, so the
 * handler is dynamic by construction under cacheComponents (no cache directive
 * needed — a route-segment `dynamic` const is build-rejected here).
 */

const STATIC_PATHS = [
  '/',
  '/products',
  '/custom-builds',
  '/customers',
  '/gallery',
  '/about',
  '/contact',
] as const

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function loc(path: string): string {
  return `${SITE_URL}${path === '/' ? '/' : path}`
}

/** EN unprefixed, AR under /ar — matches the metadata builder's localeUrl. */
function altUrl(locale: string, path: string): string {
  const clean = path === '/' ? '' : path
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  return `${SITE_URL}${`${prefix}${clean}` || '/'}`
}

function urlEntry(path: string, lastmod?: string): string {
  const alternates = [...routing.locales, 'x-default']
    .map((l) => {
      const hreflang = l === 'x-default' ? 'x-default' : l
      const target = altUrl(l === 'x-default' ? routing.defaultLocale : l, path)
      return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(target)}" />`
    })
    .join('\n')
  const lastmodEl = lastmod ? `\n    <lastmod>${xml(lastmod)}</lastmod>` : ''
  return `  <url>\n    <loc>${xml(loc(path))}</loc>${lastmodEl}\n${alternates}\n  </url>`
}

function isoDate(value: string | null): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export async function GET() {
  const supabase = getAnonServerClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug,created_at').eq('is_active', true).order('created_at'),
    supabase.from('categories').select('slug,created_at').order('created_at'),
  ])

  const entries: string[] = []
  for (const p of STATIC_PATHS) entries.push(urlEntry(p))
  for (const row of products ?? []) {
    if (row.slug) entries.push(urlEntry(`/products/${row.slug}`, isoDate(row.created_at)))
  }
  for (const row of categories ?? []) {
    if (row.slug) entries.push(urlEntry(`/categories/${row.slug}`, isoDate(row.created_at)))
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
