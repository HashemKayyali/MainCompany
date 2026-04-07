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
  minHeightClassName = 'min-h-[164px]',
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
  const effectiveMinHeightClass = minHeightClassName || (isList ? 'min-h-[96px]' : 'min-h-[164px]')
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
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,255,0.96))] ring-violet-200 shadow-[0_16px_30px_-26px_rgba(124,58,237,0.18)]'
  const gridFactLabelClass = isDark ? 'text-cyan-100/46' : 'text-gray-400'
  const gridFactValueClass = isDark ? 'text-white' : 'text-gray-800'
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
        'group relative flex h-full flex-col overflow-hidden rounded-[15px] transition-[transform,box-shadow,background-color,opacity] duration-300',
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
          <div className={cn('relative px-2 pt-2')}>
            <div
              className={cn(
                'relative h-full overflow-hidden rounded-[11px] ring-1 ring-inset',
              isDark ? 'bg-black/20 ring-cyan-400/10' : 'bg-gray-50 ring-gray-200'
            )}
          >
            {media}
          </div>

          {mediaOverlayLeft && <div className="pointer-events-none absolute left-5 top-5 z-10">{mediaOverlayLeft}</div>}
          {mediaOverlayRight && <div className="pointer-events-none absolute right-5 top-5 z-10">{mediaOverlayRight}</div>}
        </div>
      )}

        <div className={cn('relative flex min-w-0 flex-1 flex-col gap-2 p-2.5', bodyClassName)}>
          <div className={cn('space-y-0.5', titleBlockClassName)}>
          <div className={cn(gridTitleClampClass, 'font-display text-[0.94rem] font-bold leading-tight', isDark ? 'text-white' : 'text-gray-900')}>
            {title}
          </div>

          {subtitle && (
            <p className={cn(gridSubtitleClampClass, 'max-w-3xl text-[10px] leading-[1.4]', isDark ? 'text-purple-100/64' : 'text-gray-500')}>
              {subtitle}
            </p>
          )}
        </div>

        {badges && <div className={cn('flex flex-wrap gap-1', badgesWrapClassName)}>{badges}</div>}

        {facts.length > 0 && (
          <div className={cn('grid grid-cols-2 gap-1', factsWrapClassName)}>
            {facts.map(fact => (
              <div
                key={fact.label}
                className={cn(
                'relative overflow-hidden rounded-[12px] px-2.25 py-1.5 ring-1 ring-inset',
                  gridFactShellClass
                )}
              >
                <div className={cn('mb-2 h-px w-8 rounded-full', isDark ? 'bg-cyan-400/24' : 'bg-violet-200')} />
                <div className={cn('text-[7.5px] font-mono font-semibold uppercase tracking-[0.12em]', gridFactLabelClass)}>
                  {fact.label}
                </div>
                <div className={cn('mt-1 min-h-[1rem] min-w-0 text-[0.86rem] font-display font-semibold leading-none', gridFactValueClass)}>
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
              gridActionsPlacement === 'bottom' ? 'flex items-center gap-1.5 pt-2' : 'flex items-center gap-1.5 pt-1',
              actionsWrapClassName
            )}
          >
            <div className="flex flex-1 flex-wrap items-center gap-1">{actions}</div>
          </div>
        )}
      </div>
    </div>
  )
}
