import { useTheme } from '../../contexts/ThemeContext'
import type { AdminCardView } from './useAdminCardView'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

interface AdminViewToggleProps {
  value: AdminCardView
  onChange: (value: AdminCardView) => void
}

export default function AdminViewToggle({ value, onChange }: AdminViewToggleProps) {
  const { isDark } = useTheme()

  const options: Array<{ value: AdminCardView; label: string; short: string }> = [
    { value: 'grid', label: 'Adaptive Grid', short: 'Grid' },
    { value: 'list', label: 'List View', short: 'List' },
  ]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-[14px] p-0.75',
        isDark
          ? 'bg-[linear-gradient(145deg,rgba(9,13,30,0.98),rgba(11,16,35,0.99))] ring-1 ring-inset ring-cyan-400/14 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]'
          : 'bg-white ring-1 ring-inset ring-gray-200 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.22)]'
      )}
      aria-label="Card layout"
    >
      {options.map(option => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex min-h-[30px] min-w-[62px] items-center justify-center rounded-[10px] px-2.75 py-1.25 text-[9.5px] font-semibold transition active:translate-y-[1px]',
              active
                ? isDark
                  ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_26px_-18px_rgba(34,211,238,0.3)]'
                  : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
                : isDark
                  ? 'bg-[#0d1430]/68 text-purple-100/72 ring-1 ring-inset ring-cyan-400/10 hover:bg-[#111a39] hover:text-white'
                  : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-white'
            )}
            title={option.label}
          >
            {option.short}
          </button>
        )
      })}
    </div>
  )
}
