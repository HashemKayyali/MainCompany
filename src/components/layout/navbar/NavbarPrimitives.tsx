import { type ReactNode } from 'react'

// ── Logo wordmark ─────────────────────────────────────────────────────────────
export function EventiesLogo({
  heroMode: _heroMode,
  isDark: _isDark,
}: {
  heroMode: boolean
  isDark: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Badge */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/40 bg-[linear-gradient(145deg,#7126e3_0%,#a855f7_48%,#d946ef_112%)] shadow-[0_14px_34px_-6px_rgba(89,23,196,0.6)]">
        <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/35 blur-sm" />
        <span className="relative text-[10.5px] font-black tracking-[0.12em] text-white">Ev</span>
      </div>
      {/* Text mark */}
      <div className="min-w-0 leading-none">
        <div className="font-display text-[12.75px] font-extrabold tracking-[-0.01em] sm:text-[13.5px]" style={{ color: '#140832' }}>
          Eventies
        </div>
        <div className="mt-[3px] text-[8.5px] font-semibold uppercase tracking-[0.16em] text-violet-700 sm:text-[9px] sm:tracking-[0.18em]">
          Marketplace
        </div>
      </div>
    </div>
  )
}

// ── Badge count pill (module-level to avoid re-creation on every Navbar render) ─
export function CountBadge({ count, color, isDark }: { count: string; color: 'cyan' | 'pink'; isDark: boolean }) {
  return (
    <span
      className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 py-[2px] text-[8px] font-mono font-bold leading-none shadow-md ${
        color === 'cyan'
          ? isDark
            ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950 shadow-cyan-400/30'
            : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white shadow-violet-400/25'
          : isDark
            ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950 shadow-pink-400/30'
            : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white shadow-pink-400/20'
      }`}
    >
      {count}
    </span>
  )
}

// ── Shared icon circle (module-level to avoid re-creation on every Navbar render) ─
export function IconCircle({
  children,
  active: isActive = false,
  colorScheme = 'neutral',
}: {
  children: ReactNode
  active?: boolean
  colorScheme?: 'neutral' | 'cyan' | 'pink'
  isDark?: boolean
  heroMode?: boolean
}) {
  const base = 'relative flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border'
  if (colorScheme === 'cyan' && isActive)
    return <span className={`${base} border-violet-400/85 bg-[linear-gradient(135deg,rgba(113,38,227,0.18),rgba(168,85,247,0.10))] text-violet-800`}>{children}</span>
  if (colorScheme === 'pink' && isActive)
    return <span className={`${base} border-fuchsia-400/85 bg-[linear-gradient(135deg,rgba(192,38,211,0.18),rgba(168,85,247,0.10))] text-fuchsia-800`}>{children}</span>
  return <span className={`${base} border-violet-300/75 bg-white/95 text-violet-700`}>{children}</span>
}
