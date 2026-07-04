import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import ProductCommerceActions from '../components/product/ProductCommerceActions'
import ProductFeatures from '../components/product/ProductFeatures'
import ProductGallery from '../components/product/ProductGallery'
import ProductOptions from '../components/product/ProductOptions'
import ProductSuggestionsCarousel from '../components/product/ProductSuggestionsCarousel'
import PageLoader from '../components/ui/PageLoader'
import {
  useCategoriesData,
  useDataMeta,
  usePartsData,
  useProductsData,
} from '../contexts/DataContext'
import { useI18n } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../utils/cn'
import NotFoundPage from './NotFoundPage'

const ease = [0.16, 1, 0.3, 1]
const SITE_URL = 'https://www.eventiesjo.com'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Insured equipment' },
  { icon: Truck, label: 'Delivery & setup' },
  { icon: Wrench, label: 'On-site support' },
]

const INCLUDED_ITEMS = [
  'Availability confirmed after review',
  'Delivery & setup on eligible services',
  'On-site support when in scope',
  'Custom branding when available',
  'Insured equipment',
  'Spare parts when required',
]

// ── Description parsing ──────────────────────────────────────────────────────
// Admin descriptions mix long prose with short bullet-like note lines (and
// sometimes label lines such as "Notes (one per line)"). Parse them into
// typed blocks so prose renders as paragraphs and notes get their own design.
type AboutBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; title?: string; items: string[] }

const LIST_LABEL_RE = /^notes?\s*(\(one per line\))?\s*:?$/i

function groupSentences(text: string): string[] {
  const sentences = text.match(/.+?[.!?](?=\s+[A-Z"“(]|\s*$)/g)
  if (!sentences || sentences.length <= 3) return [text]

  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' ').replace(/\s+/g, ' ').trim())
  }
  return paragraphs.filter(Boolean)
}

function isNoteLine(line: string) {
  if (/^[-•*]\s+/.test(line)) return true
  return line.length <= 100 && !/[.!?]$/.test(line)
}

function parseDescriptionBlocks(text: string): AboutBlock[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const lines = trimmed.split(/\n+/).map(line => line.trim()).filter(Boolean)
  if (lines.length === 1) {
    return groupSentences(lines[0]).map(paragraph => ({ type: 'paragraph', text: paragraph }))
  }

  const blocks: AboutBlock[] = []
  let pendingTitle: string | undefined

  for (const raw of lines) {
    if (LIST_LABEL_RE.test(raw)) {
      pendingTitle = 'Notes'
      continue
    }
    if (raw.length <= 48 && raw.endsWith(':')) {
      pendingTitle = raw.slice(0, -1).trim()
      continue
    }

    if (isNoteLine(raw)) {
      const item = raw.replace(/^[-•*]\s+/, '')
      const last = blocks[blocks.length - 1]
      if (last?.type === 'list' && !pendingTitle) {
        last.items.push(item)
      } else {
        blocks.push({ type: 'list', title: pendingTitle, items: [item] })
        pendingTitle = undefined
      }
    } else {
      for (const paragraph of groupSentences(raw)) {
        blocks.push({ type: 'paragraph', text: paragraph })
      }
      pendingTitle = undefined
    }
  }

  return blocks
}

function getPublicImageUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  try {
    const url = new URL(trimmed, SITE_URL)
    if (url.protocol !== 'https:') return undefined
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  // Split hooks (batch 2): this page ensures products + categories + parts.
  const { products, getProductBySlug } = useProductsData()
  const { getPartsByProduct, partsLoading } = usePartsData()
  const { categories } = useCategoriesData()
  const { loading } = useDataMeta()
  const { isDark } = useTheme()
  const { dir, translateText } = useI18n()
  const [includedOpen, setIncludedOpen] = useState(false)

  const product = getProductBySlug(slug || '')
  const parts = getPartsByProduct(slug || '')
  const showPrice = product ? product.showPrice !== false : true
  const productUrl = product
    ? `${SITE_URL}/products/${encodeURIComponent(product.slug)}`
    : undefined
  const productPrice = Number(product?.rentalPricePerDay)
  const hasVisibleProductPrice =
    !!product && showPrice && Number.isFinite(productPrice) && productPrice > 0
  const productNotFound = !loading && !product
  const productImage = product?.gallery?.[0]
  const productStructuredImage = getPublicImageUrl(productImage)
  const productImageAlt = product ? `${product.name} service for events in Jordan` : undefined

  const productJsonLd = useMemo(() => {
    if (!product || !productUrl || !hasVisibleProductPrice) return undefined

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      url: productUrl,
      ...(productStructuredImage ? { image: productStructuredImage } : {}),
      offers: {
        '@type': 'Offer',
        url: productUrl,
        price: productPrice,
        priceCurrency: product.currency || 'JOD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    }
  }, [hasVisibleProductPrice, product, productPrice, productStructuredImage, productUrl])

  const similarProducts = useMemo(() => {
    if (!product?.categoryId) return []
    return products.filter(item => item.categoryId === product.categoryId && item.slug !== product.slug)
  }, [product?.categoryId, product?.slug, products])

  usePageMeta({
    title: productNotFound
      ? 'Service Not Found | Eventies'
      : product
        ? `${product.name} for Events in Jordan | Eventies`
        : 'Event Service Rental in Jordan | Eventies',
    description: productNotFound
      ? 'The requested service could not be found.'
      : product
        ? `Request ${product.name} for corporate events, exhibitions, schools, malls, celebrations, and activations across Jordan.`
        : 'Request event services for corporate events, exhibitions, schools, malls, celebrations, and activations across Jordan.',
    image: productImage,
    imageAlt: productImageAlt,
    canonical: product
      ? productUrl
      : undefined,
    type: product ? 'product' : 'website',
    noIndex: productNotFound,
    jsonLd: productJsonLd,
  })

  if (loading && !product) return <PageLoader />
  if (!product) return <NotFoundPage />
  // Parts are lazy-loaded (batch 2). Hold the page loader until they resolve
  // so the "What's included" section never flashes in late or reads as
  // "no parts" while the fetch is still in flight. Cached non-empty parts
  // count as loaded, so warm visits still paint instantly.
  if (partsLoading) return <PageLoader />

  const categoryName =
    categories.find(category => category.id === product.categoryId)?.name || 'Marketplace'
  const headingText = isDark ? 'text-white' : 'text-slate-950'
  const bodyText = isDark ? 'text-slate-300/82' : 'text-slate-600'
  const mutedText = isDark ? 'text-slate-500' : 'text-slate-400'
  const divider = isDark ? 'border-white/[0.08]' : 'border-slate-200/80'
  const subtleDivider = isDark ? 'border-white/[0.06]' : 'border-slate-100'
  const buyBoxClass = isDark
    ? 'border-white/[0.09] bg-white/[0.035] shadow-[0_18px_54px_-42px_rgba(0,0,0,0.82)]'
    : 'border-slate-200/90 bg-white/96 shadow-[0_16px_46px_-38px_rgba(15,23,42,0.40)]'

  const rentalEnabled = product.rentalEnabled !== false
  const saleEnabled = product.saleEnabled !== false

  // Short description = lead under the title; full description = "About this
  // service" section. When only the full text exists, its first paragraph
  // becomes the lead so the header never carries a wall of text.
  const shortDescription = product.shortDescription?.trim() || ''
  const fullDescription = product.description?.trim() || ''
  let leadDescription = shortDescription
  let aboutBlocks: AboutBlock[] = []
  if (shortDescription && fullDescription && fullDescription !== shortDescription) {
    aboutBlocks = parseDescriptionBlocks(fullDescription)
  } else if (!shortDescription && fullDescription) {
    const blocks = parseDescriptionBlocks(fullDescription)
    if (blocks[0]?.type === 'paragraph') {
      leadDescription = blocks[0].text
      aboutBlocks = blocks.slice(1)
    } else {
      aboutBlocks = blocks
    }
  }

  return (
    <section className="site-section product-details-page bg-transparent" data-i18n-manual>
      <div className="site-container">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          aria-label={translateText('Breadcrumb')}
          dir={dir}
          className="mb-6 flex min-w-0 flex-wrap items-center gap-2"
        >
          <Link
            to="/products"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-all duration-300',
              isDark
                ? 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-violet-400/24 hover:bg-violet-500/[0.08] hover:text-violet-300'
                : 'border-violet-100 bg-white text-slate-500 shadow-sm hover:border-violet-300/60 hover:text-violet-700'
            )}
          >
            <ArrowLeft size={11} strokeWidth={2.5} />
            {translateText('All Services')}
          </Link>
          <ChevronRight size={11} className={isDark ? 'text-white/18' : 'text-slate-300'} />
          <span dir="ltr" lang="en" className={cn('product-data-ltr text-[11px] font-medium', mutedText)}>{categoryName}</span>
          <ChevronRight size={11} className={isDark ? 'text-white/18' : 'text-slate-300'} />
          <span dir="ltr" lang="en" className={cn('product-data-ltr max-w-[220px] truncate text-[11px] font-semibold sm:max-w-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {product.name}
          </span>
        </motion.nav>

        <div dir="ltr" className="grid gap-7 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(460px,34vw)_minmax(0,1fr)_320px] xl:gap-8 2xl:grid-cols-[minmax(560px,36vw)_minmax(0,1fr)_330px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease }}
            className="order-2 min-w-0 lg:order-1 lg:sticky lg:top-[calc(var(--app-navbar-height)+1.25rem)]"
          >
            <ProductGallery
              images={product.gallery}
              name={product.name}
              videoUrl={product.videoUrl}
            />
          </motion.div>

          <div dir={dir} className="contents lg:order-2 lg:block lg:min-w-0">
            <motion.main
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.04, ease }}
              className="order-1 min-w-0"
            >
              <div dir="ltr" className={cn('product-data-ltr-row border-b pb-5', divider)}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {!!product.badge?.trim() && (
                    <span
                      dir="ltr"
                      lang="en"
                      className={cn(
                        'product-data-ltr inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]',
                        String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`
                      )}
                      style={
                        String(product.badgeColor || '').includes('linear-gradient')
                          ? { backgroundImage: product.badgeColor }
                          : undefined
                      }
                    >
                      <Star size={8} fill="currentColor" strokeWidth={0} />
                      {product.badge}
                    </span>
                  )}
                  <span
                    dir="ltr"
                    lang="en"
                    className={cn(
                      'product-data-ltr inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]',
                      isDark
                        ? 'bg-violet-500/[0.15] text-violet-300/92 ring-1 ring-violet-400/[0.2]'
                        : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/70'
                    )}
                  >
                    <CircleDot size={8} />
                    {categoryName}
                  </span>
                </div>

                <h1
                  dir="ltr"
                  lang="en"
                  className={cn(
                    'product-data-ltr font-display text-[2rem] font-black leading-[1.02] tracking-[-0.05em] sm:text-[2.45rem] lg:text-[2.2rem] xl:text-[2.55rem]',
                    headingText
                  )}
                >
                  {product.name}
                </h1>

                {!!leadDescription && (
                  <p
                    dir="ltr"
                    lang="en"
                    className={cn(
                      'product-data-ltr mt-3.5 max-w-[68ch] text-[15px] font-medium leading-[1.7] sm:text-[16px]',
                      isDark ? 'text-slate-200/88' : 'text-slate-700'
                    )}
                  >
                    {leadDescription}
                  </p>
                )}
              </div>
            </motion.main>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.12, ease }}
              className="order-4 min-w-0"
            >
              {aboutBlocks.length > 0 && (
                <DetailSection
                  title={translateText('About this service')}
                  isDark={isDark}
                >
                  <div className="space-y-4">
                    {aboutBlocks.map((block, index) =>
                      block.type === 'paragraph' ? (
                        <p
                          key={index}
                          dir="ltr"
                          lang="en"
                          className={cn('product-data-ltr max-w-[78ch] text-[14px] leading-[1.85] sm:text-[14.5px]', bodyText)}
                        >
                          {block.text}
                        </p>
                      ) : (
                        <div
                          key={index}
                          className={cn(
                            'rounded-[16px] border p-4',
                            isDark
                              ? 'border-white/[0.07] bg-white/[0.03]'
                              : 'border-violet-100 bg-violet-50/50'
                          )}
                        >
                          <div
                            dir={block.title ? 'ltr' : dir}
                            lang={block.title ? 'en' : undefined}
                            className={cn(
                              'mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]',
                              block.title && 'product-data-ltr',
                              isDark ? 'text-violet-300' : 'text-violet-600'
                            )}
                          >
                            <Sparkles size={11} strokeWidth={2.4} />
                            {block.title || translateText('Highlights')}
                          </div>
                          <div dir="ltr" className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                            {block.items.map(item => (
                              <div key={item} className="flex items-start gap-2">
                                <span
                                  className={cn(
                                    'mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full',
                                    isDark ? 'bg-violet-400/80' : 'bg-violet-500'
                                  )}
                                />
                                <span dir="ltr" lang="en" className={cn('product-data-ltr text-[13px] leading-[1.6]', bodyText)}>
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </DetailSection>
              )}

              {product.quickOptions.length > 0 && (
                <DetailSection
                  title={translateText('Choose your setup')}
                  isDark={isDark}
                >
                  <ProductOptions options={product.quickOptions} />
                </DetailSection>
              )}

              {(product.features.left.length > 0 || product.features.right.length > 0) && (
                <DetailSection
                  title={translateText('Service Details')}
                  isDark={isDark}
                >
                  <ProductFeatures features={product.features} />
                </DetailSection>
              )}

              {product.notes.length > 0 && (
                <DetailSection
                  title={translateText('Before requesting')}
                  isDark={isDark}
                >
                  <div
                    className={cn(
                      'product-data-ltr-row space-y-3 rounded-[16px] border p-4',
                      isDark
                        ? 'border-amber-400/[0.14] bg-amber-400/[0.04]'
                        : 'border-amber-200/70 bg-amber-50/60'
                    )}
                  >
                    {product.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                            isDark
                              ? 'bg-amber-400/[0.15] text-amber-300'
                              : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {index + 1}
                        </span>
                        <p dir="ltr" lang="en" className={cn('product-data-ltr text-[13px] leading-[1.65]', bodyText)}>{note}</p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {parts.length > 0 && (
                <DetailSection
                  title={translateText('Parts and accessories')}
                  isDark={isDark}
                >
                  <div dir="ltr" className={cn('product-data-ltr-row divide-y', subtleDivider)}>
                    {parts.map(part => (
                      <div key={part.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px]',
                            isDark ? 'bg-white/[0.06] ring-1 ring-white/[0.07]' : 'bg-slate-100 ring-1 ring-slate-200/70'
                          )}
                        >
                          {part.image ? (
                            <img
                              src={part.image}
                              alt={part.name}
                              width={96}
                              height={96}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                              onError={event => {
                                ;(event.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Package size={18} className={mutedText} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 dir="ltr" lang="en" className={cn('product-data-ltr truncate text-[13px] font-bold', headingText)}>
                              {part.name}
                            </h3>
                            <span className={cn('shrink-0 text-[12px] font-black', headingText)}>
                              {part.showPrice === false ? translateText('Request') : `${part.price} ${part.currency}`}
                            </span>
                          </div>
                          <p dir="ltr" lang="en" className={cn('product-data-ltr mt-1 line-clamp-2 text-[11.5px] leading-[1.5]', mutedText)}>
                            {part.description}
                          </p>
                          <span className={cn('mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold', part.inStock ? 'text-emerald-500' : 'text-red-500')}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', part.inStock ? 'bg-emerald-400' : 'bg-red-400')} />
                            {translateText(part.inStock ? 'In Stock' : 'Out of Stock')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
            </motion.div>
          </div>

          <motion.aside
            id="product-commerce-actions"
            dir={dir}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.08, ease }}
            className={cn(
              'order-3 min-w-0 overflow-hidden rounded-[20px] border lg:sticky lg:top-[calc(var(--app-navbar-height)+1.25rem)]',
              buyBoxClass
            )}
          >
            <div
              className={cn(
                'border-b px-4 pb-4 pt-4',
                divider,
                isDark
                  ? 'bg-white/[0.02]'
                  : 'bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/60'
              )}
            >
              {showPrice ? (
                <>
                  <div className={cn('text-[9.5px] font-bold uppercase tracking-[0.18em]', mutedText)}>
                    {translateText('Starting per day')}
                  </div>
                  <div dir="ltr" className="mt-1.5 flex items-baseline gap-1.5">
                    <span className={cn('font-display text-[2.1rem] font-black leading-none tracking-[-0.04em]', headingText)}>
                      {product.rentalPricePerDay}
                    </span>
                    <span className={cn('text-[13px] font-bold', mutedText)}>{product.currency}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_20px_-8px_rgba(124,58,237,0.55)]">
                    <BadgeCheck size={19} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <div className={cn('font-display text-[1.3rem] font-black leading-tight tracking-[-0.03em]', headingText)}>
                      {translateText('Reviewed pricing')}
                    </div>
                    <div className={cn('text-[11px] font-medium', mutedText)}>
                      {translateText('Tailored quote for your event')}
                    </div>
                  </div>
                </div>
              )}

              {(rentalEnabled || saleEnabled) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rentalEnabled && (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em]',
                        isDark
                          ? 'bg-violet-500/[0.14] text-violet-300 ring-1 ring-violet-400/[0.2]'
                          : 'bg-violet-100/80 text-violet-700 ring-1 ring-violet-200/70'
                      )}
                    >
                      {translateText('Rental')}
                    </span>
                  )}
                  {saleEnabled && (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em]',
                        isDark
                          ? 'bg-fuchsia-500/[0.12] text-fuchsia-300 ring-1 ring-fuchsia-400/[0.18]'
                          : 'bg-fuchsia-100/70 text-fuchsia-700 ring-1 ring-fuchsia-200/70'
                      )}
                    >
                      {translateText('Purchase quote')}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-4">
              <ProductCommerceActions product={product} variant="detail" />

              <a
                href={`${social.whatsapp}?text=${encodeURIComponent(
                  `Hi, I'd like to ask about "${product.name}" for my event.\n\nEvent details:\n- Date: \n- Location: \n- Expected guests: `
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'mt-2 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[13px] px-3.5 py-2 text-[12px] font-bold transition-all duration-300',
                  isDark
                    ? 'border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300 hover:border-emerald-500/32 hover:bg-emerald-500/[0.14]'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100/80'
                )}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {translateText('Ask on WhatsApp')}
              </a>

              <p className={cn('mt-3.5 text-center text-[10.75px] leading-[1.6]', mutedText)}>
                {translateText('Every request is reviewed first — we confirm availability, pricing, and delivery before anything is final.')}
              </p>
            </div>

            <div
              className={cn(
                'grid grid-cols-3 border-t',
                divider,
                isDark ? 'divide-x divide-white/[0.06]' : 'divide-x divide-slate-100'
              )}
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center">
                  <Icon size={15} strokeWidth={2.2} className={isDark ? 'text-violet-300/85' : 'text-violet-600'} />
                  <span className={cn('text-[9.75px] font-bold leading-tight', isDark ? 'text-slate-300/88' : 'text-slate-600')}>
                    {translateText(label)}
                  </span>
                </div>
              ))}
            </div>

            <div className={cn('border-t px-4 py-3.5', subtleDivider)}>
              <button
                type="button"
                onClick={() => setIncludedOpen(value => !value)}
                className={cn('flex w-full items-center justify-between text-left text-[11.5px] font-bold uppercase tracking-[0.14em]', mutedText)}
              >
                {translateText("What's included")}
                <ChevronDown size={14} className={cn('transition-transform duration-300', includedOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {includedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 pt-3">
                      {INCLUDED_ITEMS.map(item => (
                        <div key={item} className="flex items-center gap-2.5">
                          <Check size={12} strokeWidth={3} className={isDark ? 'text-cyan-400' : 'text-violet-600'} />
                          <span className={cn('text-[12px]', bodyText)}>{translateText(item)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>

        </div>

        <ProductSuggestionsCarousel products={similarProducts} categoryName={categoryName} />
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-[20px] border p-3.5',
              isDark
                ? 'border-white/[0.11] bg-[rgba(7,7,20,0.94)] shadow-[0_-12px_44px_rgba(0,0,0,0.42)] backdrop-blur-2xl'
                : 'border-violet-200/60 bg-white/97 shadow-[0_-4px_36px_rgba(15,23,42,0.13)] backdrop-blur-2xl'
            )}
          >
            <div className="min-w-0 flex-1">
              <div dir="ltr" lang="en" className={cn('product-data-ltr truncate text-[13.5px] font-bold', headingText)}>
                {product.name}
              </div>
              <div className={cn('text-[12px] font-bold tracking-tight', showPrice ? (isDark ? 'text-cyan-400' : 'text-violet-600') : mutedText)}>
                {showPrice
                  ? (dir === 'rtl'
                      ? `ابتداء من ${product.rentalPricePerDay} ${product.currency} / يوم`
                      : `From ${product.rentalPricePerDay} ${product.currency}/day`)
                  : translateText('Reviewed pricing available')}
              </div>
            </div>
            <a
              href="#product-commerce-actions"
              className="btn-primary shrink-0 !min-h-[46px] !rounded-[15px] !px-6 !text-[12px]"
            >
              {translateText('Get Options')}
            </a>
          </div>
        </div>
      </div>

      <div className="h-24 lg:hidden" />
    </section>
  )
}

function DetailSection({
  title,
  isDark,
  children,
}: {
  title: string
  isDark: boolean
  children: ReactNode
}) {
  return (
    <section className={cn('border-b py-6 last:border-b-0', isDark ? 'border-white/[0.07]' : 'border-slate-200/80')}>
      <h2 className={cn('mb-4 font-display text-[1.25rem] font-black tracking-[-0.035em]', isDark ? 'text-white' : 'text-slate-950')}>
        {title}
      </h2>
      {children}
    </section>
  )
}
