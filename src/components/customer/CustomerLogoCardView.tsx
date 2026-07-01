import { memo, type ReactNode } from 'react'
import type { Customer } from '../../data/customers'
import FramedImage from '../ui/FramedImage'
import { cn } from '../../utils/cn'

/**
 * Presentational logo card used for customer/partner brands. This is the
 * SINGLE source of truth for the public homepage logo cloud, the admin
 * live preview, and the admin /admin/customers listing card.
 *
 * Three variants:
 *
 *  - "marquee"      : compact fixed-size cell used by the homepage logo
 *                     scroller (LogoCloud). Logo only.
 *  - "preview"      : larger, centered single card used in the admin
 *                     create/edit live preview. Logo only — matches what
 *                     the public visitor will actually see.
 *  - "compactAdmin" : same visual identity as the preview, sized for the
 *                     /admin/customers listing grid (~220–240 px wide),
 *                     plus an optional admin metadata line and an actions
 *                     row (Edit / Delete).
 *
 * Public/preview variants never render the customer name — that matches
 * the current homepage logo design. The compactAdmin variant may show
 * the name in a small admin-only metadata strip purely so admins can
 * scan the listing; it does not appear in any customer-facing surface.
 */
export type CustomerLogoCardVariant = 'marquee' | 'preview' | 'compactAdmin'

export interface CustomerLogoCardViewProps {
  customer: Customer
  variant?: CustomerLogoCardVariant
  /** Admin actions row (Edit / Delete). Only rendered in compactAdmin. */
  actions?: ReactNode
  /**
   * Force-disable links/buttons inside the card. Useful for the admin
   * live preview wrapper so the (already non-existent) interactions
   * cannot fire while the admin is typing.
   */
  disableInteractions?: boolean
  className?: string
}

const CustomerLogoCardView = memo(function CustomerLogoCardView({
  customer,
  variant = 'marquee',
  actions,
  disableInteractions = false,
  className,
}: CustomerLogoCardViewProps) {
  // ── Per-variant sizing ────────────────────────────────────────────────
  // Marquee uses the homepage scroller dimensions (logo-only, fixed cell).
  // Preview shows a single larger logo card centred in the admin sidebar.
  // CompactAdmin is the listing-grid card with logo + optional name +
  // action row.
  const shellSizingClass =
    variant === 'marquee'
      ? 'mx-2 h-[96px] w-[176px] shrink-0 items-center justify-center px-5 sm:mx-2.5 sm:h-[104px] sm:w-[200px] lg:mx-3 lg:h-[112px] lg:w-[220px]'
      : variant === 'preview'
        ? 'h-[180px] w-full max-w-[260px] items-center justify-center px-5'
        : // compactAdmin — fixed compact tile so the grid keeps stable width
          'w-full max-w-[240px] flex-col px-3 pb-3 pt-3'

  const logoWrapClass =
    variant === 'compactAdmin'
      ? 'flex h-[140px] w-full items-center justify-center'
      : 'flex h-full w-full items-center justify-center'

  const logoImgClass =
    variant === 'marquee'
      ? 'h-[62px] max-h-[62px] w-auto max-w-[82%] sm:h-[68px] sm:max-h-[68px] lg:h-[72px] lg:max-h-[72px]'
      : variant === 'preview'
        ? 'h-[96px] max-h-[96px] w-auto max-w-[80%]'
        : 'h-[88px] max-h-[88px] w-auto max-w-[82%]'

  return (
    <div
      className={cn(
        'group relative flex overflow-hidden rounded-[18px] border border-violet-200/80 bg-white transition-all duration-300',
        'hover:border-violet-400/85 hover:shadow-[0_16px_32px_-12px_rgba(89,23,196,0.28)]',
        !disableInteractions && variant !== 'compactAdmin' && 'hover:-translate-y-0.5',
        shellSizingClass,
        disableInteractions && 'pointer-events-none',
        className
      )}
      style={{
        boxShadow:
          '0 1px 2px rgba(20,8,50,0.04), 0 8px 20px -10px rgba(89,23,196,0.14)',
      }}
      aria-label={customer.name}
    >
      {/* Top shimmer — same on every variant for shared identity. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, transparent 10%, rgba(168,85,247,0.65) 50%, transparent 90%)',
        }}
      />

      {/* Logo block */}
      <div className={logoWrapClass}>
        <FramedImage
          media={customer.logo}
          alt={customer.name}
          width={320}
          height={180}
          loading="lazy"
          sizes={variant === 'marquee' ? '(max-width: 640px) 160px, 200px' : '220px'}
          className={cn(
            logoImgClass,
            'object-contain opacity-80 mix-blend-multiply transition-all duration-300 group-hover:opacity-100'
          )}
          fallbackTransform={{ fit: 'contain' }}
        />
      </div>

      {/* Admin-only metadata + actions row — never rendered for the public
          marquee or the public-style admin preview, so the customer-facing
          surface stays logo-only as designed. */}
      {variant === 'compactAdmin' && (
        <>
          <div className="mt-2.5 w-full min-w-0 border-t border-violet-100/80 pt-2.5">
            <div
              className="truncate text-[12px] font-bold tracking-[-0.01em] text-[#07041a]"
              title={customer.name}
            >
              {customer.name || 'Untitled'}
            </div>
            {customer.category && (
              <div className="mt-0.5 truncate text-[10.5px] font-semibold uppercase tracking-[0.1em] text-violet-700">
                {customer.category}
              </div>
            )}
          </div>

          {actions && (
            <div className="mt-2.5 grid w-full grid-cols-2 gap-1.5 [&>*]:w-full [&>*]:min-w-0">
              {actions}
            </div>
          )}
        </>
      )}
    </div>
  )
})

export default CustomerLogoCardView
