import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, LayoutGrid, Search } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import PageLoader from '../components/ui/PageLoader'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../utils/cn'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.eventiesjo.com'
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/images/og-default.png`
const ease = [0.16, 1, 0.3, 1] as const

function normalizeText(value?: string) {
  return value?.replace(/\s+/g, ' ').trim()
}

function getFallbackDescription(categoryName: string) {
  return `Browse ${categoryName} event services, rentals, and experiences in Jordan through Eventies.`
}

function getPublicHttpsUrl(value?: string) {
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

export default function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { categories, getProductsByCategory, loading } = useData()
  const { isDark } = useTheme()

  const normalizedSlug = slug.trim().toLowerCase()
  const category = useMemo(
    () =>
      categories.find(item => item.slug.trim().toLowerCase() === normalizedSlug),
    [categories, normalizedSlug]
  )

  const categoryProducts = useMemo(
    () => (category ? getProductsByCategory(category.id) : []),
    [category, getProductsByCategory]
  )

  const categoryName = category?.name || 'Category'
  const description = category
    ? normalizeText(category.description) || getFallbackDescription(category.name)
    : 'The requested category could not be found.'
  const canonicalPath = category
    ? `/categories/${encodeURIComponent(category.slug)}`
    : undefined
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined
  const categoryImage = getPublicHttpsUrl(category?.image)
  const categoryNotFound = !loading && !category

  const jsonLd = useMemo(() => {
    if (!category || !canonical) return undefined

    const itemListId = `${canonical}#item-list`
    const itemListElements = categoryProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
    }))

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name} Event Services in Jordan`,
        description,
        url: canonical,
        ...(categoryImage ? { image: categoryImage } : {}),
        mainEntity: { '@id': itemListId },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': itemListId,
        name: `${category.name} Event Services in Jordan`,
        itemListElement: itemListElements,
      },
    ]
  }, [canonical, category, categoryImage, categoryProducts, description])

  usePageMeta({
    title: categoryNotFound
      ? 'Category Not Found | Eventies'
      : `${categoryName} Event Services in Jordan | Eventies`,
    description,
    canonical,
    image: categoryImage || DEFAULT_SOCIAL_IMAGE,
    imageAlt: category ? `${category.name} event services in Jordan` : undefined,
    type: 'website',
    noIndex: categoryNotFound,
    jsonLd,
  })

  if (loading && !category) return <PageLoader />
  if (!category) return <NotFoundPage />

  const headingText = isDark ? 'text-white' : 'text-slate-950'
  const bodyText = isDark ? 'text-slate-300/78' : 'text-slate-600'
  const mutedText = isDark ? 'text-slate-500' : 'text-slate-400'

  return (
    <section className="site-section bg-transparent">
      <div className="site-container">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          aria-label="breadcrumb"
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
            All Products
          </Link>
          <ChevronRight size={11} className={isDark ? 'text-white/18' : 'text-slate-300'} />
          <span className={cn('text-[11px] font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {category.name}
          </span>
        </motion.nav>

        <div
          className={cn(
            'relative overflow-hidden rounded-[28px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13',
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.74),rgba(8,8,20,0.56))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          )}
        >
          {isDark && (
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[100px]"
              aria-hidden="true"
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease }}
            className="relative mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="section-label">// Category Collection</span>
                <div className={cn('h-px w-8', isDark ? 'bg-violet-500/30' : 'bg-violet-300/50')} />
              </div>
              <h1 className={cn('section-title !text-left', headingText)}>
                {category.name} Event Services in Jordan
              </h1>
              <p className={cn('mt-4 max-w-2xl text-[0.98rem] leading-[1.72]', bodyText)}>
                {description}
              </p>
              <Link
                to="/products"
                className={cn(
                  'mt-5 inline-flex items-center gap-2 rounded-[13px] border px-5 py-2.5 text-[11.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                    : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700'
                )}
              >
                <ArrowLeft size={13} />
                Back to all products
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.52, delay: 0.1, ease }}
              className={cn(
                'shrink-0 rounded-[20px] border px-6 py-5',
                isDark
                  ? 'border-white/[0.09] bg-white/[0.04]'
                  : 'border-violet-200/60 bg-white shadow-[0_6px_24px_rgba(124,58,237,0.07)]'
              )}
            >
              <div className={cn('flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em]', mutedText)}>
                <LayoutGrid size={10} />
                Product count
              </div>
              <div className={cn('mt-1.5 font-display text-[2.6rem] font-black leading-none tracking-[-0.05em]', headingText)}>
                {categoryProducts.length}
              </div>
              <div className={cn('mt-1.5 text-[11.5px] font-medium', mutedText)}>
                service{categoryProducts.length !== 1 ? 's' : ''} in this category
              </div>
            </motion.div>
          </motion.div>

          <hr className="hr-glow mb-9" />

          {categoryProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5 2xl:grid-cols-5"
            >
              {categoryProducts.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'rounded-[22px] border border-dashed px-6 py-18 text-center',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.025]'
                  : 'border-violet-200/70 bg-slate-50/60'
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px]',
                  isDark ? 'border border-white/[0.07] bg-white/[0.06]' : 'border border-violet-100 bg-violet-50'
                )}
              >
                <Search size={20} className={isDark ? 'text-slate-600' : 'text-violet-400'} />
              </div>
              <p className={cn('font-display text-[1.08rem] font-semibold', isDark ? 'text-white/55' : 'text-slate-700')}>
                No products in this category yet
              </p>
              <p className={cn('mt-2 text-[13px]', mutedText)}>
                Browse all Eventies services while this collection is being updated.
              </p>
              <Link
                to="/products"
                className={cn(
                  'mt-5 inline-flex items-center justify-center rounded-[12px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                  isDark
                    ? 'border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/[0.16] hover:bg-white/[0.08]'
                    : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
                )}
              >
                Show all products
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
