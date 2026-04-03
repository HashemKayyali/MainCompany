import { useTheme } from '../../contexts/ThemeContext'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type ActionTone = 'neutral' | 'primary' | 'danger' | 'ghost'

interface AdminActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ActionTone
}

export default function AdminActionButton({
  className,
  tone = 'neutral',
  type = 'button',
  ...props
}: AdminActionButtonProps) {
  const { isDark } = useTheme()

  const tones: Record<ActionTone, string> = {
    neutral: isDark
      ? 'bg-[linear-gradient(180deg,rgba(18,28,54,0.94),rgba(12,18,36,0.96))] text-white ring-1 ring-inset ring-white/8 shadow-[0_14px_30px_-20px_rgba(34,211,238,0.26)] hover:ring-cyan-300/22 hover:bg-[linear-gradient(180deg,rgba(20,32,60,0.98),rgba(13,21,42,0.98))]'
      : 'bg-white/98 text-gray-700 ring-1 ring-inset ring-gray-200 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.18)] hover:bg-gray-50 hover:ring-gray-300',
    primary: isDark
      ? 'bg-[linear-gradient(180deg,rgba(19,58,78,0.92),rgba(13,35,55,0.98))] text-cyan-50 ring-1 ring-inset ring-cyan-300/22 shadow-[0_14px_32px_-20px_rgba(34,211,238,0.32)] hover:ring-cyan-200/34 hover:brightness-105'
      : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_12px_24px_-18px_rgba(124,58,237,0.22)] hover:bg-violet-100 hover:ring-violet-300',
    danger: isDark
      ? 'bg-[linear-gradient(180deg,rgba(88,24,39,0.94),rgba(58,16,28,0.98))] text-red-50 ring-1 ring-inset ring-red-300/20 shadow-[0_14px_30px_-20px_rgba(248,113,113,0.28)] hover:ring-red-200/30 hover:brightness-105'
      : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 shadow-[0_12px_24px_-18px_rgba(239,68,68,0.20)] hover:bg-red-100 hover:ring-red-300',
    ghost: isDark
      ? 'bg-[#0d1430]/60 text-purple-100/76 ring-1 ring-inset ring-white/[0.06] hover:bg-[#111a39] hover:text-white/90'
      : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-white',
  }

  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-[40px] items-center justify-center rounded-[13px] px-3.5 py-2 text-[11px] font-semibold tracking-[0.01em] transition-all duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[42px] sm:text-[11.25px]',
        isDark ? 'focus-visible:ring-offset-[#09111f]' : 'focus-visible:ring-offset-white',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
