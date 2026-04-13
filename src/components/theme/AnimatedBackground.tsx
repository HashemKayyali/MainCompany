import { type CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const RICH_STAR_COUNT = 36

const RICH_STARS = Array.from({ length: RICH_STAR_COUNT }, (_, i) => ({
  id: i,
  x: sr(i) * 100,
  y: sr(i + 100) * 100,
  size: sr(i + 200) * 1.9 + 0.5,
  delay: sr(i + 300) * 8,
  duration: sr(i + 400) * 3 + 2.2,
  variant: (i % 3) as 0 | 1 | 2,
  color:
    i % 8 === 0 ? 'v'
    : i % 11 === 0 ? 'c'
    : i % 13 === 0 ? 'p'
    : 'w',
}))

const STAR_BG: Record<string, string> = {
  v: 'rgba(167,139,250,1)',
  c: 'rgba(103,232,249,1)',
  p: 'rgba(240,90,200,1)',
  w: 'rgba(255,255,255,1)',
}

const STAR_GLOW: Record<string, string> = {
  v: '0 0 5px 2px rgba(167,139,250,0.52)',
  c: '0 0 5px 2px rgba(103,232,249,0.5)',
  p: '0 0 4px 1.5px rgba(240,90,200,0.42)',
  w: '0 0 4px 1.5px rgba(255,255,255,0.4)',
}

const ANIM_NAMES = ['hs-star-a', 'hs-star-b', 'hs-star-c'] as const

const RICH_METEORS = [
  { id: 0, top: '10%', left: '76%', delay: '1.2s', dur: '7.2s', tone: 'violet' },
  { id: 1, top: '18%', left: '58%', delay: '6.5s', dur: '7.8s', tone: 'cyan' },
]

const darkGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
  backgroundSize: '168px 168px',
}

const lightGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.02) 1px, transparent 1px)',
  backgroundSize: '144px 144px',
}

type Props = {
  position?: 'fixed' | 'absolute'
  className?: string
  variant?: 'lightweight' | 'rich'
}

export default function AnimatedBackground({
  position = 'fixed',
  className = '',
  variant = 'rich',
}: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const isLightweight = variant === 'lightweight'
  const canAnimateRichAccents = variant === 'rich' && !perfLow
  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`} aria-hidden="true">
        <div className="absolute inset-0 bg-[#f6f3ff]" />
        <div className="absolute inset-0 opacity-40" style={lightGridStyle} />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 42% at 18% 0%, rgba(124,58,237,0.12) 0%, transparent 72%), ' +
              'radial-gradient(54% 34% at 84% 16%, rgba(34,211,238,0.08) 0%, transparent 68%), ' +
              'radial-gradient(50% 30% at 50% 100%, rgba(236,72,153,0.05) 0%, transparent 70%)',
          }}
        />

        {!isLightweight && (
          <div
            className="absolute inset-x-[-12%] top-[8%] h-[46%] blur-[64px]"
            style={{
              background:
                'radial-gradient(48% 70% at 28% 24%, rgba(124,58,237,0.12) 0%, transparent 72%), ' +
                'radial-gradient(42% 60% at 76% 20%, rgba(34,211,238,0.08) 0%, transparent 70%)',
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#030511_0%,#040816_42%,#050918_68%,#030610_100%)]" />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(72% 44% at 18% -4%, rgba(124,58,237,0.18) 0%, transparent 70%), ' +
            'radial-gradient(56% 34% at 86% 16%, rgba(34,211,238,0.10) 0%, transparent 68%), ' +
            'radial-gradient(58% 40% at 52% 104%, rgba(236,72,153,0.08) 0%, transparent 72%), ' +
            'radial-gradient(48% 28% at 50% 52%, rgba(99,102,241,0.04) 0%, transparent 78%)',
        }}
      />

      <div className="absolute inset-0 opacity-[0.026]" style={darkGridStyle} />

      {!isLightweight && (
        <>
          <div
            className="absolute -left-[12%] top-[-6%] h-[46%] w-[52%] blur-[40px]"
            style={{
              background:
                'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(109,40,217,0.09) 44%, transparent 72%)',
            }}
          />
          <div
            className="absolute right-[-10%] top-[10%] h-[38%] w-[44%] blur-[46px]"
            style={{
              background:
                'radial-gradient(circle, rgba(6,182,212,0.16) 0%, rgba(6,182,212,0.06) 46%, transparent 74%)',
            }}
          />
        </>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 42%, rgba(2,3,10,0.22) 100%)',
        }}
      />

      {canAnimateRichAccents &&
        RICH_STARS.map(star => (
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

      {canAnimateRichAccents &&
        RICH_METEORS.map(meteor => (
          <div
            key={meteor.id}
            className={`meteor-trail meteor-trail--${meteor.tone}`}
            style={{
              top: meteor.top,
              left: meteor.left,
              animationDelay: meteor.delay,
              animationDuration: meteor.dur,
            }}
          />
        ))}
    </div>
  )
}
