import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useDialog } from '../contexts/DialogContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { getRentalAvailability } from '../services/availability.service'
import type { RentalAvailability } from '../types/commerce'
import { hasValidDateRange } from '../utils/commerce'
import { usePageMeta } from '../hooks/usePageMeta'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function RentalCartPage() {
  usePageMeta({
    title: 'Rental Cart',
    description: 'Review your rental cart, set event dates, and continue to checkout.',
    noIndex: true,
  })

  const { isDark } = useTheme()
  const navigate = useNavigate()
  const dialog = useDialog()
  const { isLoggedIn } = useUser()
  const requireAuthAction = useRequireAuthAction()
  const rentalCart = useRentalCart()
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, RentalAvailability | null>>({})

  useEffect(() => {
    let mounted = true

    async function loadAvailability() {
      const entries = await Promise.all(
        rentalCart.items.map(async item => {
          const { startDate, endDate } = rentalCart.getItemDates(item)
          if (!item.productId || !hasValidDateRange(startDate, endDate)) {
            return [item.productSlug, null] as const
          }

          try {
            const availability = await getRentalAvailability(item.productId, startDate, endDate)
            return [item.productSlug, availability] as const
          } catch {
            return [item.productSlug, null] as const
          }
        })
      )

      if (mounted) {
        setAvailabilityMap(Object.fromEntries(entries))
      }
    }

    void loadAvailability()
    return () => {
      mounted = false
    }
  }, [rentalCart.items, rentalCart.mode, rentalCart.sharedStartDate, rentalCart.sharedEndDate])

  const hasItems = rentalCart.items.length > 0
  const allItemsReady = useMemo(
    () =>
      rentalCart.items.every(item => {
        const { startDate, endDate } = rentalCart.getItemDates(item)
        const days = rentalCart.getItemDays(item)
        return hasValidDateRange(startDate, endDate) && days >= item.minimumRentalDays
      }),
    [rentalCart]
  )

  const handleCheckout = async () => {
    if (!allItemsReady) {
      await dialog.alert({
        title: 'Complete your cart first',
        message: 'Choose valid rental dates for every item before continuing to checkout.',
        confirmLabel: 'Review Cart',
        variant: 'warning',
      })
      return
    }

    if (!isLoggedIn) {
      const canContinue = await requireAuthAction({
        redirectTo: '/checkout',
        title: 'Sign in to continue to checkout',
        message:
          'You can keep building your rental cart as a guest, but you need to sign in before confirming the request. Your cart will stay saved.',
      })
      if (!canContinue) return
    }

    navigate('/checkout')
  }

  if (!hasItems) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Rental Cart
            </h1>
            <p className={cn('mx-auto mt-4 max-w-xl text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Your rental cart is empty. Add products from the catalog, choose your dates, and come back here to continue to checkout.
            </p>
            <div className="mt-6">
              <Link to="/products" className="btn-primary !rounded-xl !px-5 !py-3 !text-sm">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="section-label">// Rental Cart</span>
            <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>Prepare Your Rental Request</h1>
            <p className={cn('mt-2 max-w-2xl text-sm leading-6', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Set shared event dates for the whole cart or switch to per-item dates. Availability is checked against the selected rental range.
            </p>
          </div>

          <div className={cn('rounded-2xl border px-4 py-3 text-sm', isDark ? 'border-cyan-400/10 bg-[#0d1430]/88 text-cyan-100' : 'border-violet-200 bg-violet-50 text-violet-700')}>
            {rentalCart.itemCount} item(s) | {rentalCart.grandTotal.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className={cn('rounded-[20px] border p-3.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => rentalCart.setMode('shared')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold',
                    rentalCart.mode === 'shared'
                      ? isDark
                        ? 'bg-cyan-500/12 text-cyan-200'
                        : 'bg-violet-100 text-violet-700'
                      : isDark
                        ? 'bg-white/[0.04] text-purple-100/72'
                        : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Apply same event dates to all
                </button>
                <button
                  type="button"
                  onClick={() => rentalCart.setMode('per_item')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold',
                    rentalCart.mode === 'per_item'
                      ? isDark
                        ? 'bg-cyan-500/12 text-cyan-200'
                        : 'bg-violet-100 text-violet-700'
                      : isDark
                        ? 'bg-white/[0.04] text-purple-100/72'
                        : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Set dates per item
                </button>
              </div>

              {rentalCart.mode === 'shared' && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-field"
                      value={rentalCart.sharedStartDate}
                      onChange={event => rentalCart.setSharedDates(event.target.value, rentalCart.sharedEndDate)}
                    />
                  </div>
                  <div>
                    <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-field"
                      value={rentalCart.sharedEndDate}
                      onChange={event => rentalCart.setSharedDates(rentalCart.sharedStartDate, event.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {rentalCart.items.map(item => {
              const { startDate, endDate } = rentalCart.getItemDates(item)
              const days = rentalCart.getItemDays(item)
              const availability = availabilityMap[item.productSlug]
              const dateRangeValid = hasValidDateRange(startDate, endDate)

              return (
                <div key={item.productSlug} className={cn('rounded-[20px] border p-3.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
                  <div className="flex flex-col gap-3.5 lg:flex-row">
                    <div className={cn('h-24 w-full overflow-hidden rounded-[18px] lg:w-32', isDark ? 'bg-white/[0.03]' : 'bg-gray-100')}>
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="h-full w-full object-cover" />
                      ) : (
                        <div className={cn('flex h-full items-center justify-center text-sm', isDark ? 'text-purple-100/40' : 'text-gray-400')}>
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className={cn('text-[1rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                            {item.productTitle}
                          </div>
                          <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
                            {item.unitPrice} {item.currency}/day | minimum {item.minimumRentalDays} day(s)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => rentalCart.removeItem(item.productSlug)}
                          className={cn('inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm', isDark ? 'bg-red-500/10 text-red-200' : 'bg-red-50 text-red-600')}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>

                      <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            className="form-field"
                            value={item.quantity}
                            onChange={event => rentalCart.updateQuantity(item.productSlug, Number(event.target.value) || 1)}
                          />
                        </div>

                        <div>
                          <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            disabled={rentalCart.mode === 'shared'}
                            className={cn('form-field', rentalCart.mode === 'shared' && 'opacity-60')}
                            value={startDate}
                            onChange={event => rentalCart.setItemDates(item.productSlug, event.target.value, endDate)}
                          />
                        </div>

                        <div>
                          <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                            End Date
                          </label>
                          <input
                            type="date"
                            disabled={rentalCart.mode === 'shared'}
                            className={cn('form-field', rentalCart.mode === 'shared' && 'opacity-60')}
                            value={endDate}
                            onChange={event => rentalCart.setItemDates(item.productSlug, startDate, event.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-3.5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                        <div className={cn('rounded-xl px-3 py-2 text-sm', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-gray-50 text-gray-600')}>
                          Rental Days: <strong>{days || '-'}</strong>
                        </div>
                        <div className={cn('rounded-xl px-3 py-2 text-sm', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-gray-50 text-gray-600')}>
                          Line Total: <strong>{rentalCart.getItemLineTotal(item).toFixed(2)} {item.currency}</strong>
                        </div>
                        <div className={cn('rounded-xl px-3 py-2 text-sm', isDark ? 'bg-white/[0.03]' : 'bg-gray-50')}>
                          {!dateRangeValid ? (
                            <span className={isDark ? 'text-purple-100/60' : 'text-gray-500'}>
                              Availability depends on selected dates
                            </span>
                          ) : availability ? (
                            <span className={availability.availableQuantity >= item.quantity ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : (isDark ? 'text-rose-300' : 'text-rose-700')}>
                              Available: {availability.availableQuantity}
                            </span>
                          ) : (
                            <span className={isDark ? 'text-purple-100/60' : 'text-gray-500'}>
                              Checking availability...
                            </span>
                          )}
                        </div>
                      </div>

                      {dateRangeValid && days < item.minimumRentalDays && (
                        <div className={cn('mt-3 rounded-xl px-3 py-2 text-sm', isDark ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-700')}>
                          This product requires at least {item.minimumRentalDays} rental day(s).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={cn('h-fit rounded-[20px] border p-4 xl:sticky xl:top-24', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <div className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
              Cart Summary
            </div>
            <div className={cn('mt-2 text-3xl font-display font-black', isDark ? 'text-white' : 'text-gray-900')}>
              {rentalCart.grandTotal.toFixed(2)}
            </div>
            <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/65' : 'text-gray-500')}>
              Estimated total based on the current day-rate selection.
            </div>

            <div className={cn('mt-4 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-gray-50 text-gray-600')}>
              {allItemsReady
                ? isLoggedIn
                  ? 'All items are ready for checkout.'
                  : 'All items are ready. Sign in before confirming the rental request.'
                : 'Choose valid dates for every item before checkout.'}
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={!allItemsReady}
                className="btn-primary !block !w-full !rounded-xl !text-center !text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggedIn ? 'Continue to Checkout' : 'Sign in to Checkout'}
              </button>
              <Link to="/products" className="btn-outline !block !w-full !rounded-xl !text-center !text-sm">
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

