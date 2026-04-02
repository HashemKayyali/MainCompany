import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { parseMediaValue } from '../../utils/media-frame'
import { scrollToPosition } from '../../utils/scroll'

const ease = [0.16, 1, 0.3, 1] as const

type CategoryItem = {
  id: string
  name: string
  description?: string
  image?: string
  count: number
}

function CategoryTile({
  category,
  active,
  index,
  isDark,
  onClick,
}: {
  category: CategoryItem
  active: boolean
  index: number
  isDark: boolean
  onClick: () => void
}) {
  const imageSrc = category.image ? parseMediaValue(category.image).src : ''

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.04, ease }}
      className={`group relative w-full rounded-[16px] p-[1px] text-left transition-all duration-300 ${
        active ? '-translate-y-0.5 scale-[1.005]' : 'hover:-translate-y-0.5'
      }`}
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(196,181,253,0.88), rgba(236,72,153,0.54), rgba(34,211,238,0.34), rgba(255,255,255,0.20))'
          : isDark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03), rgba(124,58,237,0.24), rgba(34,211,238,0.14))'
            : 'linear-gradient(135deg, rgba(124,58,237,0.16), rgba(236,72,153,0.10), rgba(34,211,238,0.08), rgba(255,255,255,0.92))',
        boxShadow: active
          ? isDark
            ? '0 28px 90px rgba(76,29,149,0.28), 0 20px 48px rgba(14,165,233,0.14)'
            : '0 24px 60px rgba(124,58,237,0.18)'
          : 'none',
      }}
    >
      <div
        className={`relative aspect-[1.72/1] overflow-hidden rounded-[15px] border sm:aspect-[1.48/1] lg:aspect-[1.34/1] ${
          active
            ? isDark
              ? 'border-white/16 bg-[linear-gradient(180deg,rgba(11,14,28,0.64),rgba(6,8,18,0.36))]'
              : 'border-white/88 bg-white/76'
            : isDark
              ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,26,0.56),rgba(7,9,18,0.34))]'
              : 'border-white/80 bg-white/72'
        }`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.name}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(150deg, rgba(91,33,182,0.60), rgba(15,23,42,0.88) 48%, rgba(8,47,73,0.74))'
                : 'linear-gradient(150deg, rgba(124,58,237,0.26), rgba(255,255,255,0.94) 48%, rgba(34,211,238,0.18))',
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 16% 16%, rgba(236,72,153,0.20) 0%, transparent 36%), radial-gradient(circle at 84% 14%, rgba(34,211,238,0.18) 0%, transparent 32%), linear-gradient(180deg, rgba(2,6,23,0.04) 0%, rgba(2,6,23,0.20) 40%, rgba(2,6,23,0.78) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-px"
          style={{
            background: active
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.78), rgba(34,211,238,0.34), transparent)'
              : isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[27px]"
          style={{
            boxShadow: active
              ? 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -40px 80px rgba(2,6,23,0.24)'
              : 'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 -30px 64px rgba(2,6,23,0.16)',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-1.75">
          <div className="flex items-start justify-end">
            <span
              className={`rounded-full border px-1.75 py-[0.34rem] text-[7.25px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${
                active
                  ? 'border-white/18 bg-black/26 text-white'
                  : isDark
                    ? 'border-white/12 bg-black/24 text-white/82'
                    : 'border-white/88 bg-white/78 text-slate-800'
              }`}
            >
              {category.count} Services
            </span>
          </div>

          <div
            className={`max-w-[82%] rounded-[12px] border px-2 py-1.5 backdrop-blur-[10px] ${
              active
                ? isDark
                  ? 'border-white/18 bg-black/32 shadow-[0_18px_38px_rgba(2,6,23,0.34)]'
                  : 'border-white/90 bg-white/78 shadow-[0_14px_32px_rgba(15,23,42,0.12)]'
                : isDark
                  ? 'border-white/12 bg-black/26'
                  : 'border-white/84 bg-white/72'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-1.25 w-1.25 rounded-full ${
                  active ? 'bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]' : 'bg-white/56'
                }`}
              />
              <span
                className={`text-[7.25px] font-semibold uppercase tracking-[0.12em] ${
                  active ? 'text-cyan-100/84' : isDark ? 'text-white/62' : 'text-slate-700/70'
                }`}
              >
                {active ? 'Selected' : 'Category'}
              </span>
            </div>
            <h3
              className={`mt-0.75 font-display text-[0.82rem] font-bold leading-[1.02] tracking-[-0.05em] sm:text-[0.86rem] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
              style={{
                textShadow: isDark
                  ? '0 12px 32px rgba(2,6,23,0.92), 0 2px 10px rgba(2,6,23,0.92)'
                  : '0 8px 22px rgba(255,255,255,0.18)',
              }}
            >
              {category.name}
            </h3>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function ViewAllTile({ isDark, delay }: { isDark: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease }}
      className="w-full"
    >
      <Link
        to="/products"
        className="group block rounded-[16px] p-[1px] transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(34,211,238,0.24), rgba(124,58,237,0.34), rgba(236,72,153,0.22), rgba(255,255,255,0.08))'
            : 'linear-gradient(135deg, rgba(34,211,238,0.14), rgba(124,58,237,0.16), rgba(236,72,153,0.10), rgba(255,255,255,0.92))',
        }}
      >
        <div
          className={`relative aspect-[1.72/1] overflow-hidden rounded-[15px] border p-1.75 sm:aspect-[1.48/1] lg:aspect-[1.34/1] ${
            isDark
              ? 'border-white/10 bg-[linear-gradient(180deg,rgba(11,15,28,0.68),rgba(7,9,18,0.44))]'
              : 'border-white/82 bg-white/76'
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 18% 16%, rgba(34,211,238,0.18) 0%, transparent 34%), radial-gradient(circle at 82% 14%, rgba(236,72,153,0.14) 0%, transparent 34%), linear-gradient(180deg, rgba(8,11,20,0.20) 0%, rgba(8,11,20,0.40) 46%, rgba(8,11,20,0.82) 100%)'
                : 'radial-gradient(circle at 18% 16%, rgba(34,211,238,0.10) 0%, transparent 34%), radial-gradient(circle at 82% 14%, rgba(236,72,153,0.08) 0%, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.24) 44%, rgba(255,255,255,0.78) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
                : 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <span
                className={`rounded-full border px-1.75 py-[0.34rem] text-[7.25px] font-semibold uppercase tracking-[0.12em] ${
                  isDark
                    ? 'border-white/12 bg-white/[0.05] text-white/82'
                    : 'border-white/86 bg-white/82 text-slate-800'
                }`}
              >
                Marketplace
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-[12px] border transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-cyan-300/18 bg-black/24 text-white'
                    : 'border-violet-200/70 bg-white/82 text-violet-700'
                }`}
              >
                  <ArrowUpRight className="h-3.25 w-3.25" strokeWidth={1.9} />
              </span>
            </div>

            <div className={`max-w-[82%] rounded-[12px] border px-2 py-1.5 backdrop-blur-[10px] ${
              isDark ? 'border-white/12 bg-black/26' : 'border-white/84 bg-white/72'
            }`}>
              <div className={`text-[7.25px] font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-cyan-100/78' : 'text-violet-700/74'}`}>
                Navigation
              </div>
              <h3 className={`mt-0.75 font-display text-[0.82rem] font-bold leading-[1.02] tracking-[-0.05em] sm:text-[0.86rem] ${isDark ? 'text-white' : 'text-slate-950'}`}>
                View All
              </h3>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function CategoryTileSkeleton({ index, isDark }: { index: number; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
      className="rounded-[16px] p-[1px]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(124,58,237,0.18), rgba(34,211,238,0.08))'
          : 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08), rgba(255,255,255,0.90))',
      }}
    >
      <div
        className={`relative aspect-[1.72/1] overflow-hidden rounded-[15px] sm:aspect-[1.48/1] lg:aspect-[1.34/1] ${
          isDark
            ? 'bg-[linear-gradient(180deg,rgba(11,15,28,0.72),rgba(7,9,18,0.48))]'
            : 'bg-white/78'
        }`}
      >
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: isDark
              ? 'linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02), rgba(255,255,255,0.08))'
              : 'linear-gradient(120deg, rgba(124,58,237,0.10), rgba(124,58,237,0.03), rgba(34,211,238,0.08))',
          }}
        />
        <div className="absolute right-2.5 top-2.5 h-5 w-16 rounded-full bg-white/10" />
        <div className="absolute bottom-2.5 left-2.5 right-5 rounded-[12px] border border-white/8 bg-black/18 px-2.5 py-2 backdrop-blur-sm">
          <div className="h-2 w-14 rounded-full bg-white/10" />
          <div className="mt-2 h-4.5 w-24 rounded-full bg-white/12" />
        </div>
      </div>
    </motion.div>
  )
}

function SelectedCategoryHeader({
  category,
  count,
  isDark,
}: {
  category: CategoryItem
  count: number
  isDark: boolean
}) {
  const imageSrc = category.image ? parseMediaValue(category.image).src : ''

  return (
    <div
      className="overflow-hidden rounded-[20px] p-[1px]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(236,72,153,0.14), rgba(34,211,238,0.12), rgba(255,255,255,0.06))'
          : 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08), rgba(34,211,238,0.08), rgba(255,255,255,0.88))',
      }}
    >
      <div
        className={`rounded-[19px] border px-3.5 py-3 sm:px-4 ${
          isDark
            ? 'border-white/10 bg-[linear-gradient(180deg,rgba(11,14,28,0.62),rgba(7,9,18,0.44))] backdrop-blur-[18px]'
            : 'border-white/84 bg-white/80 backdrop-blur-[14px]'
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[14px] border border-white/12 bg-black/20">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={category.name}
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover object-center"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(145deg, rgba(124,58,237,0.42), rgba(15,23,42,0.88), rgba(34,211,238,0.28))'
                      : 'linear-gradient(145deg, rgba(124,58,237,0.18), rgba(255,255,255,0.96), rgba(34,211,238,0.12))',
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 to-transparent" />
            </div>

            <div className="min-w-0">
              <div className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-purple-100/54' : 'text-violet-700/72'}`}>
                Selected Category
              </div>
              <div className="mt-0.75 flex flex-wrap items-center gap-2.5">
                <h3 className={`font-display text-[1.04rem] font-bold tracking-[-0.04em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {category.name}
                </h3>
                <span
                  className={`rounded-full border px-2.25 py-[0.4rem] text-[8px] font-semibold uppercase tracking-[0.14em] ${
                    isDark
                      ? 'border-cyan-300/18 bg-cyan-400/[0.08] text-cyan-100'
                      : 'border-violet-200 bg-violet-50/90 text-violet-700'
                  }`}
                >
                  {count} Services
                </span>
              </div>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.75 self-start rounded-full border px-3 py-1.25 text-[8px] font-semibold uppercase tracking-[0.14em] ${
              isDark
                ? 'border-white/10 bg-white/[0.05] text-purple-100/76'
                : 'border-violet-200/80 bg-white/84 text-violet-700'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
            Curated Results
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OfferSection() {
  const { products, categories, loading } = useData()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('')
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)

  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        count: products.filter((product) => product.categoryId === category.id).length,
      })),
    [categories, products]
  )

  const activeCat = categoryItems.find((category) => category.id === activeTab)
  const filtered = activeCat
    ? products.filter((product) => product.categoryId === activeCat.id)
    : []

  useEffect(() => {
    if (!activeCat || !selectedCategoryRef.current || typeof window === 'undefined') return

    let frameOne = 0
    let frameTwo = 0

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        const header = document.querySelector('header')
        const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0
        const viewportPadding = 20
        const rect = selectedCategoryRef.current?.getBoundingClientRect()
        if (!rect) return

        const top = window.scrollY + rect.top - headerHeight - viewportPadding
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        const targetTop = Math.max(0, Math.min(top, maxTop))
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        scrollToPosition(targetTop, { immediate: prefersReducedMotion })
      })
    })

    return () => {
      window.cancelAnimationFrame(frameOne)
      window.cancelAnimationFrame(frameTwo)
    }
  }, [activeTab, activeCat])

  return (
    <section className="site-section">
      <div className="site-container">
      <div
        className="relative overflow-hidden rounded-[20px] p-[1px]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(236,72,153,0.18), rgba(34,211,238,0.14), rgba(255,255,255,0.05))'
              : 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(236,72,153,0.10), rgba(34,211,238,0.10), rgba(255,255,255,0.72))',
          }}
        >
          <div
          className={`relative overflow-hidden rounded-[19px] border px-3 py-4 sm:px-3.5 sm:py-4.5 lg:px-4 ${
              isDark
                ? 'border-white/10 bg-[linear-gradient(180deg,rgba(9,12,24,0.50),rgba(6,8,18,0.30))] backdrop-blur-[28px] shadow-[0_40px_120px_rgba(2,6,16,0.42)]'
                : 'border-white/70 bg-white/72 backdrop-blur-[22px] shadow-[0_28px_90px_rgba(124,58,237,0.12)]'
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: isDark
                  ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
                  : 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)',
                backgroundSize: '104px 104px',
                maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.76), rgba(0,0,0,0.26) 36%, transparent 76%)',
                WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.76), rgba(0,0,0,0.26) 36%, transparent 76%)',
              }}
            />
            <div
              className="pointer-events-none absolute -left-10 top-0 h-48 w-80 opacity-80 blur-3xl"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 72%)',
              }}
            />
            <div
              className="pointer-events-none absolute right-0 top-0 h-48 w-80 opacity-80 blur-3xl"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(236,72,153,0.16) 0%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 72%)',
              }}
            />
            <div
              className="pointer-events-none absolute bottom-0 right-[8%] h-56 w-80 opacity-75 blur-3xl"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 72%)',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease }}
              className="relative mb-3.5 flex flex-col gap-2.75 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-3xl text-center lg:text-left">
                <span className="section-label">// Marketplace Services</span>
                <h2 className={`section-title !mt-3 ${!isDark ? 'text-gray-900' : ''}`}>
                  What We <span className="text-glow">Offer</span>
                </h2>
                <p className={`mt-2 max-w-2xl text-[11px] leading-5 ${isDark ? 'text-purple-100/68' : 'text-gray-500'}`}>
                  Browse the marketplace through its core categories first, then reveal the matching services once you choose the world you want to explore.
                </p>
              </div>

              <div
                className="overflow-hidden rounded-[18px] p-[1px]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.20), rgba(236,72,153,0.12), rgba(34,211,238,0.10), rgba(255,255,255,0.04))'
                    : 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.08), rgba(34,211,238,0.08), rgba(255,255,255,0.82))',
                }}
              >
                <div className={`rounded-[14px] px-2.5 py-1.5 ${isDark ? 'bg-[linear-gradient(180deg,rgba(12,15,28,0.76),rgba(7,9,18,0.56))]' : 'bg-white/82'}`}>
                  <div className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-purple-100/54' : 'text-violet-700/72'}`}>
                    Browse Flow
                  </div>
                  <div className={`mt-0.75 text-[10px] ${isDark ? 'text-purple-100/64' : 'text-gray-500'}`}>
                    {activeCat ? `Showing ${activeCat.name}` : 'Choose a category to reveal its services.'}
                  </div>
                </div>
              </div>
            </motion.div>

            <div
            className="relative overflow-hidden rounded-[18px] p-[1px]"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(236,72,153,0.12), rgba(34,211,238,0.12), rgba(255,255,255,0.04))'
                  : 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(236,72,153,0.08), rgba(34,211,238,0.08), rgba(255,255,255,0.86))',
              }}
            >
              <div
                className={`relative overflow-hidden rounded-[17px] border p-1.25 sm:p-1.5 ${
                  isDark
                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,26,0.68),rgba(8,10,20,0.52))]'
                    : 'border-white/80 bg-white/78'
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage: isDark
                      ? 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
                      : 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
                    backgroundSize: '88px 88px',
                    maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.56), transparent 68%)',
                    WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.56), transparent 68%)',
                  }}
                />
                <div
                  className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-px"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, transparent, rgba(196,181,253,0.54), rgba(34,211,238,0.24), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.38), rgba(34,211,238,0.16), transparent)',
                  }}
                />

                <div className="relative grid grid-cols-1 gap-1.75 sm:grid-cols-2 lg:grid-cols-4">
                  {loading
                    ? [0, 1, 2, 3].map((index) => (
                        <CategoryTileSkeleton key={index} index={index} isDark={isDark} />
                      ))
                    : (
                        <>
                          {categoryItems.map((category, index) => (
                            <CategoryTile
                              key={category.id}
                              category={category}
                              active={activeCat?.id === category.id}
                              index={index}
                              isDark={isDark}
                              onClick={() => setActiveTab(category.id)}
                            />
                          ))}
                          <ViewAllTile isDark={isDark} delay={categoryItems.length * 0.04} />
                        </>
                      )}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeCat && (
                <motion.div
                  ref={selectedCategoryRef}
                  key={activeCat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease }}
                  className="mt-3.5 space-y-2.5"
                >
                  <SelectedCategoryHeader category={activeCat} count={filtered.length} isDark={isDark} />

                  {filtered.length > 0 ? (
                    <div
                        className={`relative overflow-hidden rounded-[18px] border p-2 sm:p-2.5 lg:p-3 ${
                        isDark
                          ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,26,0.48),rgba(7,9,18,0.34))] backdrop-blur-[18px]'
                          : 'border-white/80 bg-white/68 backdrop-blur-[16px]'
                      }`}
                    >
                      <div
                        className="pointer-events-none absolute left-[16%] right-[16%] top-0 h-px"
                        style={{
                          background: isDark
                            ? 'linear-gradient(90deg, transparent, rgba(196,181,253,0.34), rgba(34,211,238,0.18), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.26), rgba(34,211,238,0.12), transparent)',
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.10]"
                        style={{
                          backgroundImage: isDark
                            ? 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
                            : 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
                          backgroundSize: '92px 92px',
                          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.44), transparent 62%)',
                          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.44), transparent 62%)',
                        }}
                      />

                      <div className="relative grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-2.75 lg:grid-cols-3 xl:gap-3">
                        {filtered.map((product, index) => (
                          <ProductCard key={product.slug} product={product} index={index} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`overflow-hidden rounded-[18px] border px-3.5 py-8 text-center ${
                        isDark
                          ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,26,0.48),rgba(7,9,18,0.38))] text-purple-100/46'
                          : 'border-violet-200/80 bg-white/76 text-gray-400'
                      }`}
                    >
                      <p className="font-display text-[1.05rem] font-semibold">
                        No services in this category yet
                      </p>
                      <p className="mt-2.5 text-[12px]">
                        Try another category or open the full marketplace view.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
