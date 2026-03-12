import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import ProductGallery from '../components/product/ProductGallery'
import ProductOptions from '../components/product/ProductOptions'
import ProductFeatures from '../components/product/ProductFeatures'
import PricingCard from '../components/store/PricingCard'
import NotFoundPage from './NotFoundPage'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1]

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getProductBySlug, getPartsByProduct } = useData()
  const { isDark } = useTheme()

  const product = getProductBySlug(slug || '')
  const parts = getPartsByProduct(slug || '')
  const [quoteOpen, setQuoteOpen] = useState(false)

  usePageMeta({
    title: product?.name || 'Product',
    description: product?.description || 'View product details and book for your event.',
    ogImage: product?.gallery?.[0],
    jsonLd: product ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.gallery?.[0],
      ...(showPrice ? {
        offers: {
          '@type': 'Offer',
          price: product.rentalPricePerDay,
          priceCurrency: product.currency || 'JOD',
          availability: 'https://schema.org/InStock',
        },
      } : {}),
    } : undefined,
  })

  if (!product) return <NotFoundPage />

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const card = isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-white border border-violet-100 shadow-sm'

  // ✅ showPrice gate (undefined = true)
  const showPrice = (product as any).showPrice !== false

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/products"
          className={`inline-flex items-center gap-2 mb-8 text-[13px] font-mono tracking-wider uppercase ${
            isDark ? 'text-purple-300/80 hover:text-prism-violet' : 'text-gray-400 hover:text-violet-600'
          } transition-colors`}
        >
          {'<-'} Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* ── Left Column ── */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease }}>
              <ProductGallery images={product.gallery} name={product.name} videoUrl={product.videoUrl} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="mt-8"
            >
              {/* ✅ hide empty badge */}
              {!!product.badge?.trim() && (
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-4 ${String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`}`}
                  style={String(product.badgeColor || '').includes('linear-gradient') ? { backgroundImage: product.badgeColor } : undefined}
                >
                  {product.badge}
                </span>
              )}

              <h1 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${txt}`}>{product.name}</h1>
              <p className={`mt-4 text-lg leading-relaxed ${sub}`}>{product.description}</p>
            </motion.div>

            <div className={`my-7 h-px ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`} />

            {product.quickOptions.length > 0 && <ProductOptions options={product.quickOptions} />}

            {product.notes.length > 0 && (
              <div className="mt-5 space-y-1.5">
                {product.notes.map((n, i) => (
                  <p key={i} className={`text-[13px] flex items-start gap-2 ${sub}`}>
                    <span className="text-prism-violet/80 mt-px">{'>'}</span>
                    {n}
                  </p>
                ))}
              </div>
            )}

            {(product.features.left.length > 0 || product.features.right.length > 0) && (
              <div className="mt-7">
                <ProductFeatures features={product.features} />
              </div>
            )}

            {/* ── Parts Section ── */}
            {parts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease }}
                className="mt-12"
              >
                <div className={`mb-6 pb-4 border-b ${isDark ? 'border-purple-500/15' : 'border-violet-100'}`}>
                  <h2 className={`font-display text-xl font-bold ${txt}`}>Spare Parts & Accessories</h2>
                  <p className={`text-[13px] mt-1 ${sub}`}>{parts.length} available for {product.name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parts.map((part, i) => (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}
                      className={`rounded-xl p-4 flex items-start gap-4 transition-all hover:-translate-y-0.5 ${card}`}
                    >
                      {part.image ? (
                        <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`}>
                          <img
                            src={part.image}
                            alt={part.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-violet-50 border border-violet-100'}`}>
                          <span className="text-xl">🔧</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-sm font-semibold ${txt}`}>{part.name}</h3>
                          <span className={`text-sm font-display font-bold whitespace-nowrap ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                            {part.price} {part.currency}
                          </span>
                        </div>
                        <p className={`text-[12px] mt-1 line-clamp-2 ${sub}`}>{part.description}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              part.inStock
                                ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                : isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-500'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${part.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
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

          {/* ── Right Column (Sticky) ── */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* ✅ Hide pricing card if showPrice=false */}
              {showPrice && <PricingCard product={product} />}

              {/* ── Request Quote Box ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }}>
                <div className={`rounded-2xl overflow-hidden ${card}`}>
                  <div className={`px-6 py-4 border-b ${isDark ? 'border-purple-500/20 bg-cyan-500/10' : 'border-violet-50 bg-cyan-50/50'}`}>
                    <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      💬 Request a Quote
                    </span>
                  </div>

                  <div className="p-6">
                    <p className={`text-[13px] leading-relaxed mb-5 ${sub}`}>
                      Interested in <strong className={txt}>{product.name}</strong>? Tell us about your event and we&apos;ll send you a customized quote — including setup, staffing, and branding options.
                    </p>

                    <button
                      onClick={() => setQuoteOpen(!quoteOpen)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium flex items-center justify-between transition-all ${
                        isDark
                          ? 'bg-purple-500/[0.07] hover:bg-purple-500/10 text-purple-100/90 border border-purple-500/15'
                          : 'bg-violet-50/70 hover:bg-violet-50 text-gray-600 border border-violet-100'
                      }`}
                    >
                      <span>{showPrice ? "📋 What's included in the quote?" : '📋 What can you customize?'}</span>
                      <span className={`text-lg transition-transform duration-300 ${quoteOpen ? 'rotate-180' : ''}`}>⌄</span>
                    </button>

                    <AnimatePresence>
                      {quoteOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 space-y-2">
                            {[
                              'Equipment rental & delivery',
                              'Professional on-site staff',
                              'Setup & dismantling',
                              'Custom branding (optional)',
                              'Insurance coverage',
                              'Spare parts availability',
                            ].map(item => (
                              <div key={item} className="flex items-center gap-2.5">
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-cyan-400 shrink-0">
                                  <path d="M2 6l3 3 5-6" />
                                </svg>
                                <span className={`text-[12px] ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2.5 mt-5">
                      <Link to={`/contact?product=${product.slug}`} className="btn-primary w-full !rounded-xl !text-[13px] text-center block">
                        <span>📩 Get Your Quote</span>
                      </Link>

                      <a
                        href={`${social.whatsapp}?text=${encodeURIComponent(
                          `Hi, I'd like a quote for "${product.name}" for my event.\n\nEvent details:\n- Date: \n- Location: \n- Expected guests: `
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline w-full !rounded-xl !text-[13px] text-center block"
                      >
                        WhatsApp Us
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Parts quick summary (if any) ── */}
              {parts.length > 0 && (
                <div className={`rounded-2xl p-5 ${card}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isDark ? 'text-purple-300/70' : 'text-gray-400'}`}>
                      🔧 Spare Parts
                    </span>
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>{parts.length} available</span>
                  </div>

                  <div className="space-y-2">
                    {parts.slice(0, 4).map(part => (
                      <div key={part.id} className="flex items-center justify-between">
                        <span className={`text-[12px] ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>{part.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-mono font-semibold ${txt}`}>{part.price} {part.currency}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${part.inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    ))}
                    {parts.length > 4 && <p className={`text-[11px] text-center pt-1 ${sub}`}>+{parts.length - 4} more — scroll down ↓</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile floating CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className={`rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl border ${
          isDark ? 'bg-[#0d0b1a]/90 border-purple-500/20' : 'bg-white/90 border-violet-200'
        }`} style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold truncate ${txt}`}>{product.name}</div>
            {showPrice && (
              <div className={`text-xs ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                From {product.rentalPricePerDay} {product.currency}/day
              </div>
            )}
          </div>
          <Link to={`/contact?product=${product.slug}`} className="btn-primary !h-10 !px-5 !rounded-xl !text-[12px] shrink-0">
            Get Quote
          </Link>
        </div>
      </div>
      {/* Spacer for floating bar */}
      <div className="lg:hidden h-20" />
    </section>
  )
}