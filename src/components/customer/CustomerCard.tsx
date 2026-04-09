import { memo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import { usePerfMode } from '../../hooks/usePerfMode'
import FramedImage from '../ui/FramedImage'

const CustomerCard = memo(function CustomerCard({ customer }: { customer: Customer }) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()
  const [imgOk, setImgOk] = useState(true)

  return (
    <div
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-[16px] border p-4 transition-all duration-300 ${
        !perfLow ? 'hover:-translate-y-0.5' : ''
      } ${
        isDark
          ? 'border-white/[0.06] bg-white/[0.02] hover:border-violet-400/[0.16] hover:bg-white/[0.04]'
          : 'border-violet-100/60 bg-white/70 hover:border-violet-200/80 hover:bg-white hover:shadow-[0_8px_28px_rgba(124,58,237,0.10)]'
      }`}
      style={
        isDark
          ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }
          : undefined
      }
    >
      {/* Hover shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent 15%, rgba(139,92,246,0.45) 50%, transparent 85%)',
        }}
      />

      {/* Logo area */}
      <div className="flex h-12 w-full items-center justify-center">
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            loading="lazy"
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 160px"
            className={`h-full max-h-10 w-auto max-w-[80%] object-contain transition-all duration-300 ${
              isDark
                ? 'opacity-60 group-hover:opacity-90'
                : 'opacity-55 mix-blend-multiply group-hover:opacity-80'
            }`}
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span
            className={`font-display text-[0.88rem] font-bold uppercase tracking-widest ${
              isDark ? 'text-white/22' : 'text-gray-400'
            }`}
          >
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Name */}
      <div
        className={`mt-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] transition-all duration-300 ${
          isDark
            ? 'text-white/28 group-hover:text-white/55'
            : 'text-gray-400/80 group-hover:text-gray-600'
        }`}
      >
        {customer.name}
      </div>
    </div>
  )
})

export default CustomerCard
