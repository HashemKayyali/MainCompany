import type { AdminCardView } from './useAdminCardView'
import { cn } from '../../utils/cn'

interface AdminViewToggleProps {
  value: AdminCardView
  onChange: (value: AdminCardView) => void
}

// Clean segmented control (light-only). Active = white pill on a soft
// violet track; inactive = muted ink.
export default function AdminViewToggle({ value, onChange }: AdminViewToggleProps) {
  const options: Array<{ value: AdminCardView; label: string; short: string }> = [
    { value: 'grid', label: 'Adaptive Grid', short: 'Grid' },
    { value: 'list', label: 'List View', short: 'List' },
  ]

  return (
    <div
      className="inline-flex items-center gap-1 rounded-[14px] border border-violet-200 bg-violet-50/60 p-1"
      aria-label="Card layout"
    >
      {options.map(option => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.label}
            className={cn(
              'inline-flex min-h-[36px] min-w-[78px] items-center justify-center rounded-[11px] px-3.5 text-[11.5px] font-bold transition active:translate-y-[1px]',
              active
                ? 'border border-violet-200 bg-white text-[#1a0b3d] shadow-[0_4px_14px_-6px_rgba(89,23,196,0.30)]'
                : 'text-[#6b5a82] hover:text-[#1a0b3d]'
            )}
          >
            {option.short}
          </button>
        )
      })}
    </div>
  )
}
