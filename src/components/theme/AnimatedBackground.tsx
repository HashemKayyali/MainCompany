import { useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

type Props = {
  /** default: fixed */
  position?: 'fixed' | 'absolute'
  className?: string
}

export default function AnimatedBackground({ position = 'fixed', className = '' }: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const starMap = useMemo(() => {
    const stars = [
      [6, 12, 1.2, 0.95],[12, 28, 1.0, 0.75],[18, 8, 1.6, 0.9],[22, 42, 1.1, 0.55],
      [28, 16, 1.0, 0.55],[33, 30, 1.4, 0.8],[38, 12, 1.1, 0.65],[41, 55, 1.0, 0.55],
      [46, 18, 2.0, 0.9],[52, 10, 1.0, 0.55],[57, 34, 1.2, 0.65],[61, 20, 1.0, 0.55],
      [66, 8, 1.6, 0.9],[70, 28, 1.1, 0.6],[74, 46, 1.2, 0.65],[78, 14, 1.0, 0.55],
      [83, 36, 1.4, 0.75],[88, 20, 1.0, 0.55],[92, 10, 1.8, 0.9],[95, 48, 1.0, 0.55],
      [9, 58, 1.0, 0.5],[16, 74, 1.2, 0.6],[24, 86, 1.0, 0.5],[32, 66, 1.6, 0.75],
      [40, 78, 1.0, 0.5],[48, 92, 1.1, 0.55],[58, 72, 1.3, 0.65],[68, 86, 1.0, 0.5],
      [76, 64, 1.2, 0.6],[86, 82, 1.0, 0.5],[94, 70, 1.5, 0.7],
    ]
    return stars
      .map(([x, y, s, o]) => `radial-gradient(${s}px ${s}px at ${x}% ${y}%, rgba(255,255,255,${o}), transparent 60%)`)
      .join(', ')
  }, [])

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  // Low mode: no grain, no star layers, no huge blurs, no continuous animations.
  if (perfLow) {
    if (!isDark) {
      return (
        <div className={`${rootPos} pointer-events-none z-0 ${className}`}>
          <div className="absolute inset-0 bg-[#f5f3ff]" />
          <div className="absolute inset-0 dot-pattern opacity-60" />
          <div
            className="absolute -top-[18%] left-[10%] w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 62%)' }}
          />
          <div
            className="absolute -bottom-[18%] right-[8%] w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 62%)' }}
          />
        </div>
      )
    }

    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-void-950" />
        <div
          className="absolute -left-[12%] top-[10%] w-[140%] h-[70%]"
          style={{
            background:
              'radial-gradient(900px 360px at 35% 45%, rgba(236,72,153,0.28) 0%, transparent 72%),' +
              'radial-gradient(820px 320px at 60% 50%, rgba(124,58,237,0.26) 0%, transparent 74%),' +
              'radial-gradient(700px 300px at 80% 52%, rgba(34,211,238,0.16) 0%, transparent 76%)',
            opacity: 0.9,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.88) 100%)',
            opacity: 0.95,
          }}
        />
      </div>
    )
  }

  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 ${className}`}>
        <div className="absolute inset-0 bg-[#f5f3ff]" />
        <div className="absolute inset-0 dot-pattern opacity-70" />
        <div className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] rounded-full bg-violet-200/25 blur-[160px] animate-aurora" />
        <div
          className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-pink-200/20 blur-[140px] animate-aurora"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-cyan-200/15 blur-[100px] animate-aurora"
          style={{ animationDelay: '-8s' }}
        />
        <div className="grain-overlay" />
      </div>
    )
  }

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-void-950" />

      <div className="star-field">
        <div className="layer s1" />
        <div className="layer s2" />
      </div>

      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: starMap,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.06))',
        }}
      />

      <div className="absolute inset-0">
        <div
          className="absolute -left-[20%] top-[6%] w-[160%] h-[70%] blur-[0px]"
          style={{
            background:
              'radial-gradient(1200px 420px at 35% 45%, rgba(236,72,153,0.55) 0%, rgba(236,72,153,0.22) 38%, transparent 70%),' +
              'radial-gradient(980px 360px at 55% 50%, rgba(124,58,237,0.42) 0%, rgba(124,58,237,0.18) 40%, transparent 72%),' +
              'radial-gradient(760px 320px at 78% 52%, rgba(239,68,68,0.26) 0%, rgba(239,68,68,0.12) 45%, transparent 76%)',
            mixBlendMode: 'screen',
            filter: 'saturate(1.35) contrast(1.08)',
            opacity: 0.95,
            transform: 'rotate(-6deg)',
          }}
        />

        <div
          className="absolute left-[-6%] top-[22%] w-[520px] h-[520px] rounded-full blur-[60px]"
          style={{
            background:
              'radial-gradient(circle at 45% 45%, rgba(255,255,255,0.30) 0%, rgba(236,72,153,0.22) 25%, rgba(124,58,237,0.12) 48%, transparent 72%)',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        />

        <div
          className="absolute -left-[10%] top-[30%] w-[140%] h-[44%] blur-[6px]"
          style={{
            background:
              'radial-gradient(1200px 260px at 52% 55%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, transparent 78%),' +
              'radial-gradient(900px 220px at 30% 60%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 48%, transparent 78%)',
            opacity: 0.9,
            transform: 'rotate(-8deg)',
          }}
        />

        <div
          className="absolute right-[8%] top-[40%] w-[520px] h-[520px] rounded-full blur-[90px]"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.10) 35%, transparent 70%)',
            mixBlendMode: 'screen',
            opacity: 0.75,
          }}
        />

        <div
          className="absolute -inset-[20%] blur-[28px]"
          style={{
            background:
              'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.10), transparent 22%),' +
              'radial-gradient(circle at 62% 40%, rgba(255,255,255,0.08), transparent 24%),' +
              'radial-gradient(circle at 45% 70%, rgba(255,255,255,0.06), transparent 28%)',
            mixBlendMode: 'screen',
            opacity: 0.55,
            animation: 'nebulaFloat 14s ease-in-out infinite',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.86) 100%)',
            opacity: 0.95,
          }}
        />
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-purple-500/[0.05] animate-orbit"
        style={{ animationDuration: '60s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-cyan-400/[0.05] animate-orbit"
        style={{ animationDuration: '44s', animationDirection: 'reverse' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-pink-400/[0.045] animate-orbit"
        style={{ animationDuration: '32s' }}
      />

      <div className="grain-overlay" />

      <style>{`
        @keyframes nebulaFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-2.2%, -1.4%, 0) scale(1.035); }
        }
      `}</style>
    </div>
  )
}