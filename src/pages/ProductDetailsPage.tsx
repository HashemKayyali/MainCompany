import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronDown, ChevronRight, Package, ShieldCheck, Truck, Wrench } from 'lucide-react'
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
  { icon: ShieldCheck, label: 'Insured Equipment' },
  { icon: Truck, label: 'Full Delivery & Setup' },
  { icon: Wrench, label: 'On-Site Support' },
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

  const divider = isDark ? 'border-white/[0.07]' : 'border-violet-100/60'
  const sectionHeaderText = isDark ? 'text-white' : 'text-slate-900'
  const bodyText = isDark ? 'text-slate-300/85' : 'text-slate-600'
  const labelText = isDark ? 'text-slate-500' : 'text-slate-400'
  const cardBg = isDark
    ? 'border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,13,32,0.96),rgba(10,9,24,0.98))]'
    : 'border border-violet-100/70 bg-white shadow-[0_4px_24px_rgba(124,58,237,0.06)]'

  return (
    <section className="site-section">
      <div className="site-container">

        {/* ── Breadcrumb Navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-6 flex items-center gap-2"
        >
          <Link
            to="/products"
            className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              isDark ? 'text-slate-500 hover:text-violet-300' : 'text-slate-400 hover:text-violet-600'
            }`}
          >
            <ArrowLeft size={13} />
            Products
          </Link>
          {product.categoryTags[0] && (
            <>
              <ChevronRight size={11} className={isDark ? 'text-slate-700' : 'text-slate-300'} />
              <span className={`text-[11.5px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {product.categoryTags[0]}
              </span>
            </>
          )}
          <ChevronRight size={11} className={isDark ? 'text-slate-700' : 'text-slate-300'} />
          <span className={`truncate text-[11.5px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {product.name}
          </span>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-5 lg:gap-8">

          {/* ───────────────── LEFT COLUMN ───────────────── */}
          <div className="lg:col-span-3">

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease }}
            >
              <ProductGallery
                images={product.gallery}
                name={product.name}
                videoUrl={product.videoUrl}
              />
            </motion.div>

            {/* ── Product Identity Block ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
              className="mt-7"
            >
              {/* Badge row */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {!!product.badge?.trim() && (
                  <span
                    className={`inline-flex rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white ${
                      String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`
                    }`}
                    style={
                      String(product.badgeColor || '').includes('linear-gradient')
                        ? { backgroundImage: product.badgeColor }
                        : undefined
                    }
                  >
                    {product.badge}
                  </span>
                )}
                {product.categoryTags[0] && (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] ${
                      isDark
                        ? 'bg-violet-500/[0.13] text-violet-300/90 ring-1 ring-violet-400/[0.16]'
                        : 'bg-violet-50 text-violet-600 ring-1 ring-violet-200/70'
                    }`}
                  >
                    {product.categoryTags[0]}
                  </span>
                )}
              </div>

              {/* Product name - flagship typography */}
              <h1
                className={`font-display font-extrabold leading-[0.96] tracking-[-0.04em] ${sectionHeaderText}`}
                style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.35rem)' }}
              >
                {product.name}
              </h1>

              {/* Description */}
              <p className={`mt-4 text-[0.95rem] leading-[1.7] ${bodyText}`}>
                {product.description}
              </p>

              {/* Trust badges row */}
              <div className="mt-5 flex flex-wrap gap-2">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-semibold ${
                      isDark
                        ? 'border border-white/[0.07] bg-white/[0.04] text-slate-400'
                        : 'border border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Icon size={11} className={isDark ? 'text-cyan-400/80' : 'text-violet-500'} />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className={`my-7 h-px ${divider}`} />

            {/* ── Quick Options ── */}
            {product.quickOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease }}
                className="mb-6"
              >
                <h2 className={`mb-3.5 text-[12px] font-bold uppercase tracking-[0.16em] ${labelText}`}>
                  Available Options
                </h2>
                <ProductOptions options={product.quickOptions} />
              </motion.div>
            )}

            {/* ── Notes ── */}
            {product.notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease }}
                className={`mb-7 overflow-hidden rounded-[16px] ${
                  isDark
                    ? 'border border-white/[0.06] bg-white/[0.025]'
                    : 'border border-slate-200/60 bg-slate-50/80'
                }`}
              >
                <div
                  className={`border-b px-4 py-2.5 ${
                    isDark ? 'border-white/[0.05]' : 'border-slate-200/60'
                  }`}
                >
                  <span className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${labelText}`}>
                    Important Notes
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  {product.notes.map((note, index) => (
                    <p key={index} className={`flex items-start gap-2.5 text-[12.5px] leading-[1.65] ${bodyText}`}>
                      <span className={`mt-0.5 shrink-0 ${isDark ? 'text-violet-400/70' : 'text-violet-500'}`}>›</span>
                      {note}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Features / Specifications ── */}
            {(product.features.left.length > 0 || product.features.right.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease }}
                className="mb-7"
              >
                <div className="mb-4 flex items-center gap-3">
                  <h2 className={`font-display text-[1.1rem] font-bold tracking-tight ${sectionHeaderText}`}>
                    Specifications
                  </h2>
                  <div className={`h-px flex-1 ${divider}`} />
                </div>
                <ProductFeatures features={product.features} />
              </motion.div>
            )}

            {/* ── Spare Parts & Accessories ── */}
            {parts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease }}
                className="mt-2"
              >
                <div className="mb-5 flex items-center gap-3">
                  <h2 className={`font-display text-[1.1rem] font-bold tracking-tight ${sectionHeaderText}`}>
                    Spare Parts &amp; Accessories
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isDark
                        ? 'bg-violet-500/15 text-violet-300'
                        : 'bg-violet-100 text-violet-600'
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
                      transition={{ duration: 0.4, delay: 0.28 + index * 0.05, ease }}
                      className={`group flex items-start gap-3.5 rounded-[18px] p-3.5 transition-all duration-300 hover:-translate-y-0.5 ${cardBg}`}
                    >
                      {/* Part image/icon */}
                      {part.image ? (
                        <div className={`h-14 w-14 shrink-0 overflow-hidden rounded-[14px] ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
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
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] ${
                            isDark
                              ? 'border border-white/[0.07] bg-white/[0.04]'
                              : 'border border-slate-200 bg-slate-50'
                          }`}
                        >
                          <Package size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                      )}

                      {/* Part info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-[13.5px] font-semibold leading-tight ${sectionHeaderText}`}>
                            {part.name}
                          </h3>
                          <span
                            className={`shrink-0 font-display text-[13.5px] font-bold ${
                              isDark ? 'text-cyan-400' : 'text-violet-600'
                            }`}
                          >
                            {part.price} {part.currency}
                          </span>
                        </div>

                        <p className={`mt-1.5 line-clamp-2 text-[11.5px] leading-[1.6] ${bodyText}`}>
                          {part.description}
                        </p>

                        <div className="mt-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.75 text-[9.5px] font-semibold ${
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

          {/* ───────────────── RIGHT COLUMN (Sticky Sidebar) ───────────────── */}
          <div className="lg:col-span-2">
            <div className="space-y-4 lg:sticky lg:top-[calc(var(--app-navbar-height)+1.5rem)]">

              {/* Pricing Card */}
              {showPrice && (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease }}
                >
                  <PricingCard product={product} />
                </motion.div>
              )}

              {/* Commerce Actions Card */}
              <motion.div
                id="product-commerce-actions"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.18, ease }}
              >
                <div className={`overflow-hidden rounded-[22px] ${cardBg}`}>

                  {/* Card header */}
                  <div
                    className={`border-b px-5 py-4 ${
                      isDark
                        ? 'border-white/[0.07] bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(124,58,237,0.06))]'
                        : 'border-violet-100/60 bg-gradient-to-r from-cyan-50/70 to-violet-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-cyan-400/80' : 'text-cyan-600'}`}>
                        Rental &amp; Purchase
                      </span>
                      <div className={`h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]`} />
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Context description */}
                    <p className={`mb-4 text-[12px] leading-[1.65] ${bodyText}`}>
                      Rent <strong className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{product.name}</strong> for your event or request a purchase quote. Rental requests are stock-aware; purchase quotes are reviewed by the sales team.
                    </p>

                    {/* CTA buttons */}
                    <div className="space-y-2.5">
                      <ProductCommerceActions product={product} variant="detail" showContactLink />

                      <a
                        href={`${social.whatsapp}?text=${encodeURIComponent(
                          `Hi, I'd like a quote for "${product.name}" for my event.\n\nEvent details:\n- Date: \n- Location: \n- Expected guests: `
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-2.5 text-[12px] font-semibold transition-all duration-300 ${
                          isDark
                            ? 'border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300 hover:bg-emerald-500/[0.14] hover:border-emerald-500/30'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp Inquiry
                      </a>
                    </div>

                    {/* Expandable: What's included */}
                    <div className="mt-4">
                      <button
                        onClick={() => setQuoteOpen(v => !v)}
                        className={`flex w-full items-center justify-between rounded-[13px] border px-3.5 py-2.5 text-left text-[11.5px] font-medium transition-all duration-200 ${
                          isDark
                            ? 'border-white/[0.07] bg-white/[0.03] text-slate-400 hover:bg-white/[0.05] hover:text-slate-300'
                            : 'border-slate-200/70 bg-slate-50/80 text-slate-500 hover:bg-slate-100/80'
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
                            <div className="space-y-1.5 pt-3">
                              {[
                                'Equipment rental & delivery',
                                'Professional on-site staff',
                                'Setup & dismantling',
                                'Custom branding (optional)',
                                'Insurance coverage',
                                'Spare parts availability',
                              ].map(item => (
                                <div key={item} className="flex items-center gap-2">
                                  <Check size={11} strokeWidth={3} className={`shrink-0 ${isDark ? 'text-cyan-400' : 'text-violet-500'}`} />
                                  <span className={`text-[11.5px] ${bodyText}`}>{item}</span>
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

              {/* Parts Summary Card */}
              {parts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.28, ease }}
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
                        <span className={`text-[11px] font-bold ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                          {parts.length} available
                        </span>
                      </div>
                    </div>

                    <div className="divide-y p-4 space-y-0 ${divider}">
                      {parts.slice(0, 4).map((part, i) => (
                        <div
                          key={part.id}
                          className={`flex items-center justify-between py-2.5 ${
                            i > 0 ? (isDark ? 'border-t border-white/[0.05]' : 'border-t border-slate-100/80') : ''
                          }`}
                        >
                          <span className={`text-[12px] font-medium ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
                            {part.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-[12px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {part.price} {part.currency}
                            </span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${part.inStock ? 'bg-emerald-400' : 'bg-red-400'}`}
                            />
                          </div>
                        </div>
                      ))}

                      {parts.length > 4 && (
                        <p className={`pt-3 text-center text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          +{parts.length - 4} more below
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
                ? 'border-white/[0.10] bg-[rgba(8,8,22,0.92)] backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.35)]'
                : 'border-violet-200/60 bg-white/95 backdrop-blur-xl shadow-[0_-4px_32px_rgba(15,23,42,0.12)]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[13.5px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {product.name}
              </div>
              {showPrice ? (
                <div className={`text-[11.5px] font-semibold ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                  From {product.rentalPricePerDay} {product.currency}/day
                </div>
              ) : (
                <div className={`text-[11.5px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Custom pricing
                </div>
              )}
            </div>
            <a
              href="#product-commerce-actions"
              className="btn-primary shrink-0 !min-h-[46px] !rounded-[15px] !px-5 !text-[12px]"
            >
              Get Options
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-24 lg:hidden" />
    </section>
  )
}
