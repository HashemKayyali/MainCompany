import { useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useCustomersData } from '../../contexts/DataContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePerfMode } from '../../hooks/usePerfMode'

const FALLBACK = [
  'Abdali Hospital', 'AMAZON', 'Amman Academy', 'AstraZeneca', 'City Mall',
  'Delmonte', 'JU', 'PROTEINAK', 'PSUT', 'Rotana Hotel', 'TAJ mall',
  'TRAX', 'Umniah', 'ZAIN',
]

const ACCENTS = [
  { text: 'text-violet-300', dot: 'bg-violet-400' },
  { text: 'text-cyan-300', dot: 'bg-cyan-400' },
  { text: 'text-pink-300', dot: 'bg-pink-400' },
  { text: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
  { text: 'text-sky-300', dot: 'bg-sky-400' },
]

export default function StatsStrip() {
  const { isDark } = useTheme()
  const { customers } = useCustomersData()
  const { perfLow } = usePerfMode()
  const compactViewport = useMediaQuery('(max-width: 1023px)')

  const names = useMemo(() => {
    if (customers.length > 0) return customers.map(c => c.name)
    return FALLBACK
  }, [customers])

  const staticItems = useMemo(() => names.slice(0, 8), [names])

  const loop = useMemo(() => {
    const repeated: string[] = []
    for (let i = 0; i < 2; i++) repeated.push(...names)
    return repeated
  }, [names])

  const useStaticStrip = perfLow || compactViewport || names.length < 6

  return (
    <section
      className="relative"
      aria-label="Our partners and customers"
    >
      {/* Top separator — subtle only in light mode, invisible in dark to avoid hard divider */}
      {!isDark && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.08), transparent)' }}
        />
      )}

      <div className="py-7 sm:py-8">
        <div className="site-container">
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Left label */}
            <div className="hidden shrink-0 sm:block">
              <div className={`text-[9.5px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-300/48' : 'text-violet-600/60'}`}>
                Trusted by
              </div>
              <div className={`mt-1 text-[12.5px] font-semibold ${isDark ? 'text-white/62' : 'text-gray-800'}`}>
                Top brands & teams
              </div>
            </div>

            {/* Divider */}
            <div className={`hidden h-10 w-px shrink-0 sm:block ${isDark ? 'bg-white/8' : 'bg-violet-200/60'}`} />

            {/* Marquee */}
            {useStaticStrip ? (
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                  {staticItems.map((item, i) => {
                    const accent = ACCENTS[i % ACCENTS.length]
                    return (
                      <div key={item} className="flex items-center gap-2.5">
                        <span className={`whitespace-nowrap font-display text-[10.5px] font-semibold uppercase tracking-[0.18em] ${isDark ? accent.text : 'text-violet-600'}`}>
                          {item}
                        </span>
                        <span className={`h-1 w-1 shrink-0 rounded-full ${isDark ? accent.dot : 'bg-violet-400/60'}`} aria-hidden="true" />
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div
                className="stats-marquee min-w-0 flex-1"
                style={{
                  maskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
                  WebkitMaskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
                }}
              >
                <div className="stats-marquee__inner">
                  {loop.map((item, i) => {
                    const a = ACCENTS[i % ACCENTS.length]
                    return (
                      <div key={`${item}-${i}`} className="flex shrink-0 items-center gap-3 px-4">
                        <span className={`whitespace-nowrap font-display text-[10.5px] font-semibold uppercase tracking-[0.18em] ${isDark ? a.text : 'text-violet-600'}`}>
                          {item}
                        </span>
                        <span className={`h-1 w-1 shrink-0 rounded-full ${isDark ? a.dot : 'bg-violet-400/60'}`} aria-hidden="true" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom separator — subtle only in light mode */}
      {!isDark && (
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.07), transparent)' }}
        />
      )}
    </section>
  )
}
