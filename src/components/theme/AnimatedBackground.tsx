import { type CSSProperties } from 'react'
import { usePerfMode } from '../../hooks/usePerfMode'

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const SPARKLE_COUNT = 18

const SPARKLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
  id: i,
  x: sr(i) * 100,
  y: sr(i + 100) * 100,
  size: sr(i + 200) * 2.4 + 0.6,
  delay: sr(i + 300) * 8,
  duration: sr(i + 400) * 3 + 3,
  variant: (i % 3) as 0 | 1 | 2,
  color:
    i % 5 === 0 ? 'pink'
    : i % 7 === 0 ? 'lavender'
    : 'violet',
}))

const SPARKLE_BG: Record<string, string> = {
  violet: 'rgba(168, 85, 247, 0.85)',
  lavender: 'rgba(196, 181, 253, 0.85)',
  pink: 'rgba(217, 70, 239, 0.75)',
}

const SPARKLE_GLOW: Record<string, string> = {
  violet: '0 0 6px 2px rgba(168, 85, 247, 0.45)',
  lavender: '0 0 6px 2px rgba(196, 181, 253, 0.4)',
  pink: '0 0 6px 2px rgba(217, 70, 239, 0.4)',
}

const ANIM_NAMES = ['hs-star-a', 'hs-star-b', 'hs-star-c'] as const

const lightGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.035) 1px, transparent 1px)',
  backgroundSize: '128px 128px',
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
  const { perfLow } = usePerfMode()

  const isLightweight = variant === 'lightweight'
  const canAnimate = variant === 'rich' && !perfLow
  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Base layer – soft white/lavender wash */}
      <div className="absolute inset-0 bg-[#fbf8ff]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.55]" style={lightGridStyle} />

      {/* Primary radial glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(72% 44% at 12% -4%, rgba(124,58,237,0.16) 0%, transparent 70%), ' +
            'radial-gradient(58% 36% at 88% 14%, rgba(168,85,247,0.13) 0%, transparent 68%), ' +
            'radial-gradient(58% 40% at 52% 104%, rgba(217,70,239,0.10) 0%, transparent 72%), ' +
            'radial-gradient(48% 28% at 50% 50%, rgba(196,165,255,0.08) 0%, transparent 78%)',
        }}
      />

      {/* Larger blurred orbs for depth */}
      {!isLightweight && (
        <>
          <div
            className="absolute -left-[12%] top-[-8%] h-[52%] w-[58%] blur-[64px]"
            style={{
              background:
                'radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(124,58,237,0.10) 44%, transparent 72%)',
            }}
          />
          <div
            className="absolute right-[-10%] top-[8%] h-[44%] w-[48%] blur-[60px]"
            style={{
              background:
                'radial-gradient(circle, rgba(217,70,239,0.14) 0%, rgba(168,85,247,0.06) 46%, transparent 74%)',
            }}
          />
          <div
            className="absolute left-[20%] bottom-[-8%] h-[40%] w-[60%] blur-[72px]"
            style={{
              background:
                'radial-gradient(circle, rgba(196,165,255,0.20) 0%, rgba(168,85,247,0.08) 50%, transparent 76%)',
            }}
          />
        </>
      )}

      {/* Vignette to focus content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 50%, rgba(124,58,237,0.04) 100%)',
        }}
      />

      {/* Sparkles for life */}
      {canAnimate &&
        SPARKLES.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: SPARKLE_BG[s.color],
              boxShadow: SPARKLE_GLOW[s.color],
              animationName: ANIM_NAMES[s.variant],
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />
        ))}
    </div>
  )
}
