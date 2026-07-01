import { memo, useState } from 'react'
import type { Customer } from '../../data/customers'
import { usePerfMode } from '../../hooks/usePerfMode'
import FramedImage from '../ui/FramedImage'
import { cn } from '../../utils/cn'

/**
 * Partner logo card for the /customers page. Matches the site "Redesign"
 * theme: a soft violet→fuchsia logo well on a clean white card with a
 * violet hover ring, name, and category caption.
 */
const CustomerCard = memo(function CustomerCard({ customer }: { customer: Customer }) {
  const { perfLow } = usePerfMode()
  const [imgOk, setImgOk] = useState(true)

  return (
    <div
      className={cn(
        'group relative flex h-full min-h-[162px] flex-col overflow-hidden rounded-[22px] border border-violet-200/70 bg-white p-3.5 transition-all duration-400 sm:min-h-[178px] sm:p-4',
        !perfLow && 'hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_28px_56px_-30px_rgba(89,23,196,0.42)]'
      )}
      style={{ boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 14px 34px -24px rgba(89,23,196,0.18)' }}
    >
      {/* Violet hover ring */}
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(168,85,247,0.5)' }}
        aria-hidden="true"
      />

      {/* Logo well */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/60 p-4">
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 60% at 50% 35%, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {imgOk ? (
          <FramedImage
            media={customer.logo}
            alt={customer.name}
            width={320}
            height={180}
            loading="lazy"
            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 190px"
            fallbackTransform={{ fit: 'contain' }}
            onError={() => setImgOk(false)}
            className="relative h-full max-h-[3.75rem] w-auto max-w-[84%] object-contain opacity-90 mix-blend-multiply transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:opacity-100 sm:max-h-16"
          />
        ) : (
          <span className="relative font-sans text-[1.1rem] font-black uppercase tracking-widest text-violet-300">
            {customer.name.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 min-w-0 text-center">
        <div
          className="truncate font-sans text-[0.9rem] font-bold leading-tight tracking-[-0.02em] text-ink-900 transition-colors duration-300 group-hover:text-violet-900 sm:text-[0.98rem]"
          title={customer.name}
        >
          {customer.name}
        </div>
        {customer.category && (
          <div
            className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-violet-500 sm:text-[9.5px]"
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
