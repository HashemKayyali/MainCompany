import { useTheme } from '../../contexts/ThemeContext'
import { formatRequestStatusLabel } from '../../utils/commerce'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function RequestStatusBadge({ status }: { status: string }) {
  const { isDark } = useTheme()

  const tone = (() => {
    if (status === 'pending_review') return isDark ? 'bg-amber-500/12 text-amber-200 ring-amber-400/18' : 'bg-amber-50 text-amber-700 ring-amber-200'
    if (status === 'confirmed' || status === 'won' || status === 'completed') return isDark ? 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/18' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    if (status === 'contacted' || status === 'quoted' || status === 'in_preparation') return isDark ? 'bg-cyan-500/12 text-cyan-200 ring-cyan-400/18' : 'bg-cyan-50 text-cyan-700 ring-cyan-200'
    return isDark ? 'bg-rose-500/12 text-rose-200 ring-rose-400/18' : 'bg-rose-50 text-rose-700 ring-rose-200'
  })()

  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset', tone)}>
      {formatRequestStatusLabel(status)}
    </span>
  )
}
