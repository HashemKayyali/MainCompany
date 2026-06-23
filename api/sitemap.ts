const SITE_URL = 'https://www.eventiesjo.com'

const STATIC_PATHS = [
  '/',
  '/products',
  '/customers',
  '/gallery',
  '/about',
  '/contact',
] as const

type ProductSitemapRow = {
  slug: string | null
  created_at: string | null
}

type ServerEnvironment = Record<string, string | undefined>

function getServerEnvironment(): ServerEnvironment {
  return (
    (
      globalThis as typeof globalThis & {
        process?: { env?: ServerEnvironment }
      }
    ).process?.env ?? {}
  )
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function canonicalUrl(path: string) {
  return `${SITE_URL}${path === '/' ? '/' : path}`
}

function formatLastModified(value: string | null) {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function renderUrl(location: string, lastModified?: string) {
  const lastModifiedElement = lastModified
    ? `\n    <lastmod>${escapeXml(lastModified)}</lastmod>`
    : ''

  return `  <url>
    <loc>${escapeXml(location)}</loc>${lastModifiedElement}
  </url>`
}

function renderSitemap(products: ProductSitemapRow[]) {
  const productUrls = Array.from(
    new Map(
      products
        .map(product => ({
          slug: product.slug?.trim() ?? '',
          lastModified: formatLastModified(product.created_at),
        }))
        .filter(product => product.slug.length > 0)
        .map(product => [product.slug, product] as const)
    ).values()
  )
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(product =>
      renderUrl(
        canonicalUrl(`/products/${encodeURIComponent(product.slug)}`),
        product.lastModified
      )
    )

  const urls = [
    ...STATIC_PATHS.map(path => renderUrl(canonicalUrl(path))),
    ...productUrls,
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

async function getActiveProducts() {
  const env = getServerEnvironment()
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL

  // Products are publicly readable by RLS, so prefer an anon key. The service
  // role is only a server-side fallback and must never use a VITE_ prefix.
  const supabaseKey =
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase sitemap environment variables are not configured')
  }

  const products: ProductSitemapRow[] = []
  const pageSize = 1000
  let start = 0

  for (;;) {
    const endpoint = new URL('/rest/v1/products', supabaseUrl)
    endpoint.searchParams.set('select', 'slug,created_at')
    endpoint.searchParams.set('is_active', 'eq.true')
    endpoint.searchParams.set('order', 'created_at.asc')

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'count=exact',
        Range: `${start}-${start + pageSize - 1}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Supabase product query failed with status ${response.status}`)
    }

    const data: unknown = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Supabase product query returned an invalid response')
    }

    const page = data as ProductSitemapRow[]
    products.push(...page)

    const totalValue = response.headers.get('content-range')?.split('/')[1]
    const total = totalValue && totalValue !== '*' ? Number(totalValue) : undefined

    if (page.length === 0) break

    start += page.length
    if (typeof total === 'number' && Number.isFinite(total)) {
      if (start >= total) break
    } else if (page.length < pageSize) {
      break
    }
  }

  return products
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      })
    }

    try {
      const products = await getActiveProducts()
      const sitemap = renderSitemap(products)

      return new Response(request.method === 'HEAD' ? null : sitemap, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/xml; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (error) {
      console.error('[sitemap] Failed to generate sitemap', error)

      return new Response('Sitemap temporarily unavailable', {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }
  },
}
