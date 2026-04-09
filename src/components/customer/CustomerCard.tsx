import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import { usePerfMode } from '../../hooks/usePerfMode'
import FramedImage from '../ui/FramedImage'

const ease = [0.16, 1, 0.3, 1] as const

export default function CustomerCard({ customer }: { customer: Customer }) {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()
  const { perfLow } = usePerfMode()
  const [imgOk, setImgOk] = useState(true)

  return (
    <motion.div
      initial={perfLow ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(5px)' }}
      whileInView={perfLow ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease }}
      className={`group relative flex aspect-[3/2] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border transition-all duration-450 ${
        !reduceMotion ? 'hover:-translate-y-1.5' : ''
      } ${
        isDark
          ? 'border-white/[0.07] bg-[linear-gradient(165deg,rgba(15,12,32,0.80)_0%,rgba(10,8,24,0.65)_100%)] hover:border-violet-400/[0.20] hover:bg-[linear-gradient(165deg,rgba(20,16,44,0.88)_0%,rgba(12,10,28,0.72)_100%)]'
          : 'border-violet-100/70 bg-white hover:border-violet-200 hover:shadow-[0_16px_44px_-14px_rgba(124,58,237,0.18)]'
      }`}
      style={
        isDark
          ? {
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 42px -16px rgba(0,0,0,0.52)',
              backdropFilter: perfLow ? undefined : 'blur(20px)',
              WebkitBackdropFilter: perfLow ? undefined : 'blur(20px)',
            }
          : { boxShadow: '0 2px 14px rgba(0,0,0,0.04)' }
      }
    >
      {/* Top shimmer on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.55) 50%, transparent 90%)',
        }}
      />

      {/* Radial glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 10%, rgba(124,58,237,0.14) 0%, transparent 65%)'
            : 'radial-gradient(circle at 50% 10%, rgba(124,58,237,0.06) 0%, transparent 65%)',
        }}
      />

      {/* ── Logo area — no white box ── */}
      <div
        className={`relative mx-auto flex h-[52%] w-[68%] items-center justify-center rounded-[12px] p-3 transition-transform duration-450 group-hover:scale-[1.06] ${
          !imgOk
            ? isDark ? 'bg-white/[0.04]' : 'bg-violet-50'
            : ''
        }`}
      >
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            loading="lazy"
            className={`h-full w-full object-contain transition-all duration-450 ${
              isDark
                ? 'opacity-88 group-hover:opacity-100'
                : 'opacity-80 mix-blend-multiply group-hover:opacity-100'
            }`}
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span
            className={`font-display text-[1rem] font-bold uppercase tracking-widest ${
              isDark ? 'text-white/25' : 'text-gray-400'
            }`}
          >
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Company name */}
      <div
        className={`absolute inset-x-3 bottom-3 text-center text-[11px] font-semibold tracking-[0.025em] transition-all duration-450 ${
          isDark
            ? 'text-white/40 group-hover:-translate-y-0.5 group-hover:text-white/75'
            : 'text-violet-900/50 group-hover:-translate-y-0.5 group-hover:text-violet-900/80'
        }`}
      >
        {customer.name}
      </div>
    </motion.div>
  )
}
