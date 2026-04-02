import { useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { usePerfMode } from '../../hooks/usePerfMode'
import { useData } from '../../contexts/DataContext'

// Fallback names if no customers loaded yet
const FALLBACK = [
  'Abdali Hospital', 'AMAZON', 'Amman Academy', 'AstraZeneca', 'City Mall',
  'Delmonte', 'JU', 'PROTEINAK', 'PSUT', 'Rotana Hotel', 'TAJ mall',
  'TRAX', 'Umniah', 'ZAIN',
]

// Accent palette (used for both text + dot)
const ACCENTS = [
  { text: 'text-purple-300', dot: 'bg-purple-400' },
  { text: 'text-cyan-300', dot: 'bg-cyan-400' },
  { text: 'text-pink-300', dot: 'bg-pink-400' },
  { text: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
  { text: 'text-sky-300', dot: 'bg-sky-400' },
]

export default function StatsStrip() {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()
  const { customers } = useData()

  // Use customer names from DB, fallback to hardcoded list
  const names = useMemo(() => {
    if (customers.length > 0) return customers.map(c => c.name)
    return FALLBACK
  }, [customers])

  // Duplicate enough times so it always looks continuous on wide screens
  const loop = useMemo(() => {
    const repeated: string[] = []
    for (let i = 0; i < 4; i++) repeated.push(...names)
    return repeated
  }, [names])

  const edgeFade = isDark
    ? 'from-[#060613] via-[#060613]/70 to-transparent'
    : 'from-white via-white/75 to-transparent'

  return (
    <section className="relative px-4 pt-3 sm:px-5" aria-label="Our partners and customers">
      <div className="mx-auto max-w-[82rem]">
        <div className={`section-shell ${isDark ? '' : 'bg-white/85'}`}>
          <div
            className={`absolute inset-0 ${isDark ? 'bg-black/10' : 'bg-white/40'}`}
            style={{
              backdropFilter: perfLow ? undefined : 'blur(14px)',
              WebkitBackdropFilter: perfLow ? undefined : 'blur(14px)',
            }}
          />

          <div
            className="absolute inset-x-0 top-0 h-px opacity-90"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.45), rgba(236,72,153,0.28), rgba(34,211,238,0.24), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.20), transparent)',
            }}
          />

          <div className="relative flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <div className="hidden min-w-fit lg:block">
              <div className={`text-[10px] font-mono uppercase tracking-[0.28em] ${isDark ? 'text-violet-200/56' : 'text-violet-600/70'}`}>
                Trusted by
              </div>
              <div className={`mt-1 text-[13px] font-semibold ${isDark ? 'text-white/86' : 'text-gray-900'}`}>
                Leading brands and event teams
              </div>
            </div>

            <div className={`h-10 w-px shrink-0 ${isDark ? 'bg-white/8' : 'bg-violet-200/70'} hidden lg:block`} />

            <div className="stats-marquee flex-1">
              <div className="stats-marquee__inner">
                {loop.map((item, i) => {
                  const a = ACCENTS[i % ACCENTS.length]
                  return (
                    <div key={`${item}-${i}`} className="flex items-center shrink-0 gap-2.5 px-4">
                      <span
                        className={`whitespace-nowrap uppercase tracking-[0.18em] font-display font-semibold ${
                          isDark ? a.text : 'text-violet-600'
                        } text-[10px] sm:text-[11px]`}
                      >
                        {item}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isDark ? a.dot : 'bg-violet-400'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute left-4 top-4 w-16 bg-gradient-to-r ${edgeFade}`}
        style={{ height: 'calc(100% - 1rem)' }}
      />
      <div
        className={`pointer-events-none absolute right-4 top-4 w-16 bg-gradient-to-l ${edgeFade}`}
        style={{ height: 'calc(100% - 1rem)' }}
      />
    </section>
  )
}
