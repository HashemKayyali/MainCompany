import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronDown, Package } from 'lucide-react'
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

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const card = isDark
    ? 'border border-purple-500/20 bg-purple-500/[0.07]'
    : 'border border-violet-100 bg-white shadow-sm'

  return (
    <section className="site-section">
      <div className="site-container">
        <Link
          to="/products"
          className={`mb-6 inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider transition-colors ${
            isDark ? 'text-purple-300/80 hover:text-prism-violet' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <ArrowLeft size={14} />
          Products
        </Link>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <ProductGallery
                images={product.gallery}
                name={product.name}
                videoUrl={product.videoUrl}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="mt-5"
            >
              {!!product.badge?.trim() && (
                <span
                  className={`mb-3 inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white ${
                    String(product.badgeColor || '').includes('linear-gradient')
                      ? ''
                      : `bg-gradient-to-r ${product.badgeColor}`
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

              <h1 className={`font-display text-[1.55rem] font-extrabold tracking-tight sm:text-[1.85rem] ${txt}`}>
                {product.name}
              </h1>
              <p className={`mt-2 text-[0.84rem] leading-5.5 sm:text-[0.9rem] ${sub}`}>{product.description}</p>
            </motion.div>

            <div className={`my-5 h-px ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`} />

            {product.quickOptions.length > 0 && <ProductOptions options={product.quickOptions} />}

            {product.notes.length > 0 && (
              <div className="mt-3.5 space-y-1.5">
                {product.notes.map((note, index) => (
                  <p key={index} className={`flex items-start gap-2 text-[12px] leading-5 ${sub}`}>
                    <span className="mt-px text-prism-violet/80">{'>'}</span>
                    {note}
                  </p>
                ))}
              </div>
            )}

            {(product.features.left.length > 0 || product.features.right.length > 0) && (
              <div className="mt-6">
                <ProductFeatures features={product.features} />
              </div>
            )}

            {parts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease }}
              className="mt-8"
              >
                <div
                    className={`mb-4 border-b pb-3 ${
                      isDark ? 'border-purple-500/15' : 'border-violet-100'
                    }`}
                  >
                  <h2 className={`font-display text-[1.05rem] font-bold ${txt}`}>
                    Spare Parts & Accessories
                  </h2>
                  <p className={`mt-1 text-[12px] ${sub}`}>
                    {parts.length} available for {product.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {parts.map((part, index) => (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease }}
                      className={`flex items-start gap-2.5 rounded-[14px] p-3 transition-all hover:-translate-y-0.5 ${card}`}
                    >
                      {part.image ? (
                        <div
                          className={`h-12 w-12 shrink-0 overflow-hidden rounded-[14px] ${
                            isDark ? 'bg-purple-500/10' : 'bg-violet-50'
                          }`}
                        >
                          <img
                            src={part.image}
                            alt={part.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={event => {
                              ;(event.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${
                            isDark
                              ? 'border border-purple-500/20 bg-purple-500/10'
                              : 'border border-violet-100 bg-violet-50'
                          }`}
                        >
                          <Package size={16} className={isDark ? 'text-purple-200/80' : 'text-violet-600'} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-[13px] font-semibold ${txt}`}>{part.name}</h3>
                          <span
                            className={`whitespace-nowrap text-[13px] font-display font-bold ${
                              isDark ? 'text-cyan-400' : 'text-violet-600'
                            }`}
                          >
                            {part.price} {part.currency}
                          </span>
                        </div>
                        <p className={`mt-1 line-clamp-2 text-[11px] leading-5 ${sub}`}>{part.description}</p>

                        <div className="mt-2 flex items-center gap-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              part.inStock
                                ? isDark
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-emerald-50 text-emerald-600'
                                : isDark
                                  ? 'bg-red-500/15 text-red-400'
                                  : 'bg-red-50 text-red-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                part.inStock ? 'bg-emerald-400' : 'bg-red-400'
                              }`}
                            />
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

          <div className="lg:col-span-2">
            <div className="space-y-3.5 lg:sticky lg:top-16">
              {showPrice && <PricingCard product={product} />}

              <motion.div
                id="product-commerce-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease }}
              >
                <div className={`overflow-hidden rounded-[16px] ${card}`}>
                  <div
                    className={`border-b px-4 py-3 ${
                      isDark
                        ? 'border-purple-500/20 bg-cyan-500/10'
                        : 'border-violet-50 bg-cyan-50/50'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-mono uppercase tracking-[0.22em] ${
                        isDark ? 'text-cyan-400' : 'text-cyan-600'
                      }`}
                    >
                      Rental & Purchase Options
                    </span>
                  </div>

                  <div className="p-4">
                    <p className={`mb-3.5 text-[12px] leading-6 ${sub}`}>
                      Choose whether you want to rent <strong className={txt}>{product.name}</strong> for an
                      event or request a direct purchase quote. Rental requests stay stock-aware, while
                      purchase quotes are reviewed separately by the sales team.
                    </p>

                    <button
                      onClick={() => setQuoteOpen(value => !value)}
                      className={`flex w-full items-center justify-between rounded-[14px] border px-3.5 py-2.5 text-left text-[12px] font-medium transition-all ${
                        isDark
                          ? 'border-purple-500/15 bg-purple-500/[0.07] text-purple-100/90 hover:bg-purple-500/10'
                          : 'border-violet-100 bg-violet-50/70 text-gray-600 hover:bg-violet-50'
                      }`}
                    >
                      <span>{showPrice ? "What's included in the quote?" : 'What can you customize?'}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${quoteOpen ? 'rotate-180' : ''}`}
                      />
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
                                <Check size={12} strokeWidth={3} className="shrink-0 text-cyan-400" />
                                <span className={`text-[11px] ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-3.5 space-y-2.5">
                      <ProductCommerceActions product={product} variant="detail" showContactLink />

                      <a
                        href={`${social.whatsapp}?text=${encodeURIComponent(
                          `Hi, I'd like a quote for "${product.name}" for my event.\n\nEvent details:\n- Date: \n- Location: \n- Expected guests: `
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline block w-full !rounded-[12px] !text-[11px] text-center"
                      >
                        WhatsApp Us
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {parts.length > 0 && (
                <div className={`rounded-[16px] p-3 ${card}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-[0.22em] ${
                        isDark ? 'text-purple-300/70' : 'text-gray-400'
                      }`}
                    >
                      Spare Parts
                    </span>
                    <span className={`text-[10px] font-semibold ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                      {parts.length} available
                    </span>
                  </div>

                  <div className="space-y-2">
                    {parts.slice(0, 4).map(part => (
                      <div key={part.id} className="flex items-center justify-between">
                        <span className={`text-[11px] ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>
                          {part.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-semibold ${txt}`}>
                            {part.price} {part.currency}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              part.inStock ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                        </div>
                      </div>
                    ))}

                    {parts.length > 4 && (
                      <p className={`pt-1 text-center text-[10px] ${sub}`}>+{parts.length - 4} more below</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 p-2 lg:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div
          className={`flex items-center gap-2 rounded-[16px] border p-2 backdrop-blur-lg ${
            isDark ? 'border-purple-500/20 bg-[#0d0b1a]/90' : 'border-violet-200 bg-white/90'
          }`}
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}
        >
          <div className="min-w-0 flex-1">
            <div className={`truncate text-[12px] font-bold ${txt}`}>{product.name}</div>
            {showPrice && (
              <div className={`text-[11px] ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
                From {product.rentalPricePerDay} {product.currency}/day
              </div>
            )}
          </div>
          <a href="#product-commerce-actions" className="btn-primary shrink-0 !h-8 !rounded-[12px] !px-3.5 !text-[10px]">
            View Options
          </a>
        </div>
      </div>
      <div className="h-14 lg:hidden" />
    </section>
  )
}
