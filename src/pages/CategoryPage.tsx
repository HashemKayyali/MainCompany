import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, LayoutGrid, Search } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import FramedImage from '../components/ui/FramedImage'
import PageLoader from '../components/ui/PageLoader'
import { useCategoriesData, useDataMeta, useProductsData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../utils/cn'
import NotFoundPage from './NotFoundPage'
import { useI18n } from '../contexts/LanguageContext'

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
  const { categories } = useCategoriesData()
  const { getProductsByCategory } = useProductsData()
  const { loading } = useDataMeta()
  const { isDark } = useTheme()
  const { locale, translateText } = useI18n()

  const normalizedSlug = slug.trim().toLowerCase()
  const category = useMemo(
    () => categories.find(item => item.slug.trim().toLowerCase() === normalizedSlug),
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
  const localizedSubtitle = locale === 'ar' ? 'خدمات فعاليات في الأردن' : 'Event Services in Jordan'
  const localizedCollectionCaption = locale === 'ar'
    ? 'مجموعة مختارة من خدمات وتجارب الفعاليات'
    : 'A curated collection of event services and experiences'

  return (
    <section
      dir="ltr"
      data-i18n-manual
      className="site-section bg-transparent"
    >
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
            <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{translateText('All Services')}</span>
          </Link>
          <ChevronRight size={11} className={isDark ? 'text-white/18' : 'text-slate-300'} />
          <span
            dir="ltr"
            lang="en"
            data-i18n-skip
            className={cn('text-[11px] font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}
          >
            {category.name}
          </span>
        </motion.nav>

        <div
          className={cn(
            'relative overflow-hidden rounded-[30px] border p-3 sm:p-4 lg:p-5',
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(145deg,rgba(14,12,32,0.78),rgba(8,8,20,0.58))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/92 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0',
              isDark
                ? 'bg-[radial-gradient(circle_at_14%_18%,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(217,70,239,0.08),transparent_28%)]'
                : 'bg-[radial-gradient(circle_at_14%_18%,rgba(124,58,237,0.08),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(217,70,239,0.05),transparent_28%)]'
            )}
          />

          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-stretch lg:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease }}
              className="flex min-w-0 flex-col justify-center px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span dir={locale === 'ar' ? 'rtl' : 'ltr'} className="section-label">
                  {translateText('Category Collection')}
                </span>
                <div className={cn('h-px w-8', isDark ? 'bg-violet-500/30' : 'bg-violet-300/50')} />
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em]',
                    isDark
                      ? 'border-violet-400/25 bg-violet-500/10 text-violet-200'
                      : 'border-violet-200 bg-violet-50 text-violet-700'
                  )}
                >
                  <LayoutGrid size={11} strokeWidth={2.4} />
                  <span className="tabular-nums" dir="ltr">{categoryProducts.length}</span>
                  <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {translateText(categoryProducts.length === 1 ? 'service' : 'services')}
                  </span>
                </span>
              </div>

              <h1
                dir="ltr"
                lang="en"
                data-i18n-skip
                className={cn(
                  'max-w-4xl text-left font-sans text-[clamp(2rem,4.2vw,4.8rem)] font-black leading-[0.98] tracking-[-0.055em]',
                  headingText
                )}
              >
                {category.name}
              </h1>

              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={cn(
                  'mt-3 max-w-2xl text-left font-sans text-[0.98rem] font-semibold sm:text-[1.08rem]',
                  isDark ? 'text-violet-200/85' : 'text-violet-700'
                )}
              >
                {localizedSubtitle}
              </p>

              <p
                dir="ltr"
                lang="en"
                data-i18n-skip
                className={cn('mt-5 max-w-3xl text-left text-[0.98rem] leading-[1.75]', bodyText)}
              >
                {description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[13px] border px-5 py-2.5 text-[11.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                    isDark
                      ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                      : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700'
                  )}
                >
                  <ArrowLeft size={13} />
                  <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{translateText('Back to all services')}</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className={cn(
                'relative min-h-[260px] overflow-hidden rounded-[24px] border sm:min-h-[320px] lg:min-h-[390px]',
                isDark ? 'border-white/[0.08] bg-white/[0.035]' : 'border-violet-100 bg-violet-50/45'
              )}
            >
              <FramedImage
                media={category.image}
                alt={category.name}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 1023px) 100vw, 42vw"
                fallbackTransform={{ fit: 'cover' }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className={cn(
                  'pointer-events-none absolute inset-0',
                  isDark
                    ? 'bg-[linear-gradient(180deg,rgba(5,6,18,0.02)_10%,rgba(5,6,18,0.10)_48%,rgba(5,6,18,0.92)_100%)]'
                    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_10%,rgba(255,255,255,0.08)_48%,rgba(245,243,255,0.96)_100%)]'
                )}
              />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-5">
                  <div className="min-w-0">
                    <div
                      dir="ltr"
                      lang="en"
                      data-i18n-skip
                      className={cn(
                        'truncate text-left font-sans text-xl font-black tracking-[-0.035em] sm:text-2xl',
                        isDark ? 'text-white' : 'text-slate-950'
                      )}
                    >
                      {category.name}
                    </div>
                    <p
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      className={cn(
                        'mt-1.5 max-w-md text-left text-[12px] leading-5 sm:text-[13px]',
                        isDark ? 'text-slate-300/80' : 'text-slate-600'
                      )}
                    >
                      {localizedCollectionCaption}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[18px] border backdrop-blur-md sm:h-[72px] sm:w-[72px]',
                      isDark
                        ? 'border-white/12 bg-black/28 text-white'
                        : 'border-white/80 bg-white/72 text-slate-950 shadow-sm'
                    )}
                  >
                    <span className="font-sans text-2xl font-black tabular-nums" dir="ltr">
                      {categoryProducts.length}
                    </span>
                    <span
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      className={cn('mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em]', mutedText)}
                    >
                      {translateText(categoryProducts.length === 1 ? 'service' : 'services')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <div className="min-w-0">
              <span dir={locale === 'ar' ? 'rtl' : 'ltr'} className="section-label">
                {translateText('Services')}
              </span>
              <h2
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={cn(
                  'mt-1.5 text-left font-sans text-xl font-black tracking-[-0.03em] sm:text-2xl',
                  headingText
                )}
              >
                {locale === 'ar' ? 'خدمات هذه الفئة' : 'Services in this category'}
              </h2>
            </div>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-bold',
                isDark
                  ? 'border-white/[0.09] bg-white/[0.04] text-slate-300'
                  : 'border-violet-100 bg-white text-slate-600 shadow-sm'
              )}
            >
              <LayoutGrid size={11} strokeWidth={2.4} />
              <span className="tabular-nums" dir="ltr">{categoryProducts.length}</span>
            </span>
          </div>

          {categoryProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              dir="ltr"
              className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5 2xl:grid-cols-5"
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
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white/55' : 'text-slate-700')}
              >
                {translateText('No services in this category yet')}
              </p>
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={cn('mt-2 text-[13px]', mutedText)}
              >
                {translateText('Browse all Eventies services while this collection is being updated.')}
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
                <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{translateText('Show all services')}</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
