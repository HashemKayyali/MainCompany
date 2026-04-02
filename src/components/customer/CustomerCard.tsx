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
      initial={perfLow ? { opacity: 0, y: 6 } : { opacity: 0, y: 10, filter: 'blur(10px)' }}
      whileInView={perfLow ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease }}
      className={`group relative overflow-hidden rounded-[18px] border p-3 ${
        isDark
          ? 'border-white/10 bg-[linear-gradient(180deg,rgba(12,15,31,0.8),rgba(8,10,20,0.72))]'
          : 'border-violet-200/70 bg-white/82'
      }`}
      style={{
        backdropFilter: perfLow ? undefined : 'blur(14px)',
        WebkitBackdropFilter: perfLow ? undefined : 'blur(14px)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_18%,transparent_72%,rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />

      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 24%, rgba(34,211,238,0.14), transparent 48%), radial-gradient(circle at 20% 78%, rgba(124,58,237,0.18), transparent 52%), radial-gradient(circle at 82% 76%, rgba(236,72,153,0.12), transparent 50%)'
            : 'radial-gradient(circle at 50% 30%, rgba(124,58,237,0.10), transparent 60%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-2">
        <div className={`text-[9px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-purple-100/46' : 'text-violet-600/70'}`}>
          Trusted Client
        </div>

        <motion.div
          whileHover={reduceMotion ? {} : { y: -2 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease }}
          className={`relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-[16px] border ${
            isDark
              ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]'
              : 'border-violet-200/70 bg-white'
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -18px 28px rgba(2,6,18,0.12)',
            }}
          />

          {imgOk ? (
            <FramedImage
              media={customer.logo}
              alt={customer.name}
              loading="lazy"
              className="h-[90%] w-[90%] transition-transform duration-500 group-hover:scale-105"
              fallbackTransform={{ fit: 'contain' }}
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${isDark ? 'bg-black/10' : 'bg-violet-50'}`}>
              <span className={`text-[12px] font-mono tracking-[0.18em] uppercase ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                {customer.name.slice(0, 2)}
              </span>
            </div>
          )}

          <motion.div
            className="absolute inset-y-0 -left-1/2 w-1/2 opacity-0 group-hover:opacity-80"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
              transform: 'skewX(-18deg)',
            }}
            animate={reduceMotion ? {} : { x: ['-120%', '260%'] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.3, ease, repeat: Infinity, repeatDelay: 1.2 }}
          />
        </motion.div>

        <div className="text-center">
          <div className={`text-[11px] font-semibold leading-tight ${isDark ? 'text-white/88' : 'text-gray-800'}`}>
            {customer.name}
          </div>
          <div className={`mt-0.5 text-[8px] uppercase tracking-[0.18em] ${isDark ? 'text-purple-100/40' : 'text-violet-600/60'}`}>
            Brand Partner
          </div>
        </div>
      </div>

      {/* Bottom neon line */}
      <div
        className="absolute bottom-3 left-4 right-4 h-px opacity-60"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.45), rgba(34,211,238,0.25), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)',
        }}
      />
    </motion.div>
  )
}
