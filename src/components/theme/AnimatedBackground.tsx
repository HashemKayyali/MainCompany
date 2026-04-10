import { type CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

// ── Deterministic positions — stable across renders ────────────────────────
function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const STAR_COUNT = 160
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: sr(i) * 100,
  y: sr(i + 100) * 100,
  size: sr(i + 200) * 2.4 + 0.5,
  delay: sr(i + 300) * 8,
  duration: sr(i + 400) * 3.5 + 2,
  variant: (i % 3) as 0 | 1 | 2,
  color:
    i % 9 === 0 ? 'v'
    : i % 7 === 0 ? 'c'
    : i % 13 === 0 ? 'p'
    : i % 11 === 0 ? 'g'
    : 'w',
}))

const STAR_BG: Record<string, string> = {
  v: 'rgba(167,139,250,1)',
  c: 'rgba(103,232,249,1)',
  p: 'rgba(240,90,200,1)',
  g: 'rgba(251,211,141,1)',
  w: 'rgba(255,255,255,1)',
}

const STAR_GLOW: Record<string, string> = {
  v: '0 0 5px 2px rgba(167,139,250,0.65)',
  c: '0 0 5px 2px rgba(103,232,249,0.65)',
  p: '0 0 5px 2px rgba(240,90,200,0.65)',
  g: '0 0 4px 1.5px rgba(251,211,141,0.55)',
  w: '0 0 4px 1.5px rgba(255,255,255,0.55)',
}

const ANIM_NAMES = ['hs-star-a', 'hs-star-b', 'hs-star-c'] as const

const METEORS = [
  { id: 0, top: '4%',  left: '88%', delay: '0s',     dur: '6.5s',  color: 'violet' },
  { id: 1, top: '18%', left: '72%', delay: '2.6s',   dur: '5.8s',  color: 'cyan'   },
  { id: 2, top: '2%',  left: '56%', delay: '5.2s',   dur: '7.6s',  color: 'violet' },
  { id: 3, top: '28%', left: '93%', delay: '7.8s',   dur: '6.4s',  color: 'cyan'   },
  { id: 4, top: '11%', left: '44%', delay: '10.8s',  dur: '7s',    color: 'violet' },
  { id: 5, top: '38%', left: '81%', delay: '14s',    dur: '5.4s',  color: 'cyan'   },
  { id: 6, top: '6%',  left: '31%', delay: '17.2s',  dur: '6.8s',  color: 'violet' },
  { id: 7, top: '22%', left: '62%', delay: '20s',    dur: '7.2s',  color: 'cyan'   },
  { id: 8, top: '45%', left: '95%', delay: '23.5s',  dur: '5.9s',  color: 'violet' },
]

// ── Grid textures ──────────────────────────────────────────────────────────
const darkGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
  backgroundSize: '140px 140px',
}

const lightGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.028) 1px, transparent 1px)',
  backgroundSize: '120px 120px',
}

type Props = {
  position?: 'fixed' | 'absolute'
  className?: string
}

/**
 * Global branded background — used on every page of the site.
 *
 * Dark mode: cosmic nebula system with gradient orbs, twinkling stars,
 * meteor trails, and light ribbons.
 *
 * Light mode: soft atmospheric gradients with a subtle grid.
 *
 * Performance-aware: stars and meteors are disabled when `perfLow` is true
 * or when `prefers-reduced-motion` is set.
 */
export default function AnimatedBackground({ position = 'fixed', className = '' }: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  // ── LIGHT MODE ────────────────────────────────────────────────────────────
  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
        {/* Base */}
        <div className="absolute inset-0 bg-[#f5f3ff]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-45" style={lightGridStyle} />
        {/* Atmospheric glows */}
        <div
          className="absolute inset-x-[-18%] top-[-4%] h-[44%] blur-[80px]"
          style={{
            background:
              'radial-gradient(60% 80% at 22% 16%, rgba(124,58,237,0.14) 0%, transparent 72%), ' +
              'radial-gradient(48% 66% at 80% 20%, rgba(34,211,238,0.10) 0%, transparent 68%), ' +
              'radial-gradient(38% 54% at 56% 32%, rgba(236,72,153,0.07) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-x-[-14%] top-[38%] h-[36%] blur-[70px]"
          style={{
            background:
              'radial-gradient(52% 72% at 28% 36%, rgba(236,72,153,0.08) 0%, transparent 72%), ' +
              'radial-gradient(54% 78% at 74% 48%, rgba(124,58,237,0.10) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-x-[-10%] bottom-[-6%] h-[32%] blur-[60px]"
          style={{
            background:
              'radial-gradient(48% 68% at 50% 60%, rgba(34,211,238,0.06) 0%, transparent 66%)',
          }}
        />
      </div>
    )
  }

  // ── DARK MODE ─────────────────────────────────────────────────────────────
  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* ── Deep space base ── */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#030511_0%,#040816_30%,#050a18_55%,#030610_100%)]" />

      {/* ── Nebula orbs ── */}
      {/* Violet sweep — upper-left */}
      <div
        className="absolute"
        style={{
          top: '-8%', left: '-18%',
          width: '72%', height: '62%',
          background:
            'radial-gradient(ellipse, rgba(139,58,255,0.38) 0%, rgba(109,40,217,0.18) 32%, rgba(76,29,149,0.08) 58%, transparent 78%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Cyan arc — right */}
      <div
        className="absolute"
        style={{
          top: '14%', right: '-18%',
          width: '62%', height: '56%',
          background:
            'radial-gradient(ellipse, rgba(6,210,240,0.28) 0%, rgba(6,182,212,0.13) 38%, rgba(8,145,178,0.06) 62%, transparent 78%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Pink/magenta — lower-center */}
      <div
        className="absolute"
        style={{
          bottom: '8%', left: '18%',
          width: '66%', height: '48%',
          background:
            'radial-gradient(ellipse, rgba(220,50,180,0.22) 0%, rgba(236,72,153,0.10) 42%, transparent 68%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Violet accent — lower-right */}
      <div
        className="absolute"
        style={{
          bottom: '18%', right: '2%',
          width: '48%', height: '42%',
          background:
            'radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, rgba(124,58,237,0.09) 44%, transparent 68%)',
          filter: 'blur(64px)',
        }}
      />
      {/* Indigo bloom — center-left */}
      <div
        className="absolute"
        style={{
          top: '36%', left: '12%',
          width: '50%', height: '40%',
          background:
            'radial-gradient(ellipse, rgba(79,44,200,0.18) 0%, rgba(60,30,160,0.08) 50%, transparent 72%)',
          filter: 'blur(88px)',
        }}
      />
      {/* Bright cyan — upper-center */}
      <div
        className="absolute"
        style={{
          top: '-4%', left: '36%',
          width: '38%', height: '32%',
          background:
            'radial-gradient(ellipse, rgba(34,211,238,0.16) 0%, rgba(6,182,212,0.07) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Rose accent — upper-right */}
      <div
        className="absolute"
        style={{
          top: '6%', right: '14%',
          width: '30%', height: '28%',
          background:
            'radial-gradient(ellipse, rgba(240,90,200,0.14) 0%, transparent 60%)',
          filter: 'blur(44px)',
        }}
      />

      {/* ── Light ribbons ── */}
      <div
        className="absolute -top-6 right-[14%]"
        style={{
          width: '1px', height: '72%',
          background:
            'linear-gradient(180deg, transparent, rgba(167,139,250,0.14) 28%, rgba(167,139,250,0.07) 60%, transparent)',
          transform: 'rotate(-26deg) scaleX(280)',
          filter: 'blur(0.5px)',
        }}
      />
      <div
        className="absolute top-[22%] left-[6%]"
        style={{
          width: '1px', height: '58%',
          background:
            'linear-gradient(180deg, transparent, rgba(6,210,240,0.11) 36%, rgba(6,182,212,0.05) 68%, transparent)',
          transform: 'rotate(22deg) scaleX(180)',
          filter: 'blur(0.5px)',
        }}
      />
      <div
        className="absolute top-[8%] left-[44%]"
        style={{
          width: '1px', height: '50%',
          background:
            'linear-gradient(180deg, transparent, rgba(240,90,200,0.10) 32%, rgba(220,50,180,0.05) 64%, transparent)',
          transform: 'rotate(-12deg) scaleX(160)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* ── Grid texture ── */}
      <div className="absolute inset-0 opacity-[0.028]" style={darkGridStyle} />

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, rgba(2,3,10,0.26) 100%)',
        }}
      />

      {/* ── Stars (performance-gated) ── */}
      {!perfLow &&
        STARS.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: STAR_BG[star.color],
              boxShadow: STAR_GLOW[star.color],
              animationName: ANIM_NAMES[star.variant],
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />
        ))}

      {/* ── Meteors (performance-gated) ── */}
      {!perfLow &&
        METEORS.map(m => (
          <div
            key={m.id}
            className="meteor-trail"
            style={{
              top: m.top,
              left: m.left,
              animationDelay: m.delay,
              animationDuration: m.dur,
            }}
          />
        ))}
    </div>
  )
}
