import type { ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

// Deterministic pseudo-random — stable across renders, no hydration issues
function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const STAR_COUNT = 160
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: sr(i) * 100,
  y: sr(i + 100) * 100,
  size: sr(i + 200) * 2.6 + 0.5,      // 0.5 – 3.1 px
  delay: sr(i + 300) * 8,              // 0 – 8 s
  duration: sr(i + 400) * 3.5 + 2,    // 2 – 5.5 s
  variant: i % 3 as 0 | 1 | 2,
  color: i % 9 === 0 ? 'v'            // violet
       : i % 7 === 0 ? 'c'            // cyan
       : i % 13 === 0 ? 'p'           // pink/magenta
       : i % 11 === 0 ? 'g'           // gold
       : 'w',                          // white
}))

const STAR_BG: Record<string, string> = {
  v: 'rgba(167,139,250,1)',
  c: 'rgba(103,232,249,1)',
  p: 'rgba(240,90,200,1)',
  g: 'rgba(251,211,141,1)',
  w: 'rgba(255,255,255,1)',
}

// Glow intensity per star color
const STAR_GLOW: Record<string, string> = {
  v: '0 0 5px 2px rgba(167,139,250,0.7)',
  c: '0 0 5px 2px rgba(103,232,249,0.7)',
  p: '0 0 5px 2px rgba(240,90,200,0.7)',
  g: '0 0 4px 1.5px rgba(251,211,141,0.6)',
  w: '0 0 4px 1.5px rgba(255,255,255,0.6)',
}

const ANIM_NAMES = ['hs-star-a', 'hs-star-b', 'hs-star-c'] as const

// Subtle cosmic dust particles
const PARTICLE_COUNT = 28
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: sr(i + 700) * 100,
  y: sr(i + 800) * 100,
  size: sr(i + 900) * 3 + 1.5,        // 1.5 – 4.5 px
  delay: sr(i + 1000) * 12,
  duration: sr(i + 1100) * 6 + 8,    // 8 – 14 s
  color: i % 3 === 0 ? 'rgba(167,139,250,0.22)'
       : i % 3 === 1 ? 'rgba(103,232,249,0.18)'
       :                'rgba(240,90,200,0.15)',
}))

// Meteors — violet & cyan variants
const METEORS = [
  { id: 0,  top: '4%',  left: '88%', delay: '0s',    dur: '6.5s',  color: 'violet' },
  { id: 1,  top: '18%', left: '72%', delay: '2.6s',  dur: '5.8s',  color: 'cyan'   },
  { id: 2,  top: '2%',  left: '56%', delay: '5.2s',  dur: '7.6s',  color: 'violet' },
  { id: 3,  top: '28%', left: '93%', delay: '7.8s',  dur: '6.4s',  color: 'cyan'   },
  { id: 4,  top: '11%', left: '44%', delay: '10.8s', dur: '7s',    color: 'violet' },
  { id: 5,  top: '38%', left: '81%', delay: '14s',   dur: '5.4s',  color: 'cyan'   },
  { id: 6,  top: '6%',  left: '31%', delay: '17.2s', dur: '6.8s',  color: 'violet' },
  { id: 7,  top: '22%', left: '62%', delay: '20s',   dur: '7.2s',  color: 'cyan'   },
  { id: 8,  top: '45%', left: '95%', delay: '23.5s', dur: '5.9s',  color: 'violet' },
]

export default function HomeSectionBackground({ children }: { children: ReactNode }) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  return (
    <div className="relative">
      {/* ── Decorative background layer ── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {isDark ? (
          <>
            {/* ── Deep space base tone ── */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(15,5,40,0.72) 0%, transparent 70%)',
              }}
            />

            {/* ── Nebula core — violet sweep upper-left ── */}
            <div
              className="absolute"
              style={{
                top: '-8%', left: '-18%',
                width: '72%', height: '62%',
                background:
                  'radial-gradient(ellipse, rgba(139,58,255,0.42) 0%, rgba(109,40,217,0.22) 32%, rgba(76,29,149,0.10) 58%, transparent 78%)',
                filter: 'blur(60px)',
              }}
            />

            {/* ── Nebula core — cyan right arc ── */}
            <div
              className="absolute"
              style={{
                top: '14%', right: '-18%',
                width: '62%', height: '56%',
                background:
                  'radial-gradient(ellipse, rgba(6,210,240,0.32) 0%, rgba(6,182,212,0.16) 38%, rgba(8,145,178,0.07) 62%, transparent 78%)',
                filter: 'blur(70px)',
              }}
            />

            {/* ── Pink / magenta nebula — lower-center ── */}
            <div
              className="absolute"
              style={{
                bottom: '8%', left: '18%',
                width: '66%', height: '48%',
                background:
                  'radial-gradient(ellipse, rgba(220,50,180,0.28) 0%, rgba(236,72,153,0.14) 42%, transparent 68%)',
                filter: 'blur(80px)',
              }}
            />

            {/* ── Violet accent — lower-right ── */}
            <div
              className="absolute"
              style={{
                bottom: '18%', right: '2%',
                width: '48%', height: '42%',
                background:
                  'radial-gradient(ellipse, rgba(139,92,246,0.28) 0%, rgba(124,58,237,0.12) 44%, transparent 68%)',
                filter: 'blur(64px)',
              }}
            />

            {/* ── Deep indigo bloom — center-left mid ── */}
            <div
              className="absolute"
              style={{
                top: '36%', left: '12%',
                width: '50%', height: '40%',
                background:
                  'radial-gradient(ellipse, rgba(79,44,200,0.22) 0%, rgba(60,30,160,0.10) 50%, transparent 72%)',
                filter: 'blur(88px)',
              }}
            />

            {/* ── Bright cyan accent — upper-center ── */}
            <div
              className="absolute"
              style={{
                top: '-4%', left: '36%',
                width: '38%', height: '32%',
                background:
                  'radial-gradient(ellipse, rgba(34,211,238,0.20) 0%, rgba(6,182,212,0.08) 50%, transparent 70%)',
                filter: 'blur(50px)',
              }}
            />

            {/* ── Electric rose accent — upper-right ── */}
            <div
              className="absolute"
              style={{
                top: '6%', right: '14%',
                width: '30%', height: '28%',
                background:
                  'radial-gradient(ellipse, rgba(240,90,200,0.18) 0%, transparent 60%)',
                filter: 'blur(44px)',
              }}
            />

            {/* ── Light ribbon — violet diagonal ── */}
            <div
              className="absolute -top-6 right-[14%]"
              style={{
                width: '1px',
                height: '72%',
                background:
                  'linear-gradient(180deg, transparent, rgba(167,139,250,0.18) 28%, rgba(167,139,250,0.10) 60%, transparent)',
                transform: 'rotate(-26deg) scaleX(280)',
                filter: 'blur(0.5px)',
              }}
            />
            {/* ── Light ribbon — cyan diagonal ── */}
            <div
              className="absolute top-[22%] left-[6%]"
              style={{
                width: '1px',
                height: '58%',
                background:
                  'linear-gradient(180deg, transparent, rgba(6,210,240,0.14) 36%, rgba(6,182,212,0.06) 68%, transparent)',
                transform: 'rotate(22deg) scaleX(180)',
                filter: 'blur(0.5px)',
              }}
            />
            {/* ── Light ribbon — pink sweep ── */}
            <div
              className="absolute top-[52%] left-[28%]"
              style={{
                width: '1px',
                height: '44%',
                background:
                  'linear-gradient(180deg, transparent, rgba(220,50,180,0.12) 40%, transparent)',
                transform: 'rotate(-14deg) scaleX(220)',
                filter: 'blur(0.6px)',
              }}
            />

            {/* ── Nebula mist overlay — adds depth/layering ── */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 50% at 28% 42%, rgba(124,58,237,0.09) 0%, transparent 55%), ' +
                  'radial-gradient(ellipse 70% 60% at 78% 58%, rgba(6,182,212,0.08) 0%, transparent 52%)',
              }}
            />
          </>
        ) : (
          /* Light mode: minimal atmospheric overlays */
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 82% 52% at 64% 22%, rgba(124,58,237,0.055) 0%, transparent 60%), ' +
                'radial-gradient(ellipse 56% 42% at 18% 68%, rgba(6,182,212,0.04) 0%, transparent 55%)',
            }}
          />
        )}

        {/* ── Stars (dark, not perf-low) ── */}
        {isDark && !perfLow &&
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

        {/* ── Cosmic dust particles (dark, not perf-low) ── */}
        {isDark && !perfLow &&
          PARTICLES.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                filter: 'blur(1.5px)',
                animationName: 'hs-particle-drift',
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
              }}
            />
          ))}

        {/* ── Meteors (dark, not perf-low) ── */}
        {isDark && !perfLow &&
          METEORS.map(m => (
            <div
              key={m.id}
              className={`meteor-trail meteor-trail--${m.color}`}
              style={{
                top: m.top,
                left: m.left,
                animationDelay: m.delay,
                animationDuration: m.dur,
              }}
            />
          ))}
      </div>

      {/* ── Content ── */}
      {children}
    </div>
  )
}
