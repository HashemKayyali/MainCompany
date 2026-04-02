import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import ProductCard from '../product/ProductCard'

const ease = [0.16, 1, 0.3, 1] as const

export default function FeaturedProducts() {
  const { featuredProducts } = useData()
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()

  const items = useMemo(() => featuredProducts ?? [], [featuredProducts])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.07, delayChildren: 0.06 },
    },
  } as const

  const item = {
    hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
    show: reduceMotion
      ? { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0 } }
      : { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
  } as const

  return (
    <section className="site-section relative overflow-hidden">
      {/* Arcade/VR background layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[800px] rounded-full opacity-90"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.10) 35%, transparent 70%)'
              : 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.10) 0%, transparent 70%)',
          }}
        />
        {/* Neon grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
              : 'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'radial-gradient(circle at 50% 20%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 20%, black 0%, transparent 70%)',
          }}
        />
        {/* CSS scan line instead of motion.div */}
        <div
          className="scan-line opacity-60"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.32), rgba(236,72,153,0.22), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)',
          }}
        />
      </div>

      <div className="site-container relative">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="section-label">// Products</span>
              <motion.span
                className={`text-[9px] font-mono tracking-[0.16em] uppercase ${
                  isDark ? 'text-cyan-300/70' : 'text-violet-600/70'
                }`}
                animate={reduceMotion ? {} : { opacity: [0.35, 0.85, 0.35] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                arcade • vr • led
              </motion.span>
            </div>

            <h2 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
              What We <span className="text-glow">Build</span>
            </h2>

            {/* Underline glow */}
            <div className="relative mt-2.5 h-px w-[168px] overflow-hidden">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.55), rgba(34,211,238,0.28), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.28), transparent)',
                }}
              />
              <motion.div
                className="absolute inset-y-0 w-1/3"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                }}
                animate={reduceMotion ? {} : { x: ['-40%', '140%'] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="flex items-center gap-2.5"
          >
            {/* Floating chips */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[
                { t: 'LED', c: isDark ? 'text-cyan-200 border-cyan-400/25' : 'text-violet-700 border-violet-200' },
                { t: 'VR', c: isDark ? 'text-purple-200 border-purple-500/25' : 'text-violet-700 border-violet-200' },
                { t: 'ARCADE', c: isDark ? 'text-pink-200 border-pink-400/25' : 'text-violet-700 border-violet-200' },
              ].map((x, idx) => (
                <motion.div
                  key={x.t}
                  className={`rounded-[16px] border bg-white/[0.04] px-2.25 py-1.25 text-[8.5px] font-mono uppercase tracking-[0.15em] backdrop-blur-2xl ${x.c}`}
                  animate={reduceMotion ? {} : { y: [0, -6, 0] }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 4 + idx, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {x.t}
                </motion.div>
              ))}
            </div>

            <Link to="/products" className="btn-outline group !rounded-full !px-3.5 !py-1.75 !text-[10.5px]">
              <span>All Products</span>
              <motion.svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={reduceMotion ? {} : { x: [0, 4, 0] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M5 8h6M8 5l3 3-3 3" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>

        {/* Products grid (stagger) */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5"
        >
          {items.map((p, i) => (
            <motion.div key={p.slug} variants={item} className="h-full">
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="mt-6 flex items-center justify-center"
        >
          <div
            className={`rounded-[16px] border px-3.5 py-2 text-[9px] font-mono uppercase tracking-[0.12em] backdrop-blur-2xl ${
              isDark ? 'bg-white/[0.04] border-white/10 text-white/65' : 'bg-white/60 border-violet-200/60 text-gray-600'
            }`}
          >
            Tap a product to view details • built for events
          </div>
        </motion.div>
      </div>
    </section>
  )
}

