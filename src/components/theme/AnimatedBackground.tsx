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
    'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
  backgroundSize: '152px 152px',
}

const darkMeshStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.065) 1px, transparent 0)',
  backgroundSize: '24px 24px',
}

const darkScanStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(180deg, rgba(255,255,255,0.012), transparent 20%, transparent 82%, rgba(255,255,255,0.008)), linear-gradient(90deg, rgba(34,211,238,0.018), transparent 38%, rgba(236,72,153,0.016) 68%, transparent 100%)',
  backgroundSize: '100% 8px, 100% 100%',
  mixBlendMode: 'soft-light',
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
        'radial-gradient(52% 80% at 18% 20%, rgba(124,58,237,0.28) 0%, rgba(124,58,237,0.10) 32%, transparent 68%), radial-gradient(36% 64% at 78% 18%, rgba(34,211,238,0.16) 0%, transparent 64%), radial-gradient(40% 60% at 50% 56%, rgba(236,72,153,0.14) 0%, transparent 66%)',
      mixBlendMode: 'screen',
      opacity: 0.62,
      animationDuration: '28s',
    },
  },
  {
    className: 'absolute inset-x-[-20%] top-[31%] h-[32%] blur-[74px] ambient-drift-reverse',
    style: {
      background:
        'radial-gradient(50% 78% at 20% 34%, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.06) 32%, transparent 68%), radial-gradient(54% 74% at 78% 44%, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.07) 34%, transparent 70%), radial-gradient(36% 58% at 58% 16%, rgba(34,211,238,0.14) 0%, transparent 66%)',
      mixBlendMode: 'screen',
      opacity: 0.54,
      animationDuration: '30s',
      animationDelay: '-8s',
    },
  },
  {
    className: 'absolute inset-x-[-16%] top-[66%] h-[30%] blur-[70px] ambient-drift',
    style: {
      background:
        'radial-gradient(46% 74% at 22% 26%, rgba(34,211,238,0.14) 0%, transparent 64%), radial-gradient(52% 82% at 74% 40%, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.07) 34%, transparent 70%), radial-gradient(40% 64% at 48% 82%, rgba(236,72,153,0.14) 0%, transparent 68%)',
      mixBlendMode: 'screen',
      opacity: 0.5,
      animationDuration: '32s',
      animationDelay: '-15s',
    },
  },
]

const lightRibbons: Layer[] = [
  {
    className: 'absolute inset-x-[-10%] top-[18%] h-[11rem] blur-[38px] ambient-breathe',
    style: {
      background:
        'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.15) 18%, rgba(236,72,153,0.18) 42%, rgba(34,211,238,0.13) 66%, transparent 88%)',
      mixBlendMode: 'screen',
      opacity: 0.22,
      transform: 'rotate(-7deg)',
      animationDuration: '15s',
    },
  },
  {
    className: 'absolute inset-x-[-12%] top-[49%] h-[12rem] blur-[42px] ambient-breathe',
    style: {
      background:
        'linear-gradient(90deg, transparent 4%, rgba(34,211,238,0.12) 22%, rgba(124,58,237,0.16) 50%, rgba(236,72,153,0.13) 72%, transparent 94%)',
      mixBlendMode: 'screen',
      opacity: 0.17,
      transform: 'rotate(5deg)',
      animationDuration: '18s',
      animationDelay: '-4s',
    },
  },
  {
    className: 'absolute inset-x-[-8%] top-[82%] h-[10rem] blur-[40px] ambient-breathe',
    style: {
      background:
        'linear-gradient(90deg, transparent 10%, rgba(236,72,153,0.13) 32%, rgba(124,58,237,0.16) 52%, rgba(34,211,238,0.11) 70%, transparent 92%)',
      mixBlendMode: 'screen',
      opacity: 0.15,
      transform: 'rotate(-4deg)',
      animationDuration: '16s',
      animationDelay: '-8s',
    },
  },
]

const ringFields: Layer[] = [
  {
    className: 'absolute -left-[26%] top-[1%] h-[54rem] w-[54rem] rounded-full ambient-drift',
    style: {
      background:
        'radial-gradient(circle at center, transparent 60%, rgba(124,58,237,0.16) 62%, rgba(124,58,237,0.05) 66%, transparent 70%)',
      mixBlendMode: 'screen',
      opacity: 0.28,
      filter: 'blur(1px)',
      animationDuration: '32s',
    },
  },
  {
    className: 'absolute right-[-22%] top-[34%] h-[48rem] w-[48rem] rounded-full ambient-drift-reverse',
    style: {
      background:
        'radial-gradient(circle at center, transparent 61%, rgba(34,211,238,0.12) 63%, rgba(34,211,238,0.04) 67%, transparent 71%)',
      mixBlendMode: 'screen',
      opacity: 0.24,
      filter: 'blur(1px)',
      animationDuration: '36s',
      animationDelay: '-14s',
    },
  },
  {
    className: 'absolute left-[2%] top-[70%] h-[44rem] w-[44rem] rounded-full ambient-drift',
    style: {
      background:
        'radial-gradient(circle at center, transparent 60%, rgba(236,72,153,0.12) 62%, rgba(124,58,237,0.05) 66%, transparent 71%)',
      mixBlendMode: 'screen',
      opacity: 0.2,
      filter: 'blur(1px)',
      animationDuration: '34s',
      animationDelay: '-6s',
    },
  },
]

const sculptForms: Layer[] = [
  {
    className: 'absolute -left-[10%] top-[8%] h-[28rem] w-[18rem] ambient-drift',
    style: {
      borderRadius: '42% 58% 46% 54% / 36% 44% 56% 64%',
      background:
        'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(124,58,237,0.1) 22%, rgba(9,11,24,0.28) 62%, rgba(236,72,153,0.08) 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -18px 34px rgba(2,6,18,0.18), 0 32px 72px rgba(2,6,18,0.24)',
      transform: 'rotate(-18deg)',
      opacity: 0.18,
      filter: 'blur(0.6px)',
      animationDuration: '31s',
    },
  },
  {
    className: 'absolute right-[-8%] top-[28%] h-[24rem] w-[34rem] ambient-drift-reverse',
    style: {
      borderRadius: '58% 42% 52% 48% / 48% 58% 42% 52%',
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(34,211,238,0.08) 26%, rgba(8,10,20,0.22) 60%, rgba(124,58,237,0.08) 100%)',
      border: '1px solid rgba(255,255,255,0.04)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -18px 34px rgba(2,6,18,0.18), 0 30px 70px rgba(2,6,18,0.22)',
      transform: 'rotate(16deg)',
      opacity: 0.14,
      filter: 'blur(0.8px)',
      animationDuration: '34s',
      animationDelay: '-9s',
    },
  },
  {
    className: 'absolute left-[24%] top-[72%] h-[18rem] w-[16rem] ambient-drift',
    style: {
      borderRadius: '46% 54% 60% 40% / 40% 42% 58% 60%',
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(236,72,153,0.08) 22%, rgba(8,10,20,0.24) 64%, rgba(124,58,237,0.08) 100%)',
      border: '1px solid rgba(255,255,255,0.04)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -14px 28px rgba(2,6,18,0.16), 0 22px 56px rgba(2,6,18,0.18)',
      transform: 'rotate(10deg)',
      opacity: 0.1,
      filter: 'blur(0.5px)',
      animationDuration: '29s',
      animationDelay: '-6s',
    },
  },
]

const lightColumns: Layer[] = [
  {
    className: 'absolute left-[5%] top-[9%] h-[34%] w-[24%] blur-[68px] ambient-drift',
    style: {
      background:
        'linear-gradient(180deg, rgba(124,58,237,0.32), rgba(124,58,237,0.05) 72%)',
      mixBlendMode: 'screen',
      opacity: 0.16,
      transform: 'rotate(12deg)',
      animationDuration: '26s',
    },
  },
  {
    className: 'absolute right-[4%] top-[42%] h-[32%] w-[22%] blur-[72px] ambient-drift-reverse',
    style: {
      background:
        'linear-gradient(180deg, rgba(34,211,238,0.22), rgba(34,211,238,0.03) 72%)',
      mixBlendMode: 'screen',
      opacity: 0.13,
      transform: 'rotate(-13deg)',
      animationDuration: '28s',
      animationDelay: '-11s',
    },
  },
  {
    className: 'absolute left-[22%] top-[73%] h-[24%] w-[20%] blur-[66px] ambient-drift',
    style: {
      background:
        'linear-gradient(180deg, rgba(236,72,153,0.20), rgba(236,72,153,0.03) 74%)',
      mixBlendMode: 'screen',
      opacity: 0.11,
      transform: 'rotate(9deg)',
      animationDuration: '29s',
      animationDelay: '-5s',
    },
  },
]

const lightModeFields: Layer[] = [
  {
    className: 'absolute inset-x-[-10%] top-[0%] h-[34%] blur-[132px]',
    style: {
      background:
        'radial-gradient(54% 78% at 18% 16%, rgba(124,58,237,0.18) 0%, transparent 74%), radial-gradient(42% 64% at 78% 20%, rgba(34,211,238,0.12) 0%, transparent 68%)',
    },
  },
  {
    className: 'absolute inset-x-[-10%] top-[42%] h-[30%] blur-[128px]',
    style: {
      background:
        'radial-gradient(48% 72% at 30% 26%, rgba(236,72,153,0.12) 0%, transparent 72%), radial-gradient(50% 76% at 74% 42%, rgba(124,58,237,0.14) 0%, transparent 72%)',
    },
  },
]

export default function AnimatedBackground({ position = 'fixed', className = '' }: Props) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  const rootPos = position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0'

  const dustPattern = useMemo(() => {
    const specks: Array<[number, number, number, string, number]> = [
      [4, 6, 1.2, '255,255,255', 0.08],
      [9, 12, 1.2, '167,139,250', 0.08],
      [16, 9, 1.4, '255,255,255', 0.1],
      [24, 16, 1.1, '34,211,238', 0.07],
      [31, 7, 1.2, '236,72,153', 0.07],
      [42, 14, 1.3, '255,255,255', 0.08],
      [55, 8, 1.1, '167,139,250', 0.08],
      [68, 12, 1.4, '34,211,238', 0.08],
      [78, 7, 1.2, '255,255,255', 0.08],
      [92, 11, 1.1, '236,72,153', 0.07],
      [7, 24, 1.0, '255,255,255', 0.07],
      [19, 28, 1.2, '167,139,250', 0.08],
      [28, 34, 1.1, '255,255,255', 0.07],
      [44, 30, 1.3, '34,211,238', 0.07],
      [57, 26, 1.1, '236,72,153', 0.07],
      [71, 33, 1.3, '255,255,255', 0.08],
      [83, 28, 1.1, '167,139,250', 0.07],
      [94, 35, 1.0, '255,255,255', 0.06],
      [6, 46, 1.2, '34,211,238', 0.06],
      [15, 52, 1.1, '255,255,255', 0.07],
      [29, 49, 1.4, '236,72,153', 0.07],
      [41, 56, 1.1, '255,255,255', 0.07],
      [52, 45, 1.2, '167,139,250', 0.08],
      [64, 54, 1.1, '34,211,238', 0.06],
      [76, 48, 1.3, '255,255,255', 0.08],
      [88, 57, 1.1, '236,72,153', 0.06],
      [10, 67, 1.0, '255,255,255', 0.06],
      [21, 72, 1.2, '167,139,250', 0.07],
      [34, 69, 1.3, '34,211,238', 0.06],
      [48, 78, 1.1, '255,255,255', 0.07],
      [59, 71, 1.0, '236,72,153', 0.06],
      [72, 76, 1.2, '255,255,255', 0.07],
      [86, 70, 1.1, '167,139,250', 0.07],
      [95, 82, 1.0, '34,211,238', 0.05],
      [8, 88, 1.2, '255,255,255', 0.06],
      [23, 94, 1.1, '236,72,153', 0.06],
      [39, 90, 1.2, '167,139,250', 0.07],
      [58, 96, 1.1, '255,255,255', 0.07],
      [73, 91, 1.3, '34,211,238', 0.06],
      [87, 95, 1.1, '255,255,255', 0.06],
    ]

    return specks
      .map(
        ([x, y, size, color, alpha]) =>
          `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(${color},${alpha}), transparent 68%)`
      )
      .join(', ')
  }, [])

  if (perfLow) {
    if (!isDark) {
      return (
        <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
          <div className="absolute inset-0 bg-[#f6f5ff]" />
          <div className="absolute inset-0 opacity-45" style={lightGridStyle} />
          {lightModeFields.map((layer, index) => (
            <div key={index} className={layer.className} style={layer.style} />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.24) 36%, rgba(245,243,255,0) 74%)',
              opacity: 0.58,
            }}
          />
        </div>
      )
    }

    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#03050d_0%,#070a16_34%,#050711_100%)]" />
        {atmosphereFields.map((layer, index) => (
          <div key={index} className={layer.className.replace(' ambient-drift', '').replace(' ambient-drift-reverse', '')} style={layer.style} />
        ))}
        <div className="absolute inset-0 opacity-[0.08]" style={darkGridStyle} />
        <div className="absolute inset-0 opacity-[0.035]" style={darkMeshStyle} />
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: dustPattern }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.034) 0%, transparent 12%), radial-gradient(circle at 50% 46%, transparent 0%, rgba(3,7,18,0.06) 34%, rgba(2,6,12,0.8) 100%)',
          }}
        />
      </div>
    )
  }

  if (!isDark) {
    return (
      <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
        <div className="absolute inset-0 bg-[#f6f5ff]" />
        <div className="absolute inset-0 opacity-50" style={lightGridStyle} />
        {lightModeFields.map((layer, index) => (
          <div key={index} className={layer.className} style={layer.style} />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.26) 36%, rgba(245,243,255,0) 74%)',
            opacity: 0.6,
          }}
        />
      </div>
    )
  }

  return (
    <div className={`${rootPos} pointer-events-none z-0 overflow-x-clip overflow-y-visible ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#03050d_0%,#070a16_34%,#050711_100%)]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% -8%, rgba(255,255,255,0.03) 0%, transparent 14%), linear-gradient(180deg, rgba(255,255,255,0.01), transparent 12%, transparent 88%, rgba(255,255,255,0.008))',
        }}
      />

      {atmosphereFields.map((layer, index) => (
        <div key={index} className={layer.className} style={layer.style} />
      ))}

      {lightRibbons.map((layer, index) => (
        <div key={`ribbon-${index}`} className={layer.className} style={layer.style} />
      ))}

      {ringFields.map((layer, index) => (
        <div key={`ring-${index}`} className={layer.className} style={layer.style} />
      ))}

      {sculptForms.map((layer, index) => (
        <div key={`sculpt-${index}`} className={layer.className} style={layer.style} />
      ))}

      {lightColumns.map((layer, index) => (
        <div key={`column-${index}`} className={layer.className} style={layer.style} />
      ))}

      <div className="absolute inset-0 opacity-[0.08]" style={darkGridStyle} />
      <div className="absolute inset-0 opacity-[0.035]" style={darkMeshStyle} />
      <div className="absolute inset-0 opacity-[0.016]" style={darkScanStyle} />
      <div className="absolute inset-0 opacity-[0.072]" style={{ backgroundImage: dustPattern }} />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(54% 42% at 22% 16%, rgba(124,58,237,0.14) 0%, transparent 72%), radial-gradient(42% 34% at 78% 18%, rgba(34,211,238,0.10) 0%, transparent 72%), radial-gradient(44% 34% at 52% 86%, rgba(236,72,153,0.09) 0%, transparent 74%)',
          mixBlendMode: 'screen',
          opacity: 0.72,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.034) 0%, transparent 12%), radial-gradient(circle at 50% 44%, transparent 0%, rgba(3,7,18,0.05) 34%, rgba(2,6,12,0.82) 100%)',
        }}
      />

      <div className="grain-overlay opacity-[0.045]" />
    </div>
  )
}
