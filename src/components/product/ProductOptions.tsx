import { useTheme } from '../../contexts/ThemeContext'
import type { QuickOption } from '../../data/products/types'
import { cn } from '../../utils/cn'

export default function ProductOptions({ options }: { options: QuickOption[] }) {
  const { isDark } = useTheme()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map(option => (
        <div
          key={option.label}
          className={cn(
            'rounded-[14px] border p-3.5',
            isDark
              ? 'border-white/[0.07] bg-white/[0.03]'
              : 'border-slate-200/80 bg-white/80 shadow-[0_4px_16px_-12px_rgba(15,23,42,0.25)]'
          )}
        >
          <div
            className={cn(
              'mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]',
              isDark ? 'text-violet-300/90' : 'text-violet-600'
            )}
          >
            <span className={cn('h-1 w-1 rounded-full', isDark ? 'bg-violet-400' : 'bg-violet-500')} />
            {option.label}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {option.values.map(value => (
              <span
                key={value}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12px] font-semibold',
                  isDark
                    ? 'border-violet-400/[0.16] bg-violet-500/[0.08] text-slate-200'
                    : 'border-violet-200/70 bg-violet-50/80 text-violet-900'
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
