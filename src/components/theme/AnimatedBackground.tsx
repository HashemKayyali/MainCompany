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

  // ⭐️ Static stars map (no animation)
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

      // extra tiny stars for richer field (still static)
      [5, 85, 0.9, 0.45],[11, 50, 0.8, 0.35],[15, 18, 0.9, 0.4],[19, 60, 0.8, 0.35],
      [27, 54, 0.9, 0.42],[35, 90, 0.8, 0.32],[43, 6, 0.9, 0.38],[51, 58, 0.8, 0.32],
      [63, 44, 0.9, 0.4],[72, 6, 0.8, 0.32],[81, 92, 0.9, 0.42],[90, 36, 0.8, 0.3],
    ] as Array<[number, number, number, number]>

    return stars
      .map(([x, y, s, o]) => `radial-gradient(${s}px ${s}px at ${x}% ${y}%, rgba(255,255,255,${o}), transparent 60%)`)
      .join(', ')
  }, [])

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  /**
   * PERF LOW: static + light
   * - no grain overlay heavy layers
   * - no animations
   */
  if (perfLow) {
    if (!isDark) {
      return (
        <div className={`${rootPos} pointer-events-none z-0 ${className}`}>
          <div className="absolute inset-0 bg-[#f6f5ff]" />
          <div className="absolute inset-0 dot-pattern opacity-50" />
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
              'radial-gradient(900px 360px at 35% 45%, rgba(236,72,153,0.22) 0%, transparent 72%),' +
              'radial-gradient(820px 320px at 60% 50%, rgba(124,58,237,0.20) 0%, transparent 74%),' +
              'radial-gradient(700px 300px at 80% 52%, rgba(34,211,238,0.12) 0%, transparent 76%)',
            opacity: 0.9,
          }}
        />

        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: starMap,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.04))',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.90) 100%)',
            opacity: 0.95,
          }}
        />
      </div>
    )
  }

  /**
   * LIGHT MODE: static dreamy nebula + dots
   * (no animate-aurora, no grain animation)
   */
  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[#f6f5ff]" />
        <div className="absolute inset-0 dot-pattern opacity-55" />

        <div
          className="absolute -top-[16%] left-[10%] w-[780px] h-[780px] rounded-full blur-[170px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 62%)' }}
        />
        <div
          className="absolute -bottom-[14%] right-[6%] w-[640px] h-[640px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 64%)' }}
        />
        <div
          className="absolute top-[34%] left-[58%] w-[420px] h-[420px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 66%)' }}
        />

        {/* subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 38%, rgba(245,243,255,0.00) 70%)',
            opacity: 0.55,
          }}
        />
      </div>
    )
  }

  /**
   * DARK MODE: static space nebula + static stars
   * - no orbit rings animation
   * - no star-field moving layers
   * - no floating nebula animation
   */
  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-void-950" />

      {/* Static star layer */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: starMap,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.06))',
        }}
      />

      {/* Nebula (static) */}
      <div className="absolute inset-0">
        <div
          className="absolute -left-[20%] top-[6%] w-[160%] h-[70%]"
          style={{
            background:
              'radial-gradient(1200px 420px at 35% 45%, rgba(236,72,153,0.52) 0%, rgba(236,72,153,0.18) 40%, transparent 72%),' +
              'radial-gradient(980px 360px at 55% 50%, rgba(124,58,237,0.40) 0%, rgba(124,58,237,0.14) 42%, transparent 74%),' +
              'radial-gradient(780px 320px at 78% 52%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.10) 45%, transparent 78%),' +
              'radial-gradient(820px 360px at 70% 30%, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.08) 48%, transparent 78%)',
            mixBlendMode: 'screen',
            filter: 'saturate(1.35) contrast(1.08)',
            opacity: 0.95,
            transform: 'rotate(-6deg)',
          }}
        />

        {/* Core glow */}
        <div
          className="absolute left-[-6%] top-[22%] w-[560px] h-[560px] rounded-full blur-[70px]"
          style={{
            background:
              'radial-gradient(circle at 45% 45%, rgba(255,255,255,0.26) 0%, rgba(236,72,153,0.18) 28%, rgba(124,58,237,0.10) 52%, transparent 74%)',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        />

        {/* Dark dust lanes */}
        <div
          className="absolute -left-[10%] top-[30%] w-[140%] h-[44%]"
          style={{
            background:
              'radial-gradient(1200px 260px at 52% 55%, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.55) 42%, transparent 80%),' +
              'radial-gradient(900px 220px at 30% 60%, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.32) 50%, transparent 80%)',
            opacity: 0.9,
            transform: 'rotate(-8deg)',
            filter: 'blur(6px)',
          }}
        />

        {/* Right cyan mist */}
        <div
          className="absolute right-[7%] top-[40%] w-[540px] h-[540px] rounded-full blur-[95px]"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0.08) 40%, transparent 72%)',
            mixBlendMode: 'screen',
            opacity: 0.75,
          }}
        />

        {/* Micro highlights (static) */}
        <div
          className="absolute -inset-[20%] blur-[26px]"
          style={{
            background:
              'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.08), transparent 22%),' +
              'radial-gradient(circle at 62% 40%, rgba(255,255,255,0.06), transparent 24%),' +
              'radial-gradient(circle at 45% 70%, rgba(255,255,255,0.05), transparent 28%)',
            mixBlendMode: 'screen',
            opacity: 0.55,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.90) 100%)',
            opacity: 0.95,
          }}
        />
      </div>

      {/* Optional: static grain (kept very light). Remove if you want perfectly clean */}
      <div className="grain-overlay opacity-60" />
    </div>
  )
}