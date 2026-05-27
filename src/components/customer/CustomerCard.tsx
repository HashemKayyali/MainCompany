import { memo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import { usePerfMode } from '../../hooks/usePerfMode'
import FramedImage from '../ui/FramedImage'
import { cn } from '../../utils/cn'
import { useSpotlight, SpotlightOverlay } from '../ui/spotlight-card'

const CustomerCard = memo(function CustomerCard({ customer }: { customer: Customer }) {
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()
  const [imgOk, setImgOk] = useState(true)
  const spotlight = useSpotlight()

  return (
    <div
      {...spotlight.handlers}
      className={cn(
        'group relative flex min-h-[154px] w-full min-w-0 flex-col overflow-hidden rounded-[22px] border p-3.5 transition-[border-color,box-shadow,transform] duration-300 sm:min-h-[166px] sm:p-4',
        !perfLow && 'hover:-translate-y-0.5',
        isDark
          ? 'border-white/[0.10] bg-white/[0.03] shadow-[0_20px_48px_-28px_rgba(0,0,0,0.66),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.18] hover:bg-white/[0.05] hover:shadow-[0_26px_58px_-28px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'border-black/[0.12] bg-white shadow-[0_22px_54px_-34px_rgba(15,23,42,0.42),0_8px_20px_-16px_rgba(15,23,42,0.20),0_0_0_1px_rgba(255,255,255,0.88)] hover:border-black/[0.22] hover:shadow-[0_28px_62px_-32px_rgba(15,23,42,0.44),0_10px_24px_-16px_rgba(15,23,42,0.24),0_0_0_1px_rgba(255,255,255,0.92)]'
      )}
    >
      {!perfLow && <SpotlightOverlay ref={spotlight.overlayRef} color="rgba(124,58,237,0.08)" size={180} />}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(168,85,247,0.58) 50%, transparent 90%)',
        }}
      />

      <div
        className={cn(
          'relative flex h-20 w-full min-w-0 items-center justify-center overflow-hidden rounded-[16px] border sm:h-24',
          isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-slate-100 bg-slate-50/70'
        )}
      >
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            loading="lazy"
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 190px"
            className={cn(
              'h-full max-h-14 w-auto max-w-[84%] object-contain transition-all duration-300 sm:max-h-16',
              isDark
                ? 'opacity-72 group-hover:opacity-95'
                : 'opacity-80 mix-blend-multiply group-hover:opacity-100'
            )}
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span
            className={cn(
              'font-display text-[1rem] font-bold uppercase tracking-widest',
              isDark ? 'text-white/28' : 'text-slate-400'
            )}
          >
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="mt-3 min-w-0 text-center">
        <div
          className={cn(
            'truncate font-display text-[0.86rem] font-bold leading-tight tracking-[-0.025em] transition-colors duration-300 sm:text-[0.95rem]',
            isDark ? 'text-white/82 group-hover:text-white' : 'text-slate-900 group-hover:text-violet-900'
          )}
          title={customer.name}
        >
          {customer.name}
        </div>
        {customer.category && (
          <div
            className={cn(
              'mt-1.5 truncate text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[9.5px]',
              isDark ? 'text-violet-300/72' : 'text-violet-700/78'
            )}
            title={customer.category}
          >
            {customer.category}
          </div>
        )}
      </div>
    </div>
  )
})

export default CustomerCard
