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
      initial={perfLow ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
      whileInView={perfLow ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease }}
      className={`group relative flex aspect-[3/2] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border transition-all duration-450 ${
        !reduceMotion ? 'hover:-translate-y-1.5' : ''
      } ${
        isDark
          ? 'border-white/[0.07] bg-[linear-gradient(165deg,rgba(18,14,38,0.72)_0%,rgba(10,8,24,0.5)_100%)] hover:border-violet-400/[0.18] hover:bg-[linear-gradient(165deg,rgba(22,18,46,0.82)_0%,rgba(12,10,28,0.62)_100%)]'
          : 'border-violet-100/80 bg-white hover:border-violet-200 hover:shadow-[0_14px_40px_-12px_rgba(124,58,237,0.18)]'
      }`}
      style={
        isDark
          ? {
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 44px -16px rgba(0,0,0,0.55)',
              backdropFilter: perfLow ? undefined : 'blur(18px)',
              WebkitBackdropFilter: perfLow ? undefined : 'blur(18px)',
            }
          : { boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }
      }
    >
      {/* Top shimmer on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.55) 50%, transparent 90%)' }}
      />

      {/* Radial glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Logo area */}
      <div
        className={`relative mx-auto flex h-[52%] w-[66%] items-center justify-center rounded-[13px] p-3 transition-transform duration-450 group-hover:scale-[1.06] ${
          imgOk && isDark ? 'bg-[#f6f7fa] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]' : ''
        } ${
          !imgOk ? (isDark ? 'rounded-[14px] bg-white/[0.04]' : 'rounded-[14px] bg-violet-50') : ''
        }`}
      >
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            loading="lazy"
            className={`h-full w-full object-contain transition-all duration-450 ${
              isDark
                ? 'opacity-82 mix-blend-multiply group-hover:opacity-100'
                : 'opacity-82 drop-shadow-sm group-hover:opacity-100'
            }`}
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className={`font-display text-[1rem] font-bold uppercase tracking-widest ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Company name */}
      <div
        className={`absolute inset-x-3 bottom-3 text-center text-[11.5px] font-semibold tracking-[0.02em] transition-all duration-450 ${
          isDark
            ? 'text-white/45 group-hover:-translate-y-0.5 group-hover:text-white/80'
            : 'text-violet-900/50 group-hover:-translate-y-0.5 group-hover:text-violet-900/80'
        }`}
      >
        {customer.name}
      </div>
    </motion.div>
  )
}
