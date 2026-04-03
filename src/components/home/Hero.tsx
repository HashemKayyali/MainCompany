import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react'
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
  'Bike VR', 'LED Screens', 'Photo Booths', 'Live Performers',
  'Event Games', 'Production', 'Sound Systems', 'Lighting Rigs',
  'Stage Design', '360° Cameras', 'Interactive Booths', 'DJ Setup',
]

const platformSignals = [
  {
    title: 'For clients',
    body: 'Browse categories, compare options, and request event services with confidence.',
    icon: Sparkles,
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
    iconGradient: 'from-violet-500 to-fuchsia-500',
    accentColor: 'rgba(139,92,246,0.5)',
  },
  {
    title: 'For providers',
    body: 'Showcase your company, receive inquiries, and grow inside a premium marketplace.',
    icon: Building2,
    gradient: 'from-cyan-500/20 to-violet-500/10',
    iconGradient: 'from-cyan-400 to-violet-500',
    accentColor: 'rgba(34,211,238,0.5)',
  },
]

type HeroShowcaseItem = {
  slug: string
  displayName: string
  heroImage: string
  gallery: string[]
}

type SceneLayout = {
  className: string
  frameClassName: string
  captionClassName: string
  baseRotate: number
  floatY: number
  floatDuration: number
  rotateAmplitude: number
  rotateDuration: number
  delay: number
  glowOpacity: number
  imageScale: number
  eager: boolean
}

const sceneLayouts: SceneLayout[] = [
  {
    className: 'left-[1%] top-[8%] z-30 w-[52%] sm:left-[7%] sm:w-[48%] lg:w-[50%]',
    frameClassName: 'aspect-[5/4] rounded-[28px] sm:rounded-[34px]',
    captionClassName: 'left-[7%] -bottom-3 sm:-bottom-5',
    baseRotate: -6,
    floatY: -10,
    floatDuration: 11,
    rotateAmplitude: 1.15,
    rotateDuration: 17,
    delay: 0.08,
    glowOpacity: 0.2,
    imageScale: 1.03,
    eager: true,
  },
  {
    className: 'right-[1%] top-[3%] z-40 w-[29%] sm:right-[7%] sm:w-[30%]',
    frameClassName: 'aspect-[4/5] rounded-[26px] sm:rounded-[30px]',
    captionClassName: 'left-[6%] -bottom-3 sm:left-[8%] sm:-bottom-5',
    baseRotate: 9,
    floatY: -8,
    floatDuration: 12.4,
    rotateAmplitude: -1,
    rotateDuration: 18,
    delay: 0.18,
    glowOpacity: 0.16,
    imageScale: 1.04,
    eager: false,
  },
  {
    className: 'right-[0%] bottom-[10%] z-20 w-[46%] sm:right-[4%] sm:w-[48%]',
    frameClassName: 'aspect-[6/4.2] rounded-[28px] sm:rounded-[32px]',
    captionClassName: 'left-[8%] -bottom-3 sm:-bottom-5',
    baseRotate: -4,
    floatY: -7,
    floatDuration: 13,
    rotateAmplitude: 0.8,
    rotateDuration: 16.8,
    delay: 0.28,
    glowOpacity: 0.14,
    imageScale: 1.02,
    eager: false,
  },
  {
    className: 'left-[0%] bottom-[9%] z-10 w-[27%] sm:left-[1%] sm:w-[28%]',
    frameClassName: 'aspect-square rounded-[24px] sm:rounded-[28px]',
    captionClassName: 'left-[1%] -bottom-3 sm:-bottom-5',
    baseRotate: 7,
    floatY: -6,
    floatDuration: 12.8,
    rotateAmplitude: -0.75,
    rotateDuration: 16.4,
    delay: 0.36,
    glowOpacity: 0.12,
    imageScale: 1.05,
    eager: false,
  },
  {
    className: 'hidden min-[420px]:block left-[16%] bottom-[2%] z-[26] w-[30%] sm:left-[31%] sm:w-[31%] md:w-[29%]',
    frameClassName: 'aspect-[5/3.15] rounded-[22px] sm:rounded-[26px]',
    captionClassName: 'left-[10%] -bottom-5',
    baseRotate: 2,
    floatY: -5,
    floatDuration: 14.1,
    rotateAmplitude: 0.65,
    rotateDuration: 17.4,
    delay: 0.42,
    glowOpacity: 0.11,
    imageScale: 1.03,
    eager: false,
  },
  {
    className: 'hidden min-[420px]:block right-[14%] bottom-[30%] z-10 w-[34%] sm:left-[30%] sm:bottom-[30%] sm:w-[28%]',
    frameClassName: 'aspect-[5/3.15] rounded-[22px] sm:rounded-[26px]',
    captionClassName: 'left-[10%] -bottom-5',
    baseRotate: 2,
    floatY: -5,
    floatDuration: 14.1,
    rotateAmplitude: 0.65,
    rotateDuration: 17.4,
    delay: 0.42,
    glowOpacity: 0.11,
    imageScale: 1.03,
    eager: false,
  },
  {
    className: 'hidden sm:block right-[16%] top-[35%] z-[34] w-[22%] md:w-[20%]',
    frameClassName: 'aspect-[4/5] rounded-[24px] sm:rounded-[28px]',
    captionClassName: 'left-[8%] -bottom-5',
    baseRotate: 5,
    floatY: -6,
    floatDuration: 12.6,
    rotateAmplitude: -0.65,
    rotateDuration: 16.6,
    delay: 0.5,
    glowOpacity: 0.11,
    imageScale: 1.04,
    eager: false,
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
  const limit = sceneLayouts.length
  const featuredItems = featuredProducts
    .map(toHeroShowcaseItem)
    .filter((item): item is HeroShowcaseItem => Boolean(item))
    .slice(0, limit)
  if (featuredItems.length > 0) return featuredItems
  return products
    .map(toHeroShowcaseItem)
    .filter((item): item is HeroShowcaseItem => Boolean(item))
    .slice(0, limit)
}

function toneForItem(slug: string): CSSProperties {
  if (slug === 'bike-vr' || slug === '360') {
    return {
      background:
        'radial-gradient(circle, rgba(236,72,153,0.34) 0%, rgba(124,58,237,0.18) 38%, rgba(34,211,238,0.10) 66%, transparent 82%)',
    }
  }
  if (slug === 'bike-tower') {
    return {
      background:
        'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(124,58,237,0.18) 40%, rgba(236,72,153,0.08) 66%, transparent 82%)',
    }
  }
  return {
    background:
      'radial-gradient(circle, rgba(124,58,237,0.26) 0%, rgba(236,72,153,0.16) 42%, rgba(34,211,238,0.08) 68%, transparent 82%)',
  }
}

function sceneTransition(enabled: boolean, layout: SceneLayout): Transition | undefined {
  if (!enabled) return undefined
  return {
    opacity: { duration: 0.72, delay: layout.delay, ease },
    scale: { duration: 0.72, delay: layout.delay, ease },
    y: {
      duration: layout.floatDuration,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
      delay: layout.delay + 0.25,
    },
    rotate: {
      duration: layout.rotateDuration,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
      delay: layout.delay + 0.35,
    },
  }
}

// ─── Noise texture overlay ───────────────────────────────────────────────────
function NoiseOverlay({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        opacity: isDark ? 0.055 : 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: isDark ? 'overlay' : 'multiply',
      }}
    />
  )
}

// ─── Dot grid pattern ────────────────────────────────────────────────────────
function DotGrid({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.08)'} 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
      }}
    />
  )
}

// ─── Marquee strip ───────────────────────────────────────────────────────────
function MarqueeStrip({ isDark }: { isDark: boolean }) {
  const doubled = [...serviceTypes, ...serviceTypes]
  return (
    <div
      className={`relative my-5 flex overflow-hidden py-2.5 ${
        isDark ? 'border-y border-white/[0.06]' : 'border-y border-violet-200/50'
      }`}
      style={{
        maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 28s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track flex shrink-0 items-center gap-0">
        {doubled.map((service, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                isDark ? 'text-white/38' : 'text-violet-500/55'
              }`}
            >
              {service}
            </span>
            <span
              className={`mx-5 h-1 w-1 rounded-full ${isDark ? 'bg-violet-400/28' : 'bg-violet-400/40'}`}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────
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
      transition={motionEnabled ? { duration: 0.55, delay: 0.18 + index * 0.06, ease } : undefined}
      className={`group relative overflow-hidden rounded-[18px] border px-4 py-3.5 sm:px-5 sm:py-4 ${
        isDark
          ? 'border-white/[0.08] bg-[linear-gradient(160deg,rgba(18,22,42,0.90),rgba(8,10,22,0.75))] shadow-[0_24px_64px_rgba(1,5,18,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'border-violet-200/60 bg-white/82 shadow-[0_18px_46px_rgba(76,29,149,0.09),inset_0_1px_0_rgba(255,255,255,0.90)]'
      }`}
    >
      {/* Top shimmer border */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(196,181,253,0.55) 40%, rgba(34,211,238,0.35) 70%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.45) 40%, rgba(34,211,238,0.25) 70%, transparent 100%)',
        }}
      />
      {/* Glow corner */}
      <div
        className="pointer-events-none absolute -right-6 -top-4 h-14 w-20 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          opacity: 0.7,
        }}
      />
      <div
        className={`font-display text-[1.5rem] font-black tracking-[-0.055em] ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
          isDark ? 'text-violet-300/48' : 'text-violet-600/60'
        }`}
      >
        {label}
      </div>
    </motion.div>
  )
}

// ─── Floating image card ─────────────────────────────────────────────────────
function FloatingImageShowcase({
  item,
  layout,
  isDark,
  motionEnabled,
}: {
  item: HeroShowcaseItem
  layout: SceneLayout
  isDark: boolean
  motionEnabled: boolean
}) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  const sources = useMemo(
    () => mergeMediaSources([item.heroImage, ...item.gallery]),
    [item.gallery, item.heroImage]
  )

  const activeMedia = sources[Math.min(sourceIndex, Math.max(sources.length - 1, 0))] || ''
  const activeSrc = stripMedia(activeMedia)
  const glowStyle = toneForItem(item.slug)

  const onImageError = () => {
    setSourceIndex((index) => {
      if (index < sources.length - 1) return index + 1
      setImageFailed(true)
      return index
    })
  }

  return (
    <motion.figure
      initial={
        motionEnabled
          ? { opacity: 0, y: 24, scale: 0.95, rotate: layout.baseRotate - 1.2 }
          : false
      }
      animate={
        motionEnabled
          ? {
              opacity: 1,
              scale: 1,
              y: [0, layout.floatY, 0],
              rotate: [layout.baseRotate, layout.baseRotate + layout.rotateAmplitude, layout.baseRotate],
            }
          : { opacity: 1, scale: 1, y: 0, rotate: layout.baseRotate }
      }
      transition={sceneTransition(motionEnabled, layout)}
      whileHover={motionEnabled ? { y: layout.floatY - 4, scale: 1.022 } : undefined}
      className={`absolute will-change-transform ${layout.className}`}
      style={!motionEnabled ? { transform: `rotate(${layout.baseRotate}deg)` } : undefined}
      aria-hidden="true"
    >
      {/* Glow blob behind card */}
      <div
        className="pointer-events-none absolute inset-[-12%] -z-10 rounded-full blur-[60px]"
        style={{ ...glowStyle, opacity: layout.glowOpacity * 1.3 }}
      />

      {/* Card */}
      <div
        className={`relative overflow-hidden border ${layout.frameClassName} ${
          isDark
            ? 'border-white/[0.14] bg-black/10 shadow-[0_28px_72px_rgba(1,5,18,0.48),0_8px_24px_rgba(124,58,237,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'border-white/85 bg-white/85 shadow-[0_28px_80px_rgba(76,29,149,0.14),0_8px_24px_rgba(124,58,237,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]'
        }`}
      >
        {/* Top highlight line */}
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
            extraScale={layout.imageScale}
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

        {/* Overlay vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 28%, transparent 72%, rgba(3,7,18,0.22) 88%, rgba(3,7,18,0.50) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.14) 88%, rgba(255,255,255,0.48) 100%)',
          }}
        />
      </div>

      {/* Caption pill */}
      <figcaption className={`pointer-events-none absolute z-30 ${layout.captionClassName}`}>
        <div
          className={`inline-flex max-w-[11rem] items-center gap-2 rounded-full border px-3.25 py-1.75 backdrop-blur-xl sm:max-w-[14rem] sm:px-3.5 sm:py-2 ${
            isDark
              ? 'border-white/[0.10] bg-[linear-gradient(180deg,rgba(12,14,26,0.96),rgba(7,9,18,0.94))] text-white shadow-[0_16px_40px_rgba(1,5,18,0.32),0_0_0_0.5px_rgba(255,255,255,0.06)]'
              : 'border-white/82 bg-white/92 text-slate-900 shadow-[0_16px_40px_rgba(76,29,149,0.12)]'
          }`}
        >
          <span
            className={`relative h-2 w-2 shrink-0 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-violet-500'}`}
          >
            {motionEnabled && (
              <motion.span
                animate={{ scale: [1, 1.9, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                className={`absolute inset-0 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-violet-500'}`}
              />
            )}
          </span>
          <span className="truncate text-[0.78rem] font-semibold tracking-[-0.018em] sm:text-[0.82rem]">
            {item.displayName}
          </span>
        </div>
      </figcaption>
    </motion.figure>
  )
}

// ─── Floating scene ──────────────────────────────────────────────────────────
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
    <div className="relative mx-auto h-[19rem] w-full max-w-[21rem] sm:h-[32rem] sm:max-w-[35rem] lg:h-[37rem] lg:max-w-[40rem]">
      {/* Ambient background blobs */}
      <div
        className="pointer-events-none absolute left-[4%] top-[6%] h-44 w-44 rounded-full blur-[60px] sm:h-80 sm:w-80 sm:blur-[80px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 68%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 74%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-[2%] top-[1%] h-[10.5rem] w-[10.5rem] rounded-full blur-[58px] sm:h-80 sm:w-80 sm:blur-[80px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34,211,238,0.11) 0%, transparent 76%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[3%] left-[14%] h-44 w-56 rounded-full blur-[60px] sm:h-80 sm:w-[26rem] sm:blur-[80px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(124,58,237,0.24) 0%, transparent 72%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 78%)',
        }}
      />

      {/* Central glass orb */}
      <div
        className="pointer-events-none absolute left-[12%] top-[18%] h-[44%] w-[56%] rounded-[46%] border blur-[0.35px] sm:h-[48%] sm:w-[58%] sm:blur-[0.4px]"
        style={{
          background: isDark
            ? 'linear-gradient(160deg, rgba(255,255,255,0.015), rgba(124,58,237,0.055) 36%, rgba(3,7,18,0.03) 74%, rgba(236,72,153,0.03))'
            : 'linear-gradient(160deg, rgba(255,255,255,0.85), rgba(245,243,255,0.58))',
          borderColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(124,58,237,0.07)',
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.03), 0 32px 80px rgba(1,5,18,0.22)'
            : '0 28px 72px rgba(124,58,237,0.09)',
          transform: 'rotate(-16deg)',
          opacity: isDark ? 0.20 : 0.55,
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

// ─── Hero ────────────────────────────────────────────────────────────────────
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
    <section className="relative overflow-hidden pb-10 pt-4 sm:pb-12 sm:pt-6 lg:min-h-[72svh] lg:pb-16 lg:pt-8">

      {/* ── Background layer ── */}
      <div className="pointer-events-none absolute inset-0">
        <DotGrid isDark={isDark} />
        <NoiseOverlay isDark={isDark} />

        {/* Ambient gradient orbs */}
        <div
          className="absolute left-[-10%] top-[2%] h-[24rem] w-[24rem] rounded-full blur-[80px] sm:h-[28rem] sm:w-[28rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(124,58,237,0.20) 0%, transparent 68%)'
              : 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 76%)',
          }}
        />
        <div
          className="absolute left-[22%] top-[10%] h-[16rem] w-[18rem] rounded-full blur-[68px] sm:h-[20rem] sm:w-[22rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 78%)',
          }}
        />
        <div
          className="absolute right-[-8%] top-[6%] h-[24rem] w-[24rem] rounded-full blur-[84px] sm:h-[30rem] sm:w-[30rem]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 78%)',
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(4,6,16,0.40), transparent)'
              : 'linear-gradient(to top, rgba(255,255,255,0.60), transparent)',
          }}
        />
      </div>

      <div className="site-container relative z-10">
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)] lg:gap-10">

          {/* ── Left column ── */}
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 28 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.76, ease } : undefined}
            className="relative z-10 max-w-[37rem]"
          >
            {/* Platform badge */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: -8 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.55, delay: 0.06, ease } : undefined}
              className="mb-5 inline-flex"
            >
              <div
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.25 py-1.75 sm:px-3.5 ${
                  isDark
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] sm:text-[10.5px] sm:tracking-[0.17em]">
                  Event Services Platform
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="max-w-[23rem] sm:max-w-none">
              <h1
                className={`font-display text-[clamp(2.02rem,8.6vw,5.1rem)] font-black leading-[0.94] tracking-[-0.05em] sm:leading-[0.87] sm:tracking-[-0.066em] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                <span className="inline sm:block">
                  Book{' '}
                  <span className="relative inline-block">
                    {/* Glow bloom behind gradient text */}
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

            {/* Sub-copy */}
            <p
              className={`mt-4 max-w-[34rem] text-[0.86rem] leading-[1.65] sm:mt-5 sm:text-[1rem] sm:leading-[1.75] ${
                isDark ? 'text-purple-100/62' : 'text-slate-500'
              }`}
            >
              Find and book games, LED screens, performers, booths, rentals, and
              production services from trusted event vendors in one place.
            </p>

            {/* Numbered journey steps */}
            <div className="mt-4 flex flex-wrap items-center gap-y-2 sm:mt-5 sm:flex-nowrap sm:gap-0">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={motionEnabled ? { opacity: 0, y: 10 } : false}
                  whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={motionEnabled ? { duration: 0.5, delay: 0.12 + index * 0.06, ease } : undefined}
                  className="flex items-center"
                >
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.25 sm:gap-2 sm:px-3 sm:py-1.5 ${
                      isDark
                        ? 'border-white/[0.09] bg-[linear-gradient(180deg,rgba(16,20,38,0.88),rgba(9,11,24,0.78))] text-purple-100/72'
                        : 'border-violet-200/65 bg-white/74 text-violet-700'
                    }`}
                  >
                    <span
                      className={`font-mono text-[8px] font-bold sm:text-[8.5px] ${
                        isDark ? 'text-violet-400/60' : 'text-violet-400/80'
                      }`}
                    >
                      {step.num}
                    </span>
                    <span className="text-[8.4px] font-semibold uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.12em]">
                      {step.label}
                    </span>
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div
                      className={`mx-1 h-px w-3 sm:mx-1.5 sm:w-4 ${isDark ? 'bg-white/14' : 'bg-violet-300/50'}`}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Marquee strip */}
            <MarqueeStrip isDark={isDark} />

            {/* Platform signals — redesigned */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 16 } : false}
              whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-40px' }}
              transition={motionEnabled ? { duration: 0.6, delay: 0.14, ease } : undefined}
              className="grid min-w-0 gap-2.5 sm:grid-cols-2 sm:gap-3"
            >
              {platformSignals.map(({ title, body, icon: Icon, iconGradient, accentColor }) => (
                <div
                  key={title}
                  className={`group relative min-w-0 overflow-hidden rounded-[18px] border p-3 sm:rounded-[20px] sm:p-4 transition-all duration-300 hover:-translate-y-0.5 ${
                    isDark
                      ? 'border-white/[0.08] bg-[linear-gradient(160deg,rgba(14,18,34,0.90),rgba(8,10,20,0.80))] shadow-[0_20px_56px_rgba(1,5,18,0.28),inset_0_1px_0_rgba(255,255,255,0.055)] hover:border-white/[0.12]'
                      : 'border-slate-200/60 bg-white/88 shadow-[0_16px_44px_rgba(76,29,149,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-violet-200/80 hover:shadow-[0_20px_56px_rgba(76,29,149,0.12)]'
                  }`}
                >
                  {/* Accent glow */}
                  <div
                    className="pointer-events-none absolute -right-10 -top-8 h-24 w-28 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                    style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                  />
                  {/* Top shimmer */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                    }}
                  />

                  <div className="relative flex min-w-0 items-start gap-3">
                    {/* Icon */}
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[11px] sm:h-8 sm:w-8 sm:rounded-[12px]"
                      style={{
                        background: `linear-gradient(135deg, ${
                          isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.90)'
                        }, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.70)'})`,
                        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.90)',
                        boxShadow: isDark
                          ? `0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`
                          : '0 2px 8px rgba(109,40,217,0.10)',
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        strokeWidth={1.8}
                        style={{
                          background: `linear-gradient(135deg, ${iconGradient.replace('from-', '').replace('to-', '')})`,
                          WebkitBackgroundClip: 'text',
                          color: isDark ? 'rgba(196,181,253,0.90)' : 'rgba(109,40,217,0.85)',
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`text-[9.5px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em] ${
                          isDark ? 'text-violet-300/55' : 'text-violet-600/65'
                        }`}
                      >
                        {title}
                      </div>
                      <p
                        className={`mt-1 text-[0.76rem] leading-[1.45] sm:mt-1.5 sm:text-[0.825rem] sm:leading-[1.55] ${
                          isDark ? 'text-white/75' : 'text-slate-600'
                        }`}
                      >
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 14 } : false}
              whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-40px' }}
              transition={motionEnabled ? { duration: 0.55, delay: 0.22, ease } : undefined}
              className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3"
            >
              <Link
                to="/products"
                className="btn-primary group relative !min-h-[44px] !overflow-hidden !rounded-[16px] !px-4.5 !text-[11px] sm:!min-h-[46px] sm:!px-5 sm:!text-[11.25px]"
              >
                {/* Shine sweep */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]"
                />
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>

              <Link
                to="/contact"
                className={`btn-outline !min-h-[44px] !rounded-[16px] !px-4.5 !text-[11px] sm:!min-h-[46px] sm:!px-5 sm:!text-[11.25px] ${
                  isDark ? '!text-white/85' : ''
                }`}
              >
                Talk to the Team
              </Link>
            </motion.div>

            {/* Stats */}
            <div className="mt-5 grid max-w-[22rem] grid-cols-3 gap-2.5 sm:mt-6 sm:max-w-[27rem] sm:gap-2.5">
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

          {/* ── Right column — floating scene ── */}
          <motion.div
            initial={motionEnabled ? { opacity: 0, x: 20 } : false}
            animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.84, delay: 0.14, ease } : undefined}
            className="relative z-10 mt-2 px-0 sm:mt-4 lg:mt-0"
          >
            {showcaseItems.length > 0 ? (
              <FloatingScene items={showcaseItems} isDark={isDark} motionEnabled={motionEnabled} />
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
