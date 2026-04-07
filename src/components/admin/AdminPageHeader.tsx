import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

interface AdminPageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export default function AdminPageHeader({
  title,
  actions,
}: AdminPageHeaderProps) {
  const { isDark } = useTheme()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden="true"
            className={cn(
              'mt-1 h-7 w-1.5 shrink-0 rounded-full',
              isDark
                ? 'bg-[linear-gradient(180deg,rgba(34,211,238,0.95),rgba(168,85,247,0.92),rgba(236,72,153,0.9))] shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                : 'bg-[linear-gradient(180deg,rgba(14,165,233,0.95),rgba(124,58,237,0.9),rgba(236,72,153,0.85))]'
            )}
          />

          <div className="min-w-0">
            <h1
              className={cn(
                'font-display text-[1.24rem] font-extrabold tracking-[-0.04em] sm:text-[1.42rem]',
                'lg:text-[1.56rem]',
                isDark ? 'text-white drop-shadow-[0_6px_18px_rgba(6,12,30,0.45)]' : 'text-gray-950'
              )}
            >
              {title}
            </h1>
            <div
              aria-hidden="true"
              className={cn(
                'mt-1 h-[2px] w-14 rounded-full',
                isDark
                  ? 'bg-[linear-gradient(90deg,rgba(34,211,238,0.85),rgba(168,85,247,0.65),transparent)]'
                  : 'bg-[linear-gradient(90deg,rgba(14,165,233,0.8),rgba(124,58,237,0.55),transparent)]'
              )}
            />
          </div>
        </div>
      </div>

      {actions && <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center">{actions}</div>}
    </div>
  )
}
