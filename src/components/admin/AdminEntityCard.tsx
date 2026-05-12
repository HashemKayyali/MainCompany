import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

export type AdminFact = {
  label: string
  value: React.ReactNode
}

interface AdminEntityCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  media?: React.ReactNode
  mediaOverlayLeft?: React.ReactNode
  mediaOverlayRight?: React.ReactNode
  badges?: React.ReactNode
  facts?: AdminFact[]
  actions?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
  className?: string
  bodyClassName?: string
  minHeightClassName?: string
  listMediaWrapClassName?: string
  listMediaFrameClassName?: string
  titleBlockClassName?: string
  badgesWrapClassName?: string
  factsWrapClassName?: string
  childrenWrapClassName?: string
  actionsWrapClassName?: string
  gridActionsPlacement?: 'bottom' | 'flow'
  variant?: 'grid' | 'list'
}

export default function AdminEntityCard({
  title,
  subtitle,
  media,
  mediaOverlayLeft,
  mediaOverlayRight,
  badges,
  facts = [],
  actions,
  children,
  onClick,
  className,
  bodyClassName,
  minHeightClassName,
  listMediaWrapClassName,
  listMediaFrameClassName,
  titleBlockClassName,
  badgesWrapClassName,
  factsWrapClassName,
  childrenWrapClassName,
  actionsWrapClassName,
  gridActionsPlacement = 'flow',
  variant = 'grid',
}: AdminEntityCardProps) {
  const { isDark } = useTheme()
  const clickable = typeof onClick === 'function'
  const isList = variant === 'list'
  const effectiveMinHeightClass =
    minHeightClassName !== undefined
      ? minHeightClassName
      : isList
        ? 'min-h-[96px]'
        : 'min-h-[164px]'
  const shellClass = isDark
    ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.98),rgba(7,10,24,0.99))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_82px_-58px_rgba(6,12,30,0.96)]'
    : 'bg-white ring-1 ring-inset ring-gray-200 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)]'
  const interactiveClass = clickable
    ? isDark
      ? 'cursor-pointer hover:-translate-y-0.5 hover:ring-cyan-300/22'
      : 'cursor-pointer hover:-translate-y-0.5 hover:ring-violet-200'
    : ''
  const resolvedListMinHeightClass =
    effectiveMinHeightClass === 'min-h-[260px]'
      ? 'min-h-[108px]'
      : effectiveMinHeightClass === 'min-h-[248px]'
        ? 'min-h-[108px]'
        : effectiveMinHeightClass
  const overlayGlowClass = isDark
    ? 'bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_30%)]'
    : 'bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.07),transparent_30%)]'
  const titleClampClass = 'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]'
  const subtitleClampClass =
    'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'
  const gridTitleClampClass =
    'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'
  const gridSubtitleClampClass =
    'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'
  const gridFactShellClass = isDark
    ? 'bg-[linear-gradient(180deg,rgba(10,18,37,0.96),rgba(9,15,31,0.92))] ring-cyan-400/14 shadow-[0_16px_32px_-24px_rgba(8,145,178,0.45)]'
    : 'bg-[linear-gradient(180deg,rgba(252,248,255,1),rgba(245,240,255,0.96))] ring-violet-200 shadow-[0_10px_22px_-20px_rgba(124,58,237,0.22)]'
  const gridFactLabelClass = isDark ? 'text-cyan-100/46' : 'text-[#4a2c8f]'
  const gridFactValueClass = isDark ? 'text-white' : 'text-[#07041a]'
  const hasChildren = Boolean(children)
  const hasFacts = facts.length > 0
  const hasActions = Boolean(actions)
  const listGridClass = cn(
    'md:grid-cols-[auto_minmax(0,1fr)] md:items-center',
    hasFacts && hasActions && 'xl:grid-cols-[auto_minmax(0,1fr)_minmax(148px,178px)_minmax(112px,126px)] xl:items-center',
    hasFacts && !hasActions && 'xl:grid-cols-[auto_minmax(0,1fr)_minmax(148px,178px)] xl:items-center',
    !hasFacts && hasActions && 'xl:grid-cols-[auto_minmax(0,1fr)_minmax(112px,126px)] xl:items-center'
  )
  if (isList) {
    return (
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          clickable
            ? event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
        className={cn(
    'group relative overflow-hidden rounded-[18px] transition-[transform,box-shadow,background-color,opacity] duration-300',
          shellClass,
          interactiveClass,
          resolvedListMinHeightClass,
          className
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
            overlayGlowClass,
            'group-hover:opacity-100'
          )}
        />

        <div
          className={cn(
            'relative grid min-w-0 gap-2.5 p-3 md:gap-2.5 xl:gap-2.5',
            listGridClass,
            bodyClassName
          )}
        >
          {media && (
            <div className={cn('relative md:self-center', listMediaWrapClassName)}>
              <div
                className={cn(
                  'relative flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-[14px] ring-1 ring-inset md:h-[72px] md:w-[96px]',
                  isDark ? 'bg-black/20 ring-cyan-400/10' : 'bg-gray-50 ring-gray-200',
                  listMediaFrameClassName
                )}
              >
                {media}
              </div>
            </div>
          )}

          <div className="min-w-0 self-center space-y-1.5">
            {(mediaOverlayLeft || mediaOverlayRight) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {mediaOverlayLeft}
                {mediaOverlayRight}
              </div>
            )}

            <div className="min-w-0 space-y-1.25">
              <div className={cn('min-w-0 space-y-0.5', titleBlockClassName)}>
                <div className={cn(titleClampClass, 'font-display text-[1rem] font-bold leading-tight', isDark ? 'text-white' : 'text-gray-900')}>
                  {title}
                </div>

                {subtitle && (
                  <p className={cn(subtitleClampClass, 'max-w-[54ch] text-[10.5px] leading-[1.45]', isDark ? 'text-purple-100/62' : 'text-gray-500')}>
                    {subtitle}
                  </p>
                )}
              </div>

              {badges && <div className={cn('flex flex-wrap gap-1', badgesWrapClassName)}>{badges}</div>}
              {hasChildren && <div className={cn('flex flex-wrap items-center gap-1 pt-0.5', childrenWrapClassName)}>{children}</div>}
            </div>
          </div>

          {hasFacts && (
            <div className={cn('grid gap-1.25 self-center sm:grid-cols-2 xl:grid-cols-1 xl:self-center', factsWrapClassName)}>
              {facts.map(fact => (
                <div
                  key={fact.label}
                  className={cn(
                  'min-w-0 rounded-[13px] px-2.5 py-2 ring-1 ring-inset',
                    isDark ? 'bg-[#0d1329]/92 ring-cyan-400/10' : 'bg-gray-50/90 ring-gray-200'
                  )}
                >
                  <div className={cn('text-[8px] font-mono font-semibold uppercase tracking-[0.12em]', isDark ? 'text-cyan-100/38' : 'text-gray-400')}>
                    {fact.label}
                  </div>
                  <div className={cn('mt-1 min-w-0 truncate text-[11.25px] font-semibold leading-tight', isDark ? 'text-white' : 'text-gray-800')}>
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasActions && (
            <div className={cn('flex flex-wrap items-center gap-1.25 self-center xl:flex-col xl:items-stretch xl:justify-center xl:self-center [&>*]:xl:w-full', actionsWrapClassName)}>
              {actions}
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[18px] transition-[transform,box-shadow,background-color,opacity] duration-300',
        shellClass,
        interactiveClass,
        effectiveMinHeightClass,
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          overlayGlowClass,
          'group-hover:opacity-100'
        )}
      />

      {media && (
          <div className={cn('relative px-3 pt-3')}>
            <div
              className={cn(
                'relative h-full overflow-hidden rounded-[14px] ring-1 ring-inset',
              isDark ? 'bg-black/20 ring-cyan-400/10' : 'bg-violet-50/60 ring-violet-200/70'
            )}
          >
            {media}
          </div>

          {mediaOverlayLeft && <div className="pointer-events-none absolute left-5 top-5 z-10">{mediaOverlayLeft}</div>}
          {mediaOverlayRight && <div className="pointer-events-none absolute right-5 top-5 z-10">{mediaOverlayRight}</div>}
        </div>
      )}

        <div className={cn('relative flex min-w-0 flex-1 flex-col gap-3 p-3.5', bodyClassName)}>
          <div className={cn('space-y-1', titleBlockClassName)}>
          <div className={cn(gridTitleClampClass, 'font-display text-[1.02rem] font-extrabold leading-tight tracking-[-0.01em]', isDark ? 'text-white' : 'text-[#07041a]')}>
            {title}
          </div>

          {subtitle && (
            <p className={cn(gridSubtitleClampClass, 'max-w-3xl text-[11.5px] font-medium leading-[1.5]', isDark ? 'text-purple-100/64' : 'text-[#31195f]')}>
              {subtitle}
            </p>
          )}
        </div>

        {badges && <div className={cn('flex flex-wrap gap-1.5', badgesWrapClassName)}>{badges}</div>}

        {facts.length > 0 && (
          <div className={cn('grid grid-cols-2 gap-2', factsWrapClassName)}>
            {facts.map(fact => (
              <div
                key={fact.label}
                className={cn(
                'relative min-w-0 overflow-hidden rounded-[12px] px-3 py-2.5 ring-1 ring-inset',
                  gridFactShellClass
                )}
              >
                <div className={cn('mb-1.5 h-px w-7 rounded-full', isDark ? 'bg-cyan-400/24' : 'bg-violet-300/80')} />
                <div className={cn('text-[8.5px] font-mono font-bold uppercase tracking-[0.14em]', gridFactLabelClass)}>
                  {fact.label}
                </div>
                <div className={cn('mt-1 min-w-0 truncate text-[0.92rem] font-display font-bold leading-tight', gridFactValueClass)}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {children && <div className={cn('pt-0.5', childrenWrapClassName)}>{children}</div>}

        {actions && (
          <div
            className={cn(
              gridActionsPlacement === 'bottom' ? 'mt-auto pt-2' : 'pt-1',
              actionsWrapClassName
            )}
          >
            {/*
              Stable two-row action grid:
              - With 2 buttons: each fills one column.
              - With 3 buttons (Details / Edit / Delete): first two share row one,
                third button auto-spans both columns on row two. No flex-wrap
                drama where the last button collapses to a tiny chip.
            */}
            <div
              className={cn(
                'grid grid-cols-2 gap-1.5',
                '[&>*]:w-full [&>*]:min-w-0',
                '[&>*:nth-child(3)]:col-span-2'
              )}
            >
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
