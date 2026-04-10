import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  Wrench,
  Star,
  CircleDot,
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import ProductGallery from '../components/product/ProductGallery'
import ProductOptions from '../components/product/ProductOptions'
import ProductFeatures from '../components/product/ProductFeatures'
import PricingCard from '../components/store/PricingCard'
import ProductCommerceActions from '../components/product/ProductCommerceActions'
import NotFoundPage from './NotFoundPage'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Insured Equipment', color: 'cyan' },
  { icon: Truck, label: 'Full Delivery & Setup', color: 'violet' },
  { icon: Wrench, label: 'On-Site Support', color: 'pink' },
]

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getProductBySlug, getPartsByProduct } = useData()
  const { isDark } = useTheme()

  const product = getProductBySlug(slug || '')
  const parts = getPartsByProduct(slug || '')
  const [quoteOpen, setQuoteOpen] = useState(false)

  const showPrice = product ? product.showPrice !== false : true

  usePageMeta({
    title: product?.name || 'Product',
    description: product?.description || 'View product details and submit rental or purchase requests.',
    ogImage: product?.gallery?.[0],
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.gallery?.[0],
          ...(showPrice
            ? {
                offers: {
                  '@type': 'Offer',
                  price: product.rentalPricePerDay,
                  priceCurrency: product.currency || 'JOD',
                  availability: 'https://schema.org/InStock',
                },
              }
            : {}),
        }
      : undefined,
  })

  if (!product) return <NotFoundPage />

  /* ── Theme tokens ── */
  const divider = isDark ? 'border-white/[0.07]' : 'border-violet-100/60'
  const headingText = isDark ? 'text-white' : 'text-slate-900'
  const bodyText = isDark ? 'text-slate-300/85' : 'text-slate-600'
  const labelText = isDark ? 'text-slate-500' : 'text-slate-400'
  const metaLabel = isDark ? 'text-slate-500' : 'text-slate-400'

  const cardBg = isDark
    ? 'border border-white/[0.08] bg-[linear-gradient(165deg,rgba(16,13,34,0.97),rgba(10,9,26,0.98))] shadow-[0_20px_48px_rgba(2,4,14,0.36),inset_0_1px_0_rgba(255,255,255,0.045)]'
    : 'border border-violet-100/80 bg-white shadow-[0_6px_28px_rgba(124,58,237,0.07)]'

  return (
    <section className="relative site-section overflow-hidden">

      {/* ── Ambient page glow ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {isDark && (
          <>
            <div className="absolute -top-32 right-[10%] h-[480px] w-[480px] rounded-full bg-violet-600/[0.10] blur-[60px]" />
            <div className="absolute top-1/2 -left-24 h-[320px] w-[320px] rounded-full bg-cyan-500/[0.07] blur-[50px]" />
          </>
        )}
      </div>

      <div className="relative site-container">

        {/* ── Breadcrumb ── */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          aria-label="breadcrumb"
          className="mb-8 flex items-center gap-2"
        >
          <Link
            to="/products"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
              isDark
                ? 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-violet-400/24 hover:bg-violet-500/[0.08] hover:text-violet-300'
                : 'border-violet-100 bg-white text-slate-400 hover:border-violet-300/60 hover:text-violet-600 shadow-sm'
            }`}
          >
            <ArrowLeft size={11} strokeWidth={2.5} />
            All Products
          </Link>

          {product.categoryTags[0] && (
            <>
              <ChevronRight size={11} className={`${isDark ? 'text-white/18' : 'text-slate-300'}`} />
              <span className={`text-[11px] font-medium ${metaLabel}`}>{product.categoryTags[0]}</span>
            </>
          )}
          <ChevronRight size={11} className={`${isDark ? 'text-white/18' : 'text-slate-300'}`} />
          <span className={`max-w-[200px] truncate text-[11px] font-semibold sm:max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {product.name}
          </span>
        </motion.nav>

        {/* ── Main Layout Grid ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10 xl:gap-12">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="lg:col-span-3 space-y-8">

            {/* ── Gallery ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <ProductGallery
                images={product.gallery}
                name={product.name}
                videoUrl={product.videoUrl}
              />
            </motion.div>

            {/* ── Product Identity ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
            >
              {/* Badge row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {!!product.badge?.trim() && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_4px_14px_rgba(0,0,0,0.22)] ${
                      String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`
                    }`}
                    style={
                      String(product.badgeColor || '').includes('linear-gradient')
                        ? { backgroundImage: product.badgeColor }
                        : undefined
                    }
                  >
                    <Star size={8} fill="currentColor" strokeWidth={0} className="opacity-80" />
                    {product.badge}
                  </span>
                )}
                {product.categoryTags[0] && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] ${
                      isDark
                        ? 'bg-violet-500/[0.15] text-violet-300/92 ring-1 ring-violet-400/[0.2]'
                        : 'bg-violet-50 text-violet-600 ring-1 ring-violet-200/70'
                    }`}
                  >
                    <CircleDot size={8} />
                    {product.categoryTags[0]}
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1
                className={`font-display font-extrabold leading-[0.93] tracking-[-0.05em] ${headingText}`}
                style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3rem)' }}
              >
                {product.name}
              </h1>

              {/* Description */}
              <p className={`mt-5 text-[1rem] leading-[1.78] ${bodyText}`}>
                {product.description}
              </p>

              {/* Trust badge bar */}
              <div
                className={`mt-6 flex flex-wrap gap-2.5 rounded-[16px] border p-3.5 ${
                  isDark
                    ? 'border-white/[0.06] bg-white/[0.025]'
                    : 'border-slate-200/60 bg-slate-50/60'
                }`}
              >
                {TRUST_BADGES.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold ${
                      isDark
                        ? 'border-white/[0.07] bg-white/[0.05] text-slate-300/90'
                        : 'border-slate-200 bg-white text-slate-600 shadow-sm'
                    }`}
                  >
                    <Icon
                      size={12}
                      className={
                        color === 'cyan'
                          ? isDark ? 'text-cyan-400/80' : 'text-cyan-600'
                          : color === 'pink'
                          ? isDark ? 'text-pink-400/80' : 'text-pink-600'
                          : isDark ? 'text-violet-400/80' : 'text-violet-600'
                      }
                    />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Gradient divider ── */}
            <hr className="hr-glow" />

            {/* ── Available Options ── */}
            {product.quickOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14, ease }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <h2 className={`text-[11px] font-bold uppercase tracking-[0.16em] ${labelText}`}>
                    Available Options
                  </h2>
                  <div className={`h-px flex-1 ${divider}`} />
                </div>
                <ProductOptions options={product.quickOptions} />
              </motion.div>
            )}

            {/* ── Important Notes ── */}
            {product.notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.17, ease }}
                className={`rounded-[18px] overflow-hidden border-l-[3px] ${
                  isDark
                    ? 'border-l-violet-500/60 border border-white/[0.06] bg-violet-500/[0.04]'
                    : 'border-l-violet-400 border border-violet-100/60 bg-violet-50/50'
                }`}
              >
                <div
                  className={`px-5 py-3 border-b ${
                    isDark ? 'border-white/[0.05]' : 'border-violet-100/50'
                  }`}
                >
                  <span className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${
                    isDark ? 'text-violet-300/70' : 'text-violet-500/80'
                  }`}>
                    Important Notes
                  </span>
                </div>
                <div className="space-y-2.5 px-5 py-4">
                  {product.notes.map((note, index) => (
                    <p key={index} className={`flex items-start gap-2.5 text-[13px] leading-[1.7] ${bodyText}`}>
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? 'bg-violet-400/70' : 'bg-violet-500'}`} />
                      {note}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Specifications ── */}
            {(product.features.left.length > 0 || product.features.right.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <h2 className={`font-display text-[1.12rem] font-bold tracking-tight ${headingText}`}>
                    Specifications
                  </h2>
                  <div className={`h-px flex-1 ${divider}`} />
                </div>
                <div
                  className={`overflow-hidden rounded-[18px] ${
                    isDark
                      ? 'border border-white/[0.07] bg-white/[0.025]'
                      : 'border border-violet-100/60 bg-white shadow-sm'
                  }`}
                >
                  <div className="p-1">
                    <ProductFeatures features={product.features} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Spare Parts & Accessories ── */}
            {parts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24, ease }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <h2 className={`font-display text-[1.12rem] font-bold tracking-tight ${headingText}`}>
                    Spare Parts &amp; Accessories
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-100 text-violet-600'
                    }`}
                  >
                    {parts.length}
                  </span>
                  <div className={`h-px flex-1 ${divider}`} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {parts.map((part, index) => (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.26 + index * 0.05, ease }}
                      className={`group relative flex items-start gap-3.5 overflow-hidden rounded-[18px] p-4 transition-all duration-350 hover:-translate-y-0.5 ${cardBg}`}
                      style={{ willChange: 'transform' }}
                    >
                      {/* Hover glow — no transform, prevents flickering */}
                      <div
                        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[18px] ${
                          isDark
                            ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10)_0%,transparent_60%)]'
                            : 'bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.04)_0%,transparent_60%)]'
                        }`}
                        aria-hidden="true"
                      />

                      {/* Part image / icon */}
                      {part.image ? (
                        <div
                          className={`relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[13px] ${
                            isDark ? 'bg-white/[0.06] ring-1 ring-white/[0.07]' : 'bg-slate-100 ring-1 ring-slate-200/60'
                          }`}
                        >
                          <img
                            src={part.image}
                            alt={part.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={e => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[13px] ${
                            isDark
                              ? 'border border-white/[0.07] bg-white/[0.04]'
                              : 'border border-slate-200 bg-slate-50'
                          }`}
                        >
                          <Package size={20} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                        </div>
                      )}

                      {/* Part info */}
                      <div className="relative min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-[13.5px] font-semibold leading-snug ${headingText}`}>
                            {part.name}
                          </h3>
                          <span
                            className={`shrink-0 font-display text-[14px] font-black tracking-[-0.03em] ${
                              isDark ? 'text-cyan-400' : 'text-violet-600'
                            }`}
                          >
                            {part.price} {part.currency}
                          </span>
                        </div>

                        <p className={`mt-1.5 line-clamp-2 text-[12px] leading-[1.62] ${bodyText}`}>
                          {part.description}
                        </p>

                        <div className="mt-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-semibold ${
                              part.inStock
                                ? isDark
                                  ? 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20'
                                  : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60'
                                : isDark
                                  ? 'bg-red-500/12 text-red-400 ring-1 ring-red-500/20'
                                  : 'bg-red-50 text-red-500 ring-1 ring-red-200/60'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${part.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {part.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ═══════════ RIGHT COLUMN (Sticky Sidebar) ═══════════ */}
          <div className="lg:col-span-2">
            <div className="space-y-4 lg:sticky lg:top-[calc(var(--app-navbar-height)+1.5rem)]">

              {/* ── Pricing Card ── */}
              {showPrice && (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.65, delay: 0.08, ease }}
                >
                  <PricingCard product={product} />
                </motion.div>
              )}

              {/* ── Commerce Actions Card ── */}
              <motion.div
                id="product-commerce-actions"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease }}
              >
                <div className={`overflow-hidden rounded-[22px] ${cardBg}`}>

                  {/* Card header */}
                  <div
                    className={`border-b px-5 py-4 ${
                      isDark
                        ? 'border-white/[0.07] bg-[linear-gradient(135deg,rgba(34,211,238,0.09),rgba(124,58,237,0.07))]'
                        : 'border-violet-100/60 bg-gradient-to-r from-cyan-50/60 to-violet-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${
                        isDark ? 'text-cyan-400/80' : 'text-cyan-600'
                      }`}>
                        Rental &amp; Purchase
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.65)]" />
                        <span className={`text-[9px] font-semibold ${isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
                          Ready to book
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Context copy */}
                    <p className={`text-[12.5px] leading-[1.68] ${bodyText}`}>
                      Rent{' '}
                      <strong className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                        {product.name}
                      </strong>{' '}
                      for your event or request a purchase quote. Rental requests are stock-aware; purchase quotes go to the sales team.
                    </p>

                    {/* CTA buttons */}
                    <ProductCommerceActions product={product} variant="detail" showContactLink />

                    {/* WhatsApp */}
                    <a
                      href={`${social.whatsapp}?text=${encodeURIComponent(
                        `Hi, I'd like a quote for "${product.name}" for my event.\n\nEvent details:\n- Date: \n- Location: \n- Expected guests: `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-2 rounded-[13px] px-4 py-2.5 text-[12px] font-semibold transition-all duration-300 ${
                        isDark
                          ? 'border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300 hover:bg-emerald-500/[0.14] hover:border-emerald-500/32'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 hover:border-emerald-300'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp Inquiry
                    </a>

                    {/* Expandable what's included */}
                    <div>
                      <button
                        onClick={() => setQuoteOpen(v => !v)}
                        className={`flex w-full items-center justify-between rounded-[13px] border px-4 py-3 text-left text-[12px] font-medium transition-all duration-250 ${
                          isDark
                            ? 'border-white/[0.07] bg-white/[0.03] text-slate-400 hover:bg-white/[0.05] hover:text-slate-300'
                            : 'border-slate-200/70 bg-slate-50/80 text-slate-500 hover:bg-slate-100/80 hover:text-slate-600'
                        }`}
                      >
                        <span>{showPrice ? "What's included in the quote?" : 'Customization options'}</span>
                        <ChevronDown
                          size={14}
                          className={`shrink-0 transition-transform duration-300 ${quoteOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {quoteOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 gap-1.5 pt-3">
                              {[
                                'Equipment rental & delivery',
                                'Professional on-site staff',
                                'Setup & dismantling',
                                'Custom branding (optional)',
                                'Insurance coverage',
                                'Spare parts availability',
                              ].map(item => (
                                <div key={item} className="flex items-center gap-2">
                                  <Check
                                    size={11}
                                    strokeWidth={3}
                                    className={`shrink-0 ${isDark ? 'text-cyan-400' : 'text-violet-500'}`}
                                  />
                                  <span className={`text-[12px] ${bodyText}`}>{item}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Parts Summary Card ── */}
              {parts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.26, ease }}
                >
                  <div className={`overflow-hidden rounded-[20px] ${cardBg}`}>
                    <div
                      className={`border-b px-4 py-3.5 ${
                        isDark ? 'border-white/[0.07]' : 'border-violet-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${labelText}`}>
                          Spare Parts
                        </span>
                        <span className={`text-[11.5px] font-bold ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                          {parts.length} available
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      {parts.slice(0, 4).map((part, i) => (
                        <div
                          key={part.id}
                          className={`flex items-center justify-between py-2.5 ${
                            i > 0 ? `border-t ${isDark ? 'border-white/[0.05]' : 'border-slate-100/80'}` : ''
                          }`}
                        >
                          <span className={`text-[12.5px] font-medium ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
                            {part.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-[12.5px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {part.price} {part.currency}
                            </span>
                            <span className={`h-1.5 w-1.5 rounded-full ${part.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          </div>
                        </div>
                      ))}

                      {parts.length > 4 && (
                        <p className={`pt-3 text-center text-[11.5px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          +{parts.length - 4} more parts listed below
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-3">
          <div
            className={`flex items-center gap-3 rounded-[20px] border p-3.5 ${
              isDark
                ? 'border-white/[0.11] bg-[rgba(7,7,20,0.94)] backdrop-blur-2xl shadow-[0_-12px_44px_rgba(0,0,0,0.42)]'
                : 'border-violet-200/60 bg-white/97 backdrop-blur-2xl shadow-[0_-4px_36px_rgba(15,23,42,0.13)]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[13.5px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {product.name}
              </div>
              {showPrice ? (
                <div className={`text-[12px] font-bold tracking-tight ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                  From {product.rentalPricePerDay} {product.currency}/day
                </div>
              ) : (
                <div className={`text-[12px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Custom pricing available
                </div>
              )}
            </div>
            <a
              href="#product-commerce-actions"
              className="btn-primary shrink-0 !min-h-[46px] !rounded-[15px] !px-6 !text-[12px]"
            >
              Get Options
            </a>
          </div>
        </div>
      </div>

      {/* Mobile bar spacer */}
      <div className="h-24 lg:hidden" />
    </section>
  )
}
