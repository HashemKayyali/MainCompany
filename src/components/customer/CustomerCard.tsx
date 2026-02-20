import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import { usePerfMode } from '../../hooks/usePerfMode'

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
      className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col items-center gap-4 ${
        isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-violet-200/60'
      }`}
      style={{
        backdropFilter: perfLow ? undefined : 'blur(16px)',
        WebkitBackdropFilter: perfLow ? undefined : 'blur(16px)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 30%, rgba(34,211,238,0.16), transparent 55%), radial-gradient(circle at 20% 80%, rgba(124,58,237,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.12), transparent 55%)'
            : 'radial-gradient(circle at 50% 30%, rgba(124,58,237,0.10), transparent 60%)',
        }}
      />

      {/* Logo frame */}
      <motion.div
        whileHover={reduceMotion ? {} : { y: -2 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease }}
        className={`relative w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white border ${
          isDark ? 'border-purple-500/25' : 'border-gray-100'
        }`}
      >
        {/* subtle inner shadow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -18px 24px rgba(0,0,0,0.06)',
          }}
        />

        {imgOk ? (
          <img
            src={customer.logo}
            alt={customer.name}
            loading="lazy"
            className="w-[95%] h-[95%] object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-black/10' : 'bg-violet-50'}`}>
            <span className={`text-[12px] font-mono tracking-[0.18em] uppercase ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              {customer.name.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Shine sweep */}
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

      {/* Name */}
      <div className="text-center">
        <div className={`text-[13px] font-semibold leading-tight ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
          {customer.name}
        </div>
       
      </div>

      {/* Bottom neon line */}
      <div
        className="absolute left-6 right-6 bottom-4 h-px opacity-60"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.45), rgba(34,211,238,0.25), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)',
        }}
      />
    </motion.div>
  )
}
