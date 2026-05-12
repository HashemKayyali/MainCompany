import { memo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { parseMediaValue } from '../../utils/media-frame'
import { cn } from '../../utils/cn'

/**
 * Presentational category tile used by the public homepage (OfferSection)
 * and by the admin Categories editor preview. This is the SINGLE source of
 * truth for what a category card looks like — admin previews and the public
 * grid must render through this component so the two never drift.
 *
 * The component is intentionally pure / non-interactive: callers wrap it in
 * a <button>, <Link>, or a plain <div> (preview mode) as needed.
 */
export interface CategoryTileViewProps {
  name: string
  image?: string
  count: number
  active?: boolean
  /**
   * Disable hover scale / radial overlays for low-power / reduced-motion
   * contexts, and also for admin previews where animation would be noisy.
   */
  reducedVisualEffects?: boolean
  /**
   * Optional override — by default, theme is read from ThemeContext.
   * Admin previews can force light mode if they want.
   */
  isDarkOverride?: boolean
  className?: string
}

const CategoryTileView = memo(function CategoryTileView({
  name,
  image,
  count,
  active = false,
  reducedVisualEffects = false,
  isDarkOverride,
  className,
}: CategoryTileViewProps) {
  const themeCtx = useTheme()
  const isDark = isDarkOverride ?? themeCtx.isDark
  const imageSrc = image ? parseMediaValue(image).src : ''

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[18px]',
        !reducedVisualEffects && 'transition-all duration-400',
        isDark
          ? cn(
              'bg-[linear-gradient(168deg,rgba(15,12,32,0.97),rgba(9,8,22,0.98))]',
              active
                ? 'border border-violet-400/55 shadow-[0_0_0_1px_rgba(124,58,237,0.28),0_0_36px_rgba(124,58,237,0.22),0_24px_56px_rgba(0,0,0,0.48)]'
                : 'border border-white/[0.08] hover:border-violet-400/28 hover:shadow-[0_0_20px_rgba(124,58,237,0.13),0_14px_40px_rgba(0,0,0,0.38)]'
            )
          : cn(
              'bg-white',
              active
                ? 'border border-violet-500/55 shadow-[0_0_0_1px_rgba(124,58,237,0.18),0_16px_40px_rgba(124,58,237,0.18)]'
                : 'border border-slate-200/80 hover:border-violet-300/50 hover:shadow-[0_8px_32px_rgba(124,58,237,0.12)]'
            ),
        className
      )}
    >
      {isDark && !reducedVisualEffects && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(124,58,237,0.13) 0%, transparent 65%)',
          }}
        />
      )}

      <div className="relative aspect-[4/3] overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            draggable={false}
            className={cn(
              'absolute inset-0 h-full w-full select-none object-cover object-center',
              !reducedVisualEffects && 'transition-transform duration-700 ease-out',
              active ? 'scale-[1.08]' : reducedVisualEffects ? 'scale-100' : 'scale-100 group-hover:scale-[1.06]'
            )}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0',
              !reducedVisualEffects && 'transition-transform duration-700 group-hover:scale-[1.06]'
            )}
            style={{
              background: isDark
                ? 'linear-gradient(148deg, rgba(91,33,182,0.78), rgba(12,12,28,0.94) 55%, rgba(8,47,73,0.82))'
                : 'linear-gradient(148deg, rgba(124,58,237,0.16), rgba(255,255,255,0.94) 55%, rgba(34,211,238,0.10))',
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(15,8,40,0.18) 50%, rgba(15,8,40,0.62) 82%, rgba(15,8,40,0.86) 100%)',
          }}
        />

        {active && (
          <div className="absolute right-2.5 top-2.5 z-20">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow-[0_0_14px_rgba(124,58,237,0.85)]">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          'px-3.5 py-3 transition-colors duration-300',
          isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white'
        )}
      >
        <div
          className={cn(
            'mb-0.5 text-[9px] font-bold uppercase tracking-[0.20em] transition-colors duration-300',
            active
              ? isDark ? 'text-violet-400' : 'text-violet-600'
              : isDark
                ? 'text-violet-400/52 group-hover:text-violet-400/80'
                : 'text-violet-500/60 group-hover:text-violet-500/85'
          )}
        >
          {count} Service{count !== 1 ? 's' : ''}
        </div>

        <h3
          className={cn(
            'font-display text-[0.96rem] font-bold leading-tight tracking-[-0.02em] line-clamp-1',
            isDark ? 'text-white/92' : 'text-slate-900'
          )}
        >
          {name}
        </h3>
      </div>

      {active && (
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,58,237,0.72), rgba(6,182,212,0.52), transparent)',
          }}
        />
      )}
    </div>
  )
})

export default CategoryTileView
