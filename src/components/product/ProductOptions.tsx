import { useTheme } from '../../contexts/ThemeContext'
import type { QuickOption } from '../../data/products/types'
import { cn } from '../../utils/cn'

export default function ProductOptions({ options }: { options: QuickOption[] }) {
  const { isDark } = useTheme()

  return (
    <div className={cn('divide-y', isDark ? 'divide-white/[0.07]' : 'divide-slate-200/80')}>
      {options.map(option => (
        <div key={option.label} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[140px_1fr] sm:gap-5">
          <div className={cn('text-[11px] font-bold uppercase tracking-[0.16em]', isDark ? 'text-slate-500' : 'text-slate-400')}>
            {option.label}
          </div>
          <div className="flex flex-wrap gap-2">
            {option.values.map(value => (
              <span
                key={value}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] font-semibold',
                  isDark
                    ? 'border-white/[0.08] bg-white/[0.04] text-slate-300'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
