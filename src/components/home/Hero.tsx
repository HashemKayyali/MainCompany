import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { ArrowRight, Building2, Sparkles } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { usePerfMode } from '../../hooks/usePerfMode'
import { parseMediaValue } from '../../utils/media-frame'
import FramedImage from '../ui/FramedImage'

const ease = [0.16, 1, 0.3, 1] as const

const heroStats = [
  { value: '100+', label: 'Services' },
  { value: '30+', label: 'Vendors' },
  { value: '12+', label: 'Categories' },
]

const journeySteps = [
  { label: 'Discover', num: '01' },
  { label: 'Compare', num: '02' },
  { label: 'Request', num: '03' },
]

const serviceTypes = [
  'Bike VR',
  'LED Screens',
  'Photo Booths',
  'Live Performers',
  'Event Games',
  'Production',
  'Sound Systems',
  'Lighting Rigs',
  'Stage Design',
  '360° Cameras',
  'Interactive Booths',
  'DJ Setup',
]

const platformSignals = [
  {
    title: 'For clients',
    body: 'Browse categories, compare options, and request event services with confidence.',
    icon: Sparkles,
    accent: 'violet' as const,
  },
  {
    title: 'For providers',
    body: 'Showcase your company, receive inquiries, and grow inside a premium marketplace.',
    icon: Building2,
    accent: 'cyan' as const,
  },
]

type HeroShowcaseItem = {
  slug: string
  displayName: string
  heroImage: string
  gallery: string[]
}

type SceneLayout = {
  shell: string
  card: string
  caption: string
  baseRotate: number
  floatY: number
  duration: number
  eager?: boolean
}

const sceneLayouts: SceneLayout[] = [
  {
    shell: 'left-[4%] top-[4%] z-30 w-[50%] lg:left-[5%] lg:w-[49%]',
    card: 'aspect-[5/4] rounded-[28px] lg:rounded-[30px]',
    caption: 'left-[6%] bottom-[6%]',
    baseRotate: -6,
    floatY: -10,
    duration: 10.5,
    eager: true,
  },
  {
    shell: 'right-[5%] top-[7%] z-20 w-[27%] lg:right-[6%] lg:w-[26%]',
    card: 'aspect-[4/5] rounded-[24px] lg:rounded-[26px]',
    caption: 'left-[8%] bottom-[7%]',
    baseRotate: 6,
    floatY: -8,
    duration: 11.5,
  },
  {
    shell: 'right-[7%] bottom-[12%] z-20 w-[38%] lg:right-[8%] lg:w-[39%]',
    card: 'aspect-[5/3.6] rounded-[26px] lg:rounded-[28px]',
    caption: 'left-[8%] bottom-[7%]',
    baseRotate: -4,
    floatY: -7,
    duration: 12.4,
  },
  {
    shell: 'left-[9%] bottom-[8%] z-10 w-[23%] lg:left-[10%] lg:w-[22%]',
    card: 'aspect-square rounded-[22px] lg:rounded-[24px]',
    caption: 'left-[8%] bottom-[9%]',
    baseRotate: 5,
    floatY: -6,
    duration: 12.8,
  },
]

function normalizeName(name: string) {
  return name.replace(/\s+/g, ' ').trim()
}

function stripMedia(media?: string) {
  if (!media) return ''
  return parseMediaValue(media).src || media.split('#')[0] || ''
}

function mergeMediaSources(items: string[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = stripMedia(item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getProductMediaSources(product: Product) {
  return mergeMediaSources([product.heroImage, ...(product.gallery || [])])
}

function toHeroShowcaseItem(product: Product): HeroShowcaseItem | null {
  const sources = getProductMediaSources(product)
  const firstMedia = sources[0]
  if (!firstMedia) return null
  return {
    slug: product.slug,
    displayName: normalizeName(product.name),
    heroImage: firstMedia,
    gallery: sources,
  }
}

function buildShowcaseItems(products: Product[], featuredProducts: Product[]) {
  const preferred = featuredProducts.length ? featuredProducts : products
  return preferred
    .map(toHeroShowcaseItem)
    .filter((item): item is HeroShowcaseItem => Boolean(item))
    .slice(0, sceneLayouts.length)
}

function sceneTransition(enabled: boolean, layout: SceneLayout): Transition | undefined {
  if (!enabled) return undefined
  return {
    duration: 0.8,
    ease,
    y: {
      duration: layout.duration,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
    rotate: {
      duration: layout.duration + 4,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  }
}

function NoiseOverlay({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        opacity: isDark ? 0.055 : 0.03,
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: isDark ? 'overlay' : 'multiply',
      }}
    />
  )
}

function DotGrid({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.08)'} 1px, transparent 1px)`,
        backgroundSize: '34px 34px',
        maskImage: 'radial-gradient(ellipse 80% 78% at 50% 45%, black 30%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 78% at 50% 45%, black 30%, transparent 100%)',
      }}
    />
  )
}

function MarqueeStrip({
  isDark,
  motionEnabled,
}: {
  isDark: boolean
  motionEnabled: boolean
}) {
  const doubled = [...serviceTypes, ...serviceTypes]

  return (
    <div
      className={`relative mt-6 overflow-hidden rounded-[18px] border px-0 py-3 sm:mt-7 ${isDark
        ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(8,10,22,0.72),rgba(9,12,28,0.62))]'
        : 'border-violet-200/60 bg-white/70'
        }`}
      style={{
        maskImage: 'linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%)',
      }}
    >
      <style>{`
        @keyframes hero-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-marquee-track {
          animation: hero-marquee-scroll 28s linear infinite;
          will-change: transform;
        }
        .hero-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className={motionEnabled ? 'hero-marquee-track flex w-max items-center' : 'flex w-max items-center'}>
        {doubled.map((service, index) => (
          <span key={`${service}-${index}`} className="flex shrink-0 items-center">
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] ${isDark ? 'text-white/44' : 'text-violet-600/58'
                }`}
            >
              {service}
            </span>
            <span
              className={`mx-5 h-1.5 w-1.5 rounded-full ${isDark ? 'bg-violet-300/60' : 'bg-violet-500/50'
                }`}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

function HeroStat({
  value,
  label,
  isDark,
  motionEnabled,
  index,
}: {
  value: string
  label: string
  isDark: boolean
  motionEnabled: boolean
  index: number
}) {
  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 16 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={motionEnabled ? { duration: 0.45, delay: 0.12 + index * 0.05, ease } : undefined}
      className={`relative overflow-hidden rounded-[20px] border px-4 py-4 sm:px-5 sm:py-4.5 ${isDark
        ? 'border-white/[0.08] bg-[linear-gradient(160deg,rgba(18,22,42,0.92),rgba(7,9,18,0.8))] shadow-[0_24px_64px_rgba(1,5,18,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'border-violet-200/60 bg-white/82 shadow-[0_18px_46px_rgba(76,29,149,0.09),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(196,181,253,0.55) 40%, rgba(34,211,238,0.35) 70%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.45) 40%, rgba(34,211,238,0.25) 70%, transparent 100%)',
        }}
      />
      <div
        className={`font-display text-[1.55rem] font-black tracking-[-0.055em] ${isDark ? 'text-white' : 'text-slate-900'
          }`}
      >
        {value}
      </div>
      <div
        className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-violet-300/48' : 'text-violet-700/58'
          }`}
      >
        {label}
      </div>
    </motion.div>
  )
}

function SignalCard({
  title,
  body,
  Icon,
  isDark,
  motionEnabled,
  delay,
  accent,
}: {
  title: string
  body: string
  Icon: typeof Sparkles
  isDark: boolean
  motionEnabled: boolean
  delay: number
  accent: 'violet' | 'cyan'
}) {
  const iconGradient =
    accent === 'violet'
      ? 'from-violet-500 to-fuchsia-500'
      : 'from-cyan-400 to-violet-500'

  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 16 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={motionEnabled ? { duration: 0.48, delay, ease } : undefined}
      className={`relative overflow-hidden rounded-[22px] border p-4 sm:p-4.5 ${isDark
          ? 'border-white/[0.08] bg-[linear-gradient(160deg,rgba(9,12,28,0.88),rgba(6,9,20,0.8))] shadow-[0_20px_56px_rgba(1,5,18,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'border-violet-200/60 bg-white/82 shadow-[0_18px_40px_rgba(76,29,149,0.08)]'
        }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            accent === 'violet'
              ? 'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.55) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.45) 50%, transparent 100%)',
        }}
      />

      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${isDark
              ? 'border-white/[0.08] bg-white/[0.03]'
              : 'border-violet-200/70 bg-violet-50/80'
            }`}
        >
          <div className={`rounded-full bg-gradient-to-br ${iconGradient} p-[1px]`}>
            <div
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-full ${isDark ? 'bg-slate-950' : 'bg-white'
                }`}
            >
              <Icon className={`h-4.5 w-4.5 ${accent === 'violet' ? 'text-violet-300' : 'text-cyan-300'}`} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div
            className={`text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-[10.5px] ${isDark ? 'text-violet-300/56' : 'text-violet-700/58'
              }`}
          >
            {title}
          </div>
          <p
            className={`mt-1.5 text-[0.84rem] leading-[1.55] sm:text-[0.92rem] ${isDark ? 'text-white/72' : 'text-slate-600'
              }`}
          >
            {body}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function FloatingImageShowcase({
  item,
  layout,
  isDark,
  motionEnabled,
  mobileSafe = false,
}: {
  item: HeroShowcaseItem
  layout: SceneLayout
  isDark: boolean
  motionEnabled: boolean
  mobileSafe?: boolean
}) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  const sources = useMemo(
    () => mergeMediaSources([item.heroImage, ...item.gallery]),
    [item.gallery, item.heroImage]
  )

  const activeMedia = sources[Math.min(sourceIndex, Math.max(sources.length - 1, 0))] || ''
  const activeSrc = stripMedia(activeMedia)

  const onImageError = () => {
    setSourceIndex((index) => {
      if (index < sources.length - 1) return index + 1
      setImageFailed(true)
      return index
    })
  }

  return (
    <motion.figure
      initial={motionEnabled ? { opacity: 0, y: 18, scale: 0.96, rotate: layout.baseRotate } : false}
      animate={
        motionEnabled
          ? {
            opacity: 1,
            scale: 1,
            y: [0, layout.floatY, 0],
            rotate: [layout.baseRotate, layout.baseRotate + 0.8, layout.baseRotate],
          }
          : { opacity: 1, scale: 1, y: 0, rotate: layout.baseRotate }
      }
      transition={sceneTransition(motionEnabled, layout)}
      className={`${mobileSafe ? 'relative block h-full w-full max-w-full' : `absolute will-change-transform ${layout.shell}`
        }`}
      style={!motionEnabled ? { transform: `rotate(${layout.baseRotate}deg)` } : undefined}
      aria-hidden="true"
      whileHover={mobileSafe ? undefined : { scale: 1.012 }}
    >
      <div
        className={`pointer-events-none absolute ${mobileSafe ? 'inset-[-6%]' : 'inset-[-12%]'
          } -z-10 rounded-full blur-[52px]`}
        style={{
          background:
            'radial-gradient(circle, rgba(124,58,237,0.26) 0%, rgba(236,72,153,0.16) 42%, rgba(34,211,238,0.08) 68%, transparent 82%)',
          opacity: isDark ? 0.9 : 0.65,
        }}
      />

      <div
        className={`relative overflow-hidden border ${mobileSafe ? 'h-full rounded-[22px]' : layout.card
          } ${isDark
            ? 'border-white/[0.14] bg-black/10 shadow-[0_28px_72px_rgba(1,5,18,0.48),0_8px_24px_rgba(124,58,237,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'border-white/85 bg-white/85 shadow-[0_28px_80px_rgba(76,29,149,0.14),0_8px_24px_rgba(124,58,237,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]'
          }`}
      >
        <div
          className="pointer-events-none absolute inset-x-6 top-0 z-20 h-px"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.56), rgba(34,211,238,0.22), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.42), rgba(34,211,238,0.22), transparent)',
          }}
        />

        {!imageFailed && activeSrc ? (
          <FramedImage
            media={activeMedia}
            alt={item.displayName}
            loading={layout.eager ? 'eager' : 'lazy'}
            draggable={false}
            className="absolute inset-0 h-full w-full select-none"
            extraScale={1.03}
            onError={onImageError}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(150deg, rgba(19,23,44,0.96) 0%, rgba(84,28,135,0.52) 34%, rgba(12,84,106,0.28) 76%, rgba(4,7,18,0.96) 100%)',
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 28%, transparent 72%, rgba(3,7,18,0.22) 88%, rgba(3,7,18,0.50) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.14) 88%, rgba(255,255,255,0.48) 100%)',
          }}
        />
      </div>

      <figcaption className={`pointer-events-none absolute z-30 ${mobileSafe ? 'inset-x-3 bottom-3' : layout.caption}`}>
        <div
          className={`inline-flex max-w-[11rem] items-center gap-2 rounded-full border px-3.25 py-1.75 backdrop-blur-xl sm:max-w-[13rem] sm:px-3.5 sm:py-2 ${mobileSafe ? 'max-w-[calc(100%-0.25rem)]' : ''
            } ${isDark
              ? 'border-white/[0.10] bg-[linear-gradient(180deg,rgba(12,14,26,0.96),rgba(7,9,18,0.94))] text-white shadow-[0_16px_40px_rgba(1,5,18,0.32),0_0_0_0.5px_rgba(255,255,255,0.06)]'
              : 'border-white/82 bg-white/92 text-slate-900 shadow-[0_16px_40px_rgba(76,29,149,0.12)]'
            }`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-violet-500'}`} />
          <span className="truncate text-[0.78rem] font-semibold tracking-[-0.018em] sm:text-[0.82rem]">
            {item.displayName}
          </span>
        </div>
      </figcaption>
    </motion.figure>
  )
}

function FloatingScene({
  items,
  isDark,
  motionEnabled,
}: {
  items: HeroShowcaseItem[]
  isDark: boolean
  motionEnabled: boolean
}) {
  return (
    <div className="relative mx-auto mt-2 h-[22rem] w-full max-w-[22rem] overflow-hidden sm:h-[28rem] sm:max-w-[31rem] lg:mt-0 lg:h-[34rem] lg:max-w-[36rem] lg:overflow-visible">
      <div
        className="pointer-events-none absolute left-[0%] top-[6%] h-44 w-44 rounded-full blur-[62px] sm:h-72 sm:w-72"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 68%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 74%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-[0%] top-[4%] h-40 w-40 rounded-full blur-[58px] sm:h-72 sm:w-72"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34,211,238,0.11) 0%, transparent 76%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[6%] left-[16%] h-44 w-56 rounded-full blur-[60px] sm:h-72 sm:w-[22rem]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(124,58,237,0.24) 0%, transparent 72%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 78%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-[14%] top-[18%] h-[34%] rounded-[46%] border blur-[0.35px]"
        style={{
          background: isDark
            ? 'linear-gradient(160deg, rgba(255,255,255,0.015), rgba(124,58,237,0.055) 36%, rgba(3,7,18,0.03) 74%, rgba(236,72,153,0.03))'
            : 'linear-gradient(160deg, rgba(255,255,255,0.85), rgba(245,243,255,0.58))',
          borderColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(124,58,237,0.07)',
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.03), 0 32px 80px rgba(1,5,18,0.22)'
            : '0 28px 72px rgba(124,58,237,0.09)',
          transform: 'rotate(-14deg)',
          opacity: isDark ? 0.22 : 0.5,
        }}
      />

      {items.map((item, index) => (
        <FloatingImageShowcase
          key={item.slug}
          item={item}
          layout={sceneLayouts[index]}
          isDark={isDark}
          motionEnabled={motionEnabled}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const { products, featuredProducts } = useData()
  const { isDark } = useTheme()
  const reducedMotion = useReducedMotion()
  const { perfLow } = usePerfMode()
  const motionEnabled = !reducedMotion && !perfLow

  const showcaseItems = useMemo(
    () => buildShowcaseItems(products, featuredProducts),
    [featuredProducts, products]
  )

  return (
    <section className="relative isolate overflow-x-clip pb-12 pt-4 sm:pb-14 sm:pt-6 lg:pb-16 lg:pt-8">
      <div className="pointer-events-none absolute inset-0">
        <DotGrid isDark={isDark} />
        <NoiseOverlay isDark={isDark} />

        <div
          className="absolute left-[-12%] top-[0%] h-[22rem] w-[22rem] rounded-full blur-[78px] sm:h-[26rem] sm:w-[26rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(124,58,237,0.20) 0%, transparent 68%)'
              : 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 76%)',
          }}
        />
        <div
          className="absolute left-[24%] top-[10%] h-[15rem] w-[17rem] rounded-full blur-[64px] sm:h-[18rem] sm:w-[20rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 78%)',
          }}
        />
        <div
          className="absolute right-[-8%] top-[4%] h-[22rem] w-[22rem] rounded-full blur-[82px] sm:h-[28rem] sm:w-[28rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 78%)',
          }}
        />
      </div>

      <div className="site-container relative z-10">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-12">
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 26 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.75, ease } : undefined}
            className="relative z-10 max-w-[40rem]"
          >
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: -8 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.48, delay: 0.04, ease } : undefined}
              className="mb-5 inline-flex"
            >
              <div
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.25 py-1.75 sm:px-3.5 ${isDark
                  ? 'border-violet-500/25 bg-violet-500/10 text-violet-300'
                  : 'border-violet-300/70 bg-violet-50/80 text-violet-700'
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-violet-400' : 'bg-violet-500'}`}
                  style={{
                    boxShadow: isDark
                      ? '0 0 6px rgba(167,139,250,0.9)'
                      : '0 0 4px rgba(109,40,217,0.4)',
                  }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-[10.5px]">
                  Event Services Platform
                </span>
              </div>
            </motion.div>

            <div className="max-w-[23rem] sm:max-w-none">
              <h1
                className={`font-display text-[clamp(2.02rem,8.6vw,5.1rem)] font-black leading-[0.94] tracking-[-0.05em] sm:leading-[0.89] sm:tracking-[-0.066em] ${isDark ? 'text-white' : 'text-slate-950'
                  }`}
              >
                <span className="inline sm:block">
                  Book{' '}
                  <span className="relative inline-block">
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-1 h-6 rounded-full blur-2xl"
                      style={{
                        background: isDark
                          ? 'linear-gradient(90deg, rgba(124,58,237,0.35), rgba(236,72,153,0.28), rgba(34,211,238,0.20))'
                          : 'linear-gradient(90deg, rgba(124,58,237,0.22), rgba(236,72,153,0.18), rgba(34,211,238,0.12))',
                      }}
                    />
                    <span
                      className="relative bg-clip-text text-transparent"
                      style={{
                        backgroundImage: isDark
                          ? 'linear-gradient(95deg, #c4b5fd 0%, #f0abfc 38%, #67e8f9 78%, #c4b5fd 100%)'
                          : 'linear-gradient(95deg, #7c3aed 0%, #db2777 38%, #0891b2 78%, #7c3aed 100%)',
                        backgroundSize: '200% 100%',
                      }}
                    >
                      Everything
                    </span>
                  </span>
                </span>{' '}
                <span className="inline sm:mt-1 sm:block">Your Event Needs</span>
              </h1>
            </div>

            <p
              className={`mt-4 max-w-[34rem] text-[0.9rem] leading-[1.65] sm:mt-5 sm:text-[1rem] sm:leading-[1.75] ${isDark ? 'text-purple-100/62' : 'text-slate-500'
                }`}
            >
              Find and book games, LED screens, performers, booths, rentals, and production
              services from trusted event vendors in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={motionEnabled ? { opacity: 0, y: 10 } : false}
                  whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={motionEnabled ? { duration: 0.42, delay: 0.08 + index * 0.05, ease } : undefined}
                  className={`inline-flex min-h-[34px] items-center gap-2 rounded-full border px-3 py-1.5 ${isDark
                    ? 'border-white/[0.08] bg-black/18 text-white/82'
                    : 'border-violet-200/70 bg-white/74 text-slate-700'
                    }`}
                >
                  <span className={`text-[10px] font-semibold tracking-[0.12em] ${isDark ? 'text-violet-300/60' : 'text-violet-600/60'
                    }`}>
                    {step.num}
                  </span>
                  <span className="text-[0.78rem] font-semibold uppercase tracking-[0.08em]">
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <MarqueeStrip isDark={isDark} motionEnabled={motionEnabled} />

            <div className="mt-5 grid gap-3 sm:mt-6">
              {platformSignals.map((signal, index) => (
                <SignalCard
                  key={signal.title}
                  title={signal.title}
                  body={signal.body}
                  Icon={signal.icon}
                  accent={signal.accent}
                  isDark={isDark}
                  motionEnabled={motionEnabled}
                  delay={0.16 + index * 0.08}
                />
              ))}
            </div>

            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 14 } : false}
              whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-40px' }}
              transition={motionEnabled ? { duration: 0.52, delay: 0.2, ease } : undefined}
              className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6"
            >
              <Link
                to="/products"
                className="btn-primary group relative !min-h-[46px] !overflow-hidden !rounded-[16px] !px-5 !text-[11.5px]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>

              <Link
                to="/contact"
                className={`btn-outline !min-h-[46px] !rounded-[16px] !px-5 !text-[11.5px] ${isDark ? '!text-white/85' : ''
                  }`}
              >
                Talk to the Team
              </Link>
            </motion.div>

            <div className="mt-6 grid max-w-[26rem] grid-cols-3 gap-3 sm:mt-7 sm:max-w-[29rem]">
              {heroStats.map((stat, index) => (
                <HeroStat
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  isDark={isDark}
                  motionEnabled={motionEnabled}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 24 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.8, delay: 0.08, ease } : undefined}
            className="relative hidden min-w-0 overflow-hidden pt-2 lg:block lg:overflow-visible lg:pt-6"
          >
            <FloatingScene items={showcaseItems} isDark={isDark} motionEnabled={motionEnabled} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
