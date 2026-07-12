const COLORS: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-900',
  contacted: 'bg-blue-100 text-blue-900',
  quoted: 'bg-violet-100 text-violet-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  in_preparation: 'bg-sky-100 text-sky-900',
  completed: 'bg-emerald-100 text-emerald-900',
  won: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-900',
  cancelled: 'bg-slate-100 text-slate-800',
  lost: 'bg-slate-100 text-slate-800',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${COLORS[status] ?? 'bg-slate-100 text-slate-800'}`}
    >
      {label}
    </span>
  )
}
