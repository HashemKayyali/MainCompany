import { cn } from '../../utils/cn'

type ActionTone = 'neutral' | 'primary' | 'danger' | 'ghost'

interface AdminActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ActionTone
}

// Light-only, unified admin action button. One size, one radius, clear
// tones, no overlap. Used across every admin page + modal footer.
const TONES: Record<ActionTone, string> = {
  primary:
    'border border-violet-500/40 bg-[linear-gradient(135deg,#6d28d9,#7c3aed_55%,#9d6bff)] text-white shadow-[0_10px_24px_-12px_rgba(89,23,196,0.55)] hover:brightness-[1.06]',
  neutral:
    'border border-violet-200 bg-white text-[#211049] shadow-[0_6px_16px_-12px_rgba(89,23,196,0.25)] hover:border-violet-400 hover:bg-violet-50 hover:text-[#1a0b3d]',
  danger:
    'border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-800',
  ghost:
    'border border-transparent bg-transparent text-[#4b3a63] hover:bg-violet-50 hover:text-[#1a0b3d]',
}

export default function AdminActionButton({
  className,
  tone = 'neutral',
  type = 'button',
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[12px] px-4 py-2 text-[12px] font-bold tracking-[0.01em] transition-all duration-200 active:translate-y-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-45',
        TONES[tone],
        className
      )}
      {...props}
    />
  )
}
