import { useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'

const ITEMS = [
  'Abdali Hospital',
  'AMAZON',
  'Amman Academy',
  'AstraZeneca',
  'Birthdays',
  'City Mall',
  'Delmonte',
  'JU',
  'MR.BURRITOS',
  'Power Basketball',
  'PROTEINAK',
  'PSUT',
  'RIA',
  'Rotana Hotel',
  'Saray Aqaba',
  'SNA',
  'TAJ mall',
  'TRAX',
  'Umniah',
  'ZAIN',
]

// Accent palette (used for both text + dot)
const ACCENTS = [
  { text: 'text-purple-300', dot: 'bg-purple-400' },
  { text: 'text-cyan-300', dot: 'bg-cyan-400' },
  { text: 'text-pink-300', dot: 'bg-pink-400' },
  { text: 'text-amber-300', dot: 'bg-amber-400' },
  { text: 'text-lime-300', dot: 'bg-lime-400' },
]

export default function StatsStrip() {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  // Duplicate enough times so it always looks continuous on wide screens
  const loop = useMemo(() => {
    const base = ITEMS
    const repeated: string[] = []
    // 4x is usually enough for 4K widths
    for (let i = 0; i < 4; i++) repeated.push(...base)
    return repeated
  }, [])

  const edgeFade = isDark
    ? 'from-[#060613] via-[#060613]/70 to-transparent'
    : 'from-white via-white/75 to-transparent'

  return (
    <section
      className={`relative overflow-hidden border-y ${
        isDark ? 'border-white/10' : 'border-violet-200/50'
      }`}
    >
      {/* ✅ Slight glass background so it doesn't look "flat" */}
      <div
        className={`absolute inset-0 ${isDark ? 'bg-black/10' : 'bg-white/40'}`}
        style={{
          backdropFilter: perfLow ? undefined : 'blur(14px)',
          WebkitBackdropFilter: perfLow ? undefined : 'blur(14px)',
        }}
      />

      {/* ✅ Subtle top glow line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), rgba(34,211,238,0.22), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.20), transparent)',
        }}
      />

      {/* Track */}
      <div className="relative py-3 sm:py-4">
        <div className="stats-marquee">
          <div className="stats-marquee__inner">
            {loop.map((item, i) => {
              const a = ACCENTS[i % ACCENTS.length]
              return (
                <div key={`${item}-${i}`} className="flex items-center shrink-0 gap-3 px-5">
                  <span
                    className={`whitespace-nowrap uppercase tracking-[0.18em] font-display font-semibold ${
                      isDark ? a.text : 'text-violet-600'
                    } text-[11px] sm:text-[12px]`}
                  >
                    {item}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isDark ? a.dot : 'bg-violet-400'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ✅ Edge fades (clean cut + nicer) */}
      <div className={`pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r ${edgeFade}`} />
      <div
        className={`pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l ${edgeFade}`}
      />

      {/* ✅ CSS (self-contained) */}
      <style>{`
        .stats-marquee {
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-y;
        }

        .stats-marquee__inner {
          display: flex;
          width: max-content;
          animation: stats-marquee-scroll 28s linear infinite;
          will-change: transform;
        }

        /* Pause on hover (desktop only feels premium) */
        @media (hover: hover) {
          .stats-marquee:hover .stats-marquee__inner {
            animation-play-state: paused;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stats-marquee__inner {
            animation: none;
            transform: translateX(0);
          }
        }

        /* Extra safety for perf-low mode */
        html.perf-low .stats-marquee__inner {
          animation: none;
          transform: translateX(0);
        }

        @keyframes stats-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
