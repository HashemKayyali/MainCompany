import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

interface AdminStatCardProps {
  label: string
  value: React.ReactNode
  accent?: React.ReactNode
  className?: string
}

export default function AdminStatCard({
  label,
  value,
  accent,
  className,
}: AdminStatCardProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px] px-4 py-3.5 min-h-[90px]',
        isDark
          ? 'bg-[linear-gradient(145deg,rgba(12,17,36,0.98),rgba(8,12,28,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_24px_80px_-58px_rgba(8,16,38,0.92)]'
          : 'bg-white ring-1 ring-inset ring-gray-200',
        className
      )}
    >
      {isDark && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_34%)]" />
      )}
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.28), rgba(168,85,247,0.20), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.24), transparent)',
        }}
      />
      <div className="relative flex h-full items-start justify-between gap-3.5">
        <div className="space-y-2">
          <div
            className={cn(
              'text-[9.5px] font-mono font-semibold uppercase tracking-[0.15em]',
              isDark ? 'text-cyan-100/42' : 'text-gray-400'
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              'text-[1.34rem] font-display font-black leading-none tracking-[-0.04em] sm:text-[1.52rem]',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {value}
          </div>
        </div>
        {accent && <div className="pt-1">{accent}</div>}
      </div>
    </div>
  )
}
