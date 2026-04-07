import { useMemo, type CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

type Props = {
  position?: 'fixed' | 'absolute'
  className?: string
}

type Layer = {
  className: string
  style: CSSProperties
}

const darkGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '152px 152px',
}

const lightGridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.045) 1px, transparent 1px)',
  backgroundSize: '152px 152px',
}

const atmosphereFields: Layer[] = [
  {
    className: 'absolute inset-x-[-18%] top-[0%] h-[30%] blur-[70px] ambient-drift',
    style: {
      background:
        'radial-gradient(52% 80% at 18% 20%, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.08) 32%, transparent 68%), radial-gradient(36% 64% at 78% 18%, rgba(34,211,238,0.12) 0%, transparent 64%), radial-gradient(40% 60% at 50% 56%, rgba(236,72,153,0.1) 0%, transparent 66%)',
      mixBlendMode: 'screen',
      opacity: 0.52,
      animationDuration: '28s',
    },
  },
  {
    className: 'absolute inset-x-[-20%] top-[31%] h-[32%] blur-[74px] ambient-drift-reverse',
    style: {
      background:
        'radial-gradient(50% 78% at 20% 34%, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.05) 32%, transparent 68%), radial-gradient(54% 74% at 78% 44%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 34%, transparent 70%), radial-gradient(36% 58% at 58% 16%, rgba(34,211,238,0.1) 0%, transparent 66%)',
      mixBlendMode: 'screen',
      opacity: 0.46,
      animationDuration: '30s',
      animationDelay: '-8s',
    },
  },
]

const lightModeFields: Layer[] = [
  {
    className: 'absolute inset-x-[-10%] top-[0%] h-[34%] blur-[132px]',
    style: {
      background:
        'radial-gradient(54% 78% at 18% 16%, rgba(124,58,237,0.14) 0%, transparent 74%), radial-gradient(42% 64% at 78% 20%, rgba(34,211,238,0.10) 0%, transparent 68%)',
    },
  },
  {
    className: 'absolute inset-x-[-10%] top-[42%] h-[30%] blur-[128px]',
    style: {
      background:
        'radial-gradient(48% 72% at 30% 26%, rgba(236,72,153,0.1) 0%, transparent 72%), radial-gradient(50% 76% at 74% 42%, rgba(124,58,237,0.11) 0%, transparent 72%)',
    },
  },
]

export default function AnimatedBackground({ position = 'fixed', className = '' }: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  const dustPattern = useMemo(() => {
    const specks: Array<[number, number, number, string, number]> = [
      [4, 6, 1.2, '255,255,255', 0.05],
      [16, 9, 1.2, '255,255,255', 0.06],
      [24, 16, 1.1, '34,211,238', 0.05],
      [31, 7, 1.1, '236,72,153', 0.05],
      [42, 14, 1.2, '255,255,255', 0.05],
      [57, 26, 1.0, '236,72,153', 0.05],
      [71, 33, 1.2, '255,255,255', 0.05],
      [83, 28, 1.0, '167,139,250', 0.05],
      [10, 67, 1.0, '255,255,255', 0.04],
      [34, 69, 1.1, '34,211,238', 0.04],
      [58, 96, 1.0, '255,255,255', 0.05],
      [73, 91, 1.1, '34,211,238', 0.04],
    ]

    return specks
      .map(
        ([x, y, size, color, alpha]) =>
          `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(${color},${alpha}), transparent 68%)`
      )
      .join(', ')
  }, [])

  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
        <div className="absolute inset-0 bg-[#f6f5ff]" />
        <div className="absolute inset-0 opacity-45" style={lightGridStyle} />
        {lightModeFields.map((layer, index) => (
          <div key={index} className={layer.className} style={layer.style} />
        ))}
      </div>
    )
  }

  if (perfLow) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#03050d_0%,#070a16_34%,#050711_100%)]" />
        <div className="absolute inset-0 opacity-[0.06]" style={darkGridStyle} />
      </div>
    )
  }

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#03050d_0%,#070a16_34%,#050711_100%)]" />
      {atmosphereFields.map((layer, index) => (
        <div key={index} className={layer.className} style={layer.style} />
      ))}
      <div className="absolute inset-0 opacity-[0.06]" style={darkGridStyle} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: dustPattern }} />
    </div>
  )
}