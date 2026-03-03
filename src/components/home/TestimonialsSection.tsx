import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { testimonials, type Testimonial } from '../../data/testimonials'

const ease = [0.16, 1, 0.3, 1] as const
const AUTO_INTERVAL = 5000

function QuoteIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
    </svg>
  )
}

function TestimonialCard({ t, isDark }: { t: Testimonial; isDark: boolean }) {
  const initial = (t.name?.trim()?.[0] || '?').toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease }}
      className={`relative rounded-2xl border p-6 sm:p-8 max-w-2xl mx-auto ${
        isDark
          ? 'bg-white/[0.03] border-white/10'
          : 'bg-white/70 border-violet-200/60 shadow-sm'
      }`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-50 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.12), transparent 55%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.08), transparent 50%)'
            : 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.05), transparent 55%)',
        }}
      />

      <div className="relative">
        {/* Quote icon */}
        <QuoteIcon
          className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-500/30' : 'text-violet-200'}`}
        />

        {/* Quote text */}
        <blockquote className={`text-base sm:text-lg leading-relaxed font-medium ${isDark ? 'text-purple-100/85' : 'text-gray-700'}`}>
          "{t.quote}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 mt-6">
          {/* Avatar */}
          {t.avatar ? (
            <img
              src={t.avatar}
              alt={t.name}
              loading="lazy"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold ${
                isDark
                  ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-white/80 border border-purple-500/25'
                  : 'bg-gradient-to-br from-violet-50 to-cyan-50 text-violet-700 border border-violet-200'
              }`}
            >
              {initial}
            </div>
          )}

          <div>
            <div className={`text-sm font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
              {t.name}
            </div>
            <div className={`text-[12px] ${isDark ? 'text-purple-200/55' : 'text-gray-500'}`}>
              {t.role}{t.company ? ` · ${t.company}` : ''}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  const next = useCallback(() => {
    setActive(i => (i + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setActive(i => (i - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-advance
  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(next, AUTO_INTERVAL)
    return () => clearInterval(timer)
  }, [next, reduceMotion])

  if (testimonials.length === 0) return null

  return (
    <section className="py-20 relative" aria-label="Customer testimonials">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.06), transparent 60%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.03), transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease }}
          className="text-center mb-12"
        >
          <span className="section-label">// Testimonials</span>
          <h2 className={`section-title ${!isDark ? 'text-gray-900' : ''}`}>
            What They <span className="text-glow">Say</span>
          </h2>
        </motion.div>

        {/* Card carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={testimonials[active].id}
              t={testimonials[active]}
              isDark={isDark}
            />
          </AnimatePresence>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              {/* Prev */}
              <button
                onClick={prev}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isDark
                    ? 'border-white/10 text-purple-200/60 hover:text-white hover:border-purple-500/30 bg-white/[0.03]'
                    : 'border-violet-200/60 text-gray-400 hover:text-gray-700 hover:border-violet-300 bg-white/60'
                }`}
                aria-label="Previous testimonial"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M8 2L3 7l5 5" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial navigation">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`transition-all rounded-full ${
                      i === active
                        ? `w-6 h-2 ${isDark ? 'bg-purple-400' : 'bg-violet-500'}`
                        : `w-2 h-2 ${isDark ? 'bg-purple-500/30 hover:bg-purple-500/50' : 'bg-violet-200 hover:bg-violet-300'}`
                    }`}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={next}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isDark
                    ? 'border-white/10 text-purple-200/60 hover:text-white hover:border-purple-500/30 bg-white/[0.03]'
                    : 'border-violet-200/60 text-gray-400 hover:text-gray-700 hover:border-violet-300 bg-white/60'
                }`}
                aria-label="Next testimonial"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 2l5 5-5 5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
