import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { events, type BLEvent } from '../../data/events'

const ease = [0.16, 1, 0.3, 1] as const

function EventCard({ event, index, isDark }: { event: BLEvent; index: number; isDark: boolean }) {
  const reduceMotion = useReducedMotion()

  const date = new Date(event.date)
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()
  const isPast = date < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: index * 0.08, ease }}
      className={`group relative rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${
        isDark
          ? 'bg-white/[0.03] border-white/10 hover:border-purple-500/30'
          : 'bg-white/70 border-violet-200/60 hover:border-violet-300 shadow-sm'
      } ${isPast ? 'opacity-60' : ''}`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.18), transparent 55%)'
            : 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.08), transparent 55%)',
        }}
      />

      <div className="relative flex items-start gap-3">
        {/* Date block */}
        <div
          className={`flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl border ${
            isDark
              ? 'bg-purple-500/10 border-purple-500/20'
              : 'bg-violet-50 border-violet-100'
          }`}
        >
          <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isDark ? 'text-cyan-400' : 'text-violet-500'}`}>
            {month}
          </span>
          <span className={`text-lg font-display font-extrabold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {day}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
            {event.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`shrink-0 ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
              <path d="M6 1C3.8 1 2 2.8 2 5c0 2.7 3.2 5.5 3.7 5.9a.5.5 0 00.6 0C6.8 10.5 10 7.7 10 5c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="6" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className={`text-[12px] truncate ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
              {event.location}
            </span>
          </div>

          {/* Status badge */}
          {isPast ? (
            <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400'
            }`}>
              Completed
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Upcoming
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function UpcomingEventsStrip() {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()

  // Sort: upcoming first (nearest date), then past (most recent)
  const sorted = useMemo(() => {
    const now = new Date()
    const upcoming = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const past = events
      .filter(e => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return [...upcoming, ...past]
  }, [])

  if (sorted.length === 0) return null

  return (
    <section className="site-section" aria-label="Upcoming events">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease }}
          className="mb-9 text-center"
        >
          <span className="section-label">// Upcoming</span>
          <h2 className={`section-title ${!isDark ? 'text-gray-900' : ''}`}>
            Next <span className="text-glow">Events</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 6).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  )
}
