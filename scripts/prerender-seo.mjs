import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = 'https://www.eventiesjo.com'
const SITE_NAME = 'Eventies'
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.png`
const DEFAULT_IMAGE_ALT = 'Eventies event services and vendors marketplace in Jordan'
const BRAND_LOGO_ABSOLUTE = `${SITE_URL}/brand/eventies_icon_transparent_master.png`
const DEFAULT_LOCALE = 'en_JO'
const DEFAULT_IMAGE_WIDTH = '1200'
const DEFAULT_IMAGE_HEIGHT = '630'
const DIST_DIR = path.resolve(process.cwd(), 'dist')
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html')

const GLOBAL_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'info@eventiesjo.com',
    logo: BRAND_LOGO_ABSOLUTE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  },
]

const STATIC_PAGES = [
  {
    path: '/',
    title: 'Event Services & Vendors in Jordan | Eventies',
    description:
      'Discover venues, photographers, catering, booths, equipment, entertainment, and trusted event vendors across Jordan with Eventies.',
  },
  {
    path: '/products',
    title: 'Event Services & Equipment in Jordan | Eventies',
    description:
      'Browse event rentals, interactive games, VR experiences, screens, booths, entertainment, and production services from trusted providers in Jordan.',
  },
  {
    path: '/customers',
    title: 'Eventies Clients & Event Partners in Jordan',
    description:
      'See the brands, schools, venues, and organizations that trust Eventies for event activations and experiences across Jordan.',
  },
  {
    path: '/gallery',
    title: 'Event Gallery & Activations in Jordan | Eventies',
    description:
      'Explore photos from Eventies activations, equipment setups, games, VR experiences, and corporate events across Jordan.',
  },
  {
    path: '/about',
    title: 'About Eventies | Jordan Event Services Marketplace',
    description:
      'Learn how Eventies connects event organizers with trusted services, equipment, activations, and vendors across Jordan.',
  },
  {
    path: '/contact',
    title: 'Contact Eventies | Plan an Event in Jordan',
    description:
      'Contact Eventies for event rentals, vendor services, equipment, activations, and planning support in Amman and across Jordan.',
  },
]

const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local']

function parseEnvValue(rawValue) {
  const value = rawValue.trim()
  const quote = value[0]

  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    const unquoted = value.slice(1, -1)
    return quote === '"' ? unquoted.replace(/\\n/g, '\n').replace(/\\"/g, '"') : unquoted
  }

  const commentStart = value.indexOf(' #')
  return commentStart >= 0 ? value.slice(0, commentStart).trim() : value
}

async function loadEnvFiles() {
  const loaded = new Map()

  for (const filename of ENV_FILES) {
    try {
      const file = await readFile(path.resolve(process.cwd(), filename), 'utf8')

      for (const line of file.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
        if (!match) continue

        loaded.set(match[1], parseEnvValue(match[2]))
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }

  for (const [key, value] of loaded) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function canonicalUrl(routePath) {
  return `${SITE_URL}${routePath === '/' ? '/' : routePath}`
}

function normalizePublicHttpsUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return undefined

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') return undefined
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

function getFirstPublicProductImage(product) {
  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  const galleryImage = gallery.map(normalizePublicHttpsUrl).find(Boolean)
  return galleryImage || normalizePublicHttpsUrl(product.hero_image)
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const keyCandidates = [
    anonKey ? { label: 'anon', value: anonKey } : undefined,
    serviceRoleKey && serviceRoleKey !== anonKey
      ? { label: 'service-role', value: serviceRoleKey }
      : undefined,
  ].filter(Boolean)

  if (!supabaseUrl || keyCandidates.length === 0) {
    throw new Error(
      'Supabase prerender environment variables are not configured. Set SUPABASE_URL/VITE_SUPABASE_URL and an anon key or server-only service role key.'
    )
  }

  return { supabaseUrl, keyCandidates }
}

async function fetchActiveProductsWithKey(supabaseUrl, supabaseKey) {
  const products = []
  const pageSize = 1000
  let start = 0

  for (;;) {
    const endpoint = new URL('/rest/v1/products', supabaseUrl)
    endpoint.searchParams.set(
      'select',
      'slug,title,description,hero_image,gallery,created_at,show_price,price,currency'
    )
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
    })

    if (!response.ok) {
      const error = new Error(
        `Supabase product prerender query failed with status ${response.status}`
      )
      error.status = response.status
      throw error
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Supabase product prerender query returned an invalid response')
    }

    products.push(...data)

    const totalValue = response.headers.get('content-range')?.split('/')[1]
    const total = totalValue && totalValue !== '*' ? Number(totalValue) : undefined

    if (data.length === 0) break

    start += data.length
    if (typeof total === 'number' && Number.isFinite(total)) {
      if (start >= total) break
    } else if (data.length < pageSize) {
      break
    }
  }

  return Array.from(
    new Map(
      products
        .map(product => ({
          ...product,
          slug: typeof product.slug === 'string' ? product.slug.trim() : '',
          title: typeof product.title === 'string' ? product.title.trim() : '',
        }))
        .filter(product => product.slug && product.title)
        .map(product => [product.slug, product])
    ).values()
  ).sort((a, b) => a.slug.localeCompare(b.slug))
}

async function fetchActiveProducts() {
  const { supabaseUrl, keyCandidates } = getSupabaseConfig()
  let lastError

  for (const candidate of keyCandidates) {
    try {
      const products = await fetchActiveProductsWithKey(supabaseUrl, candidate.value)

      if (
        products.length > 0 ||
        candidate.label === 'service-role' ||
        keyCandidates.length === 1
      ) {
        return products
      }

      console.warn(
        '[seo-prerender] Anon product query returned 0 products; retrying with the server-only service role key.'
      )
    } catch (error) {
      lastError = error

      if (candidate.label === 'service-role' || keyCandidates.length === 1) {
        throw error
      }

      console.warn(
        '[seo-prerender] Anon product query failed; retrying with the server-only service role key.'
      )
    }
  }

  if (lastError) throw lastError
  return []
}

function productToMeta(product) {
  const encodedSlug = encodeURIComponent(product.slug)
  const routePath = `/products/${encodedSlug}`
  const title = `${product.title} Rental in Jordan | Eventies`
  const description = `Rent or request ${product.title} for corporate events, exhibitions, schools, malls, celebrations, and activations across Jordan.`
  const productImage = getFirstPublicProductImage(product)
  const image = productImage || DEFAULT_IMAGE
  const price = Number(product.price)
  const hasVisiblePrice =
    product.show_price !== false && Number.isFinite(price) && price > 0
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || description,
    ...(productImage ? { image: productImage } : {}),
    ...(hasVisiblePrice
      ? {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: product.currency || 'JOD',
          },
        }
      : {}),
  }

  return {
    path: routePath,
    title,
    description,
    canonical: canonicalUrl(routePath),
    type: 'product',
    image,
    imageAlt: `${product.title} rental for events in Jordan`,
    jsonLd: [productJsonLd],
  }
}

function staticPageToMeta(page) {
  const canonical = canonicalUrl(page.path)

  return {
    ...page,
    canonical,
    type: 'website',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
    jsonLd: [],
  }
}

function renderSeoBlock(meta) {
  const image = normalizePublicHttpsUrl(meta.image) || DEFAULT_IMAGE
  const imageAlt = meta.imageAlt || DEFAULT_IMAGE_ALT
  const jsonLdItems = [...GLOBAL_JSON_LD, ...(Array.isArray(meta.jsonLd) ? meta.jsonLd : [])]

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    `<meta property="og:image:width" content="${DEFAULT_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${DEFAULT_IMAGE_HEIGHT}" />`,
    `<meta property="og:locale" content="${DEFAULT_LOCALE}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
    ...jsonLdItems.map(
      item => `<script type="application/ld+json">${safeJsonLd(item)}</script>`
    ),
  ]

  return `\n  ${tags.join('\n  ')}\n`
}

function stripExistingSeo(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>\s*/gi, '\n')
    .replace(/\s*<meta\b(?=[^>]*\bname=["']description["'])[^>]*>\s*/gi, '\n')
    .replace(/\s*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '\n')
    .replace(/\s*<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, '\n')
    .replace(/\s*<meta\b(?=[^>]*\bname=["']twitter:[^"']+["'])[^>]*>\s*/gi, '\n')
    .replace(
      /\s*<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
      '\n'
    )
}

function injectSeo(html, meta) {
  const stripped = stripExistingSeo(html)
  const seoBlock = renderSeoBlock(meta)
  const viewportPattern = /(<meta\b(?=[^>]*\bname=["']viewport["'])[^>]*>\s*)/i

  if (viewportPattern.test(stripped)) {
    return stripped.replace(viewportPattern, `$1${seoBlock}`)
  }

  return stripped.replace(/<head>\s*/i, `<head>${seoBlock}`)
}

function routeToFilePath(routePath) {
  if (routePath === '/') return path.join(DIST_DIR, 'index.html')

  const segments = routePath.split('/').filter(Boolean)
  return path.join(DIST_DIR, ...segments, 'index.html')
}

function routeToCleanUrlFilePath(routePath) {
  if (routePath === '/') return undefined

  const segments = routePath.split('/').filter(Boolean)
  return path.join(DIST_DIR, `${segments.join('/')}.html`)
}

async function writeRouteHtml(template, meta) {
  const html = injectSeo(template, meta)
  const filePaths = [
    routeToFilePath(meta.path),
    routeToCleanUrlFilePath(meta.path),
  ].filter(Boolean)

  for (const filePath of filePaths) {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, html, 'utf8')
  }
}

async function main() {
  await loadEnvFiles()

  const template = await readFile(TEMPLATE_PATH, 'utf8')
  const products = await fetchActiveProducts()
  const metas = [
    ...STATIC_PAGES.map(staticPageToMeta),
    ...products.map(productToMeta),
  ]

  for (const meta of metas) {
    await writeRouteHtml(template, meta)
  }

  console.log(
    `[seo-prerender] Generated SEO HTML for ${metas.length} routes (${STATIC_PAGES.length} static pages, ${products.length} product pages).`
  )
}

main().catch(error => {
  console.error('[seo-prerender] Failed to generate route-specific HTML.')
  console.error(error)
  process.exitCode = 1
})
