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
      initial={perfLow ? { opacity: 0, y: 6 } : { opacity: 0, y: 16, filter: 'blur(8px)' }}
      whileInView={perfLow ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease }}
      className={`group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border transition-all duration-500 sm:aspect-[3/2] ${
        !reduceMotion ? 'hover:-translate-y-1.5' : ''
      } ${
        isDark
          ? 'border-white/[0.06] bg-[linear-gradient(165deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.01)_100%)] hover:border-white/[0.12] hover:bg-[linear-gradient(165deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.015)_100%)]'
          : 'border-violet-100 bg-white hover:border-violet-200 hover:shadow-[0_12px_40px_-12px_rgba(124,58,237,0.15)]'
      }`}
      style={{
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 48px -12px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.03)',
        backdropFilter: perfLow ? undefined : 'blur(20px)',
        WebkitBackdropFilter: perfLow ? undefined : 'blur(20px)',
      }}
    >
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 50% 0%, rgba(167,139,250,0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 60%)'
        }}
      />

      <div className={`relative flex h-[55%] w-[70%] shrink-0 items-center justify-center rounded-[12px] p-2.5 transition-transform duration-500 group-hover:scale-[1.05] ${
        imgOk && isDark ? 'bg-[#f8f9fa] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]' : ''
      } ${
        !imgOk && (isDark ? 'rounded-[14px] bg-white/[0.03]' : 'rounded-[14px] bg-violet-50')
      }`}>
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            loading="lazy"
            className={`h-full w-full object-contain ${
              isDark ? 'opacity-85 mix-blend-multiply transition-all duration-500 group-hover:opacity-100' : 'opacity-85 transition-all duration-500 group-hover:opacity-100 drop-shadow-sm'
            }`}
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className={`text-base font-mono tracking-widest uppercase ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      <div className={`absolute bottom-4 left-4 right-4 text-center text-[12px] font-bold tracking-wide transition-all duration-500 sm:bottom-5 ${
        isDark ? 'text-purple-100/60 group-hover:-translate-y-0.5 group-hover:text-white' 
               : 'text-violet-900/60 group-hover:-translate-y-0.5 group-hover:text-violet-900'
      }`}>
        {customer.name}
      </div>
    </motion.div>
  )
}
