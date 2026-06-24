import { type ReactNode } from 'react'
import { BRAND_LOGO_HORIZONTAL, BRAND_LOGO_HORIZONTAL_PNG } from '../../../config/brand'

// ── Logo wordmark ─────────────────────────────────────────────────────────────
export function EventiesLogo({
  heroMode: _heroMode,
  isDark: _isDark,
}: {
  heroMode: boolean
  isDark: boolean
}) {
  return (
    <span className="flex h-[38px] w-[126px] shrink-0 items-center sm:h-11 sm:w-[146px] lg:h-[41px] lg:w-[136px] xl:h-11 xl:w-[146px]">
      <img
        src={BRAND_LOGO_HORIZONTAL}
        alt="Eventies"
        width={160}
        height={49}
        className="block h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
        onError={(event) => {
          const image = event.currentTarget
          if (image.dataset.fallbackLogo === 'true') return
          image.dataset.fallbackLogo = 'true'
          image.src = BRAND_LOGO_HORIZONTAL_PNG
        }}
      />
    </span>
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
