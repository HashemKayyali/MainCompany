import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useCustomersData } from '../../contexts/DataContext'
import { useReveal } from '../../hooks/useReveal'

const FALLBACK = [
  'Abdali Hospital', 'AMAZON', 'Amman Academy', 'AstraZeneca', 'City Mall',
  'Delmonte', 'JU', 'PROTEINAK', 'PSUT', 'Rotana Hotel', 'TAJ mall',
  'TRAX', 'Umniah', 'ZAIN',
]

export default function StatsStrip() {
  const { customers } = useCustomersData()
  const stripReveal = useReveal({ distance: 12, duration: 0.32, margin: '0px 0px 18% 0px' })

  const names = useMemo(() => {
    if (customers.length > 0) return customers.map(c => c.name)
    return FALLBACK
  }, [customers])

  const loop = useMemo(() => {
    const repeated: string[] = []
    for (let i = 0; i < 2; i++) repeated.push(...names)
    return repeated
  }, [names])

  return (
    <section className="relative" aria-label="Our partners and customers">
      {/* Top separator */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)' }}
      />

      <div className="relative py-8 sm:py-10">
        {/* Soft glow behind strip */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(168,85,247,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="site-container">
          <motion.div {...stripReveal} className="flex items-center gap-3 sm:gap-6">

            {/* Left label */}
            <div className="shrink-0">
              <div className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-violet-600/75 sm:text-[9.5px] sm:tracking-[0.24em]">
                Trusted by
              </div>
              <div className="mt-1 text-[10.75px] font-semibold sm:text-[12.5px]" style={{ color: '#1a0b3d' }}>
                Top brands &amp; teams
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-8 w-px shrink-0 sm:h-10"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.32), transparent)' }}
            />

            {/* Marquee */}
            <div
              className="stats-marquee min-w-0 flex-1"
              style={{
                maskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
              }}
            >
              <div className="stats-marquee__inner">
                {loop.map((item, i) => (
                  <div key={`${item}-${i}`} className="flex shrink-0 items-center gap-3 px-4">
                    <span className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700 sm:text-[10.5px] sm:tracking-[0.18em]">
                      {item}
                    </span>
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/55"
                      style={{ boxShadow: '0 0 6px rgba(168,85,247,0.55)' }}
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom separator */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)' }}
      />
    </section>
  )
}
