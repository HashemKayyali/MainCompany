import { type CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

type Props = {
  position?: 'fixed' | 'absolute'
  className?: string
}

const darkGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
  backgroundSize: '140px 140px',
}

const lightGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.032) 1px, transparent 1px)',
  backgroundSize: '120px 120px',
}

export default function AnimatedBackground({ position = 'fixed', className = '' }: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
        {/* Light base */}
        <div className="absolute inset-0 bg-[#f5f3ff]" />

        {/* Soft grid */}
        <div className="absolute inset-0 opacity-40" style={lightGridStyle} />

        {/* Top atmospheric glow - violet + cyan */}
        <div
          className="absolute inset-x-[-18%] top-[-4%] h-[44%] blur-[160px]"
          style={{
            background:
              'radial-gradient(60% 80% at 22% 16%, rgba(124,58,237,0.11) 0%, transparent 72%), ' +
              'radial-gradient(48% 66% at 80% 20%, rgba(34,211,238,0.07) 0%, transparent 68%), ' +
              'radial-gradient(38% 54% at 56% 32%, rgba(236,72,153,0.05) 0%, transparent 60%)',
          }}
        />

        {/* Mid atmospheric glow - pink + violet */}
        <div
          className="absolute inset-x-[-14%] top-[38%] h-[36%] blur-[140px]"
          style={{
            background:
              'radial-gradient(52% 72% at 28% 36%, rgba(236,72,153,0.07) 0%, transparent 72%), ' +
              'radial-gradient(54% 78% at 74% 48%, rgba(124,58,237,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Bottom glow - subtle cyan */}
        <div
          className="absolute inset-x-[-10%] bottom-[-6%] h-[32%] blur-[120px]"
          style={{
            background:
              'radial-gradient(48% 68% at 50% 60%, rgba(34,211,238,0.05) 0%, transparent 66%)',
          }}
        />
      </div>
    )
  }

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
      {/* Dark base gradient - deep navy to near-black */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#030511_0%,#040816_30%,#050a18_55%,#030610_100%)]" />

      {/* Atmospheric color layers */}
      {!perfLow && (
        <>
          {/* Top-left: Violet bloom */}
          <div
            className="absolute inset-x-[-28%] top-[-6%] h-[42%] blur-[100px]"
            style={{
              background:
                'radial-gradient(58% 80% at 18% 20%, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.08) 36%, transparent 70%), ' +
                'radial-gradient(42% 66% at 76% 18%, rgba(34,211,238,0.13) 0%, rgba(34,211,238,0.04) 42%, transparent 68%)',
              mixBlendMode: 'screen',
              opacity: 0.5,
            }}
          />

          {/* Mid: Pink + violet blend */}
          <div
            className="absolute inset-x-[-24%] top-[28%] h-[40%] blur-[90px]"
            style={{
              background:
                'radial-gradient(50% 78% at 24% 38%, rgba(236,72,153,0.13) 0%, transparent 68%), ' +
                'radial-gradient(56% 72% at 78% 48%, rgba(124,58,237,0.16) 0%, transparent 70%), ' +
                'radial-gradient(36% 58% at 54% 22%, rgba(34,211,238,0.08) 0%, transparent 64%)',
              mixBlendMode: 'screen',
              opacity: 0.42,
            }}
          />

          {/* Bottom: Deep violet + cyan */}
          <div
            className="absolute inset-x-[-20%] bottom-[-8%] h-[38%] blur-[110px]"
            style={{
              background:
                'radial-gradient(54% 74% at 34% 60%, rgba(139,92,246,0.12) 0%, transparent 68%), ' +
                'radial-gradient(44% 62% at 72% 70%, rgba(34,211,238,0.09) 0%, transparent 64%)',
              mixBlendMode: 'screen',
              opacity: 0.36,
            }}
          />
        </>
      )}

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.032]" style={darkGridStyle} />

      {/* Subtle vignette: darker edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, rgba(2,3,10,0.28) 100%)',
        }}
      />
    </div>
  )
}
