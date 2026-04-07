import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ShoppingBag, Trash2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDialog } from '../contexts/DialogContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { getRentalAvailability } from '../services/availability.service'
import type { RentalAvailability } from '../types/commerce'
import { hasValidDateRange } from '../utils/commerce'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../utils/cn'

const ease = [0.16, 1, 0.3, 1]

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
      if (mounted) setAvailabilityMap(Object.fromEntries(entries))
    }

    void loadAvailability()
    return () => { mounted = false }
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
        message: 'You can keep building your rental cart as a guest, but you need to sign in before confirming the request. Your cart will stay saved.',
      })
      if (!canContinue) return
    }
    navigate('/checkout')
  }

  const cardBase = isDark
    ? 'border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,13,32,0.96),rgba(10,9,24,0.98))]'
    : 'border border-violet-100/70 bg-white shadow-[0_4px_20px_rgba(124,58,237,0.05)]'

  // ── Empty State ──
  if (!hasItems) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className={`relative overflow-hidden rounded-[28px] border px-6 py-14 sm:py-18 text-center ${cardBase}`}
          >
            {/* Ambient glow */}
            {isDark && (
              <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-[60px]" aria-hidden="true" />
            )}
            <div className="relative">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] ${
                  isDark
                    ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(34,211,238,0.10))] border border-white/[0.08]'
                    : 'bg-violet-50 border border-violet-100'
                }`}
              >
                <ShoppingBag size={30} className={isDark ? 'text-violet-300/80' : 'text-violet-400'} />
              </div>
              <h1 className={`font-display text-[1.85rem] font-black tracking-[-0.04em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your cart is empty
              </h1>
              <p className={`mx-auto mt-3 max-w-md text-[0.97rem] leading-[1.72] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Add event services from the catalog, choose your rental dates, and come back here to continue to checkout.
              </p>
              <div className="mt-8">
                <Link to="/products" className="btn-primary !rounded-[14px] !px-7 !py-3 !text-[13px]">
                  Browse Products
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease }}
          className="mb-9"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <span className="section-label">// Rental Cart</span>
            <div className={`h-px w-8 ${isDark ? 'bg-violet-500/30' : 'bg-violet-300/50'}`} />
          </div>
          <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
            Prepare Your <span className="text-glow">Request</span>
          </h1>
          <p className={`mt-4 max-w-2xl text-[0.97rem] leading-[1.72] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Set shared event dates for the whole cart, or switch to per-item mode. Availability is checked against your rental range.
          </p>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* ── Left: Items ── */}
          <div className="space-y-4">

            {/* Date Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06, ease }}
              className={`overflow-hidden rounded-[22px] ${cardBase}`}
            >
              <div className={`border-b px-5 py-4 ${isDark ? 'border-white/[0.07]' : 'border-violet-100/60'}`}>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className={isDark ? 'text-cyan-400/80' : 'text-violet-500'} />
                  <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Event Dates
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Toggle buttons */}
                <div className={`mb-5 grid grid-cols-2 gap-1.5 rounded-[14px] p-1 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                  {[
                    { mode: 'shared' as const, label: 'Shared dates for all' },
                    { mode: 'per_item' as const, label: 'Per-item dates' },
                  ].map(({ mode, label }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => rentalCart.setMode(mode)}
                      className={cn(
                        'min-h-[42px] rounded-[11px] px-3 py-2.5 text-[12.5px] font-semibold transition-all duration-250',
                        rentalCart.mode === mode
                          ? isDark
                            ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.5),rgba(34,211,238,0.3))] text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                            : 'bg-white text-violet-700 shadow-[0_2px_8px_rgba(124,58,237,0.12)]'
                          : isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Shared date inputs */}
                {rentalCart.mode === 'shared' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`mb-2 block text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="form-field"
                        value={rentalCart.sharedStartDate}
                        onChange={e => rentalCart.setSharedDates(e.target.value, rentalCart.sharedEndDate)}
                      />
                    </div>
                    <div>
                      <label className={`mb-2 block text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-field"
                        value={rentalCart.sharedEndDate}
                        onChange={e => rentalCart.setSharedDates(rentalCart.sharedStartDate, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cart Items */}
            {rentalCart.items.map((item, idx) => {
              const { startDate, endDate } = rentalCart.getItemDates(item)
              const days = rentalCart.getItemDays(item)
              const availability = availabilityMap[item.productSlug]
              const dateRangeValid = hasValidDateRange(startDate, endDate)
              const minDaysMissed = dateRangeValid && days < item.minimumRentalDays
              const availOk = availability ? availability.availableQuantity >= item.quantity : null

              return (
                <motion.div
                  key={item.productSlug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 + idx * 0.06, ease }}
                  className={`overflow-hidden rounded-[22px] ${cardBase}`}
                >
                  {/* Item header */}
                  <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-white/[0.07]' : 'border-violet-100/60'}`}>
                    <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Item {idx + 1} of {rentalCart.items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => rentalCart.removeItem(item.productSlug)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11px] font-semibold transition-all',
                        isDark ? 'bg-red-500/[0.10] text-red-400 hover:bg-red-500/[0.16]' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      )}
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Product image */}
                      <div
                        className={`h-24 w-full shrink-0 overflow-hidden rounded-[16px] sm:h-28 sm:w-28 lg:h-24 lg:w-24 ${
                          isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-100 border border-slate-200/60'
                        }`}
                      >
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productTitle} className="h-full w-full object-cover" />
                        ) : (
                          <div className={`flex h-full items-center justify-center text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-display text-[1.05rem] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.productTitle}
                        </h3>
                        <p className={`mt-1 text-[12.5px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.unitPrice} {item.currency}/day · minimum {item.minimumRentalDays} day{item.minimumRentalDays !== 1 ? 's' : ''}
                        </p>

                        {/* Controls */}
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <label className={`mb-1.5 block text-[11.5px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              className="form-field"
                              value={item.quantity}
                              onChange={e => rentalCart.updateQuantity(item.productSlug, Number(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <label className={`mb-1.5 block text-[11.5px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              Start Date
                            </label>
                            <input
                              type="date"
                              disabled={rentalCart.mode === 'shared'}
                              className={cn('form-field', rentalCart.mode === 'shared' && 'opacity-50 cursor-not-allowed')}
                              value={startDate}
                              onChange={e => rentalCart.setItemDates(item.productSlug, e.target.value, endDate)}
                            />
                          </div>
                          <div>
                            <label className={`mb-1.5 block text-[11.5px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              End Date
                            </label>
                            <input
                              type="date"
                              disabled={rentalCart.mode === 'shared'}
                              className={cn('form-field', rentalCart.mode === 'shared' && 'opacity-50 cursor-not-allowed')}
                              value={endDate}
                              onChange={e => rentalCart.setItemDates(item.productSlug, startDate, e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Status row */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {/* Days count */}
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                              isDark ? 'border border-white/[0.07] bg-white/[0.04] text-slate-400' : 'border border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            <Clock size={11} />
                            {days ? `${days} day${days !== 1 ? 's' : ''}` : 'No dates'}
                          </div>

                          {/* Line total */}
                          {days > 0 && (
                            <div
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                                isDark ? 'border border-violet-500/20 bg-violet-500/10 text-violet-300' : 'border border-violet-200 bg-violet-50 text-violet-700'
                              }`}
                            >
                              {rentalCart.getItemLineTotal(item).toFixed(2)} {item.currency}
                            </div>
                          )}

                          {/* Availability */}
                          {dateRangeValid && (
                            availability ? (
                              <div
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold',
                                  availOk
                                    ? isDark ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border border-emerald-200 bg-emerald-50 text-emerald-600'
                                    : isDark ? 'border border-red-500/20 bg-red-500/10 text-red-400' : 'border border-red-200 bg-red-50 text-red-500'
                                )}
                              >
                                {availOk ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                                {availOk ? `${availability.availableQuantity} available` : `Only ${availability.availableQuantity} in stock`}
                              </div>
                            ) : (
                              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                Checking...
                              </div>
                            )
                          )}
                        </div>

                        {/* Min days warning */}
                        {minDaysMissed && (
                          <div
                            className={`mt-3 flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 text-[12px] font-medium ${
                              isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'
                            }`}
                          >
                            <AlertTriangle size={13} className="shrink-0" />
                            Minimum {item.minimumRentalDays} day{item.minimumRentalDays !== 1 ? 's' : ''} required for this product.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Right: Summary Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className={`order-first h-fit rounded-[22px] xl:order-none xl:sticky xl:top-[calc(var(--app-navbar-height)+1.5rem)] ${cardBase}`}
          >
            {/* Summary header */}
            <div className={`border-b px-5 py-4 ${isDark ? 'border-white/[0.07] bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(34,211,238,0.05))]' : 'border-violet-100/60 bg-gradient-to-r from-violet-50/70 to-cyan-50/40'}`}>
              <span className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-violet-300/70' : 'text-violet-500'}`}>
                Cart Summary
              </span>
            </div>

            <div className="p-5">
              {/* Item count */}
              <div className="mb-5 flex items-center justify-between">
                <span className={`text-[13px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {rentalCart.itemCount} item{rentalCart.itemCount !== 1 ? 's' : ''} in cart
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                  {rentalCart.itemCount}
                </span>
              </div>

              {/* Total */}
              <div className={`rounded-[16px] p-4 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200/60'}`}>
                <div className={`text-[10.5px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  Estimated Total
                </div>
                <div className={`mt-1.5 font-display text-[2.2rem] font-black leading-none tracking-[-0.04em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {rentalCart.grandTotal.toFixed(2)}
                </div>
                <div className={`mt-1 text-[11.5px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  Based on current day rates
                </div>
              </div>

              {/* Readiness status */}
              <div
                className={cn(
                  'mt-4 flex items-start gap-2.5 rounded-[14px] px-3.5 py-3 text-[12px] leading-[1.6]',
                  allItemsReady
                    ? isDark ? 'bg-emerald-500/10 border border-emerald-500/18 text-emerald-300' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : isDark ? 'bg-amber-500/10 border border-amber-500/18 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'
                )}
              >
                {allItemsReady
                  ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
                <span>
                  {allItemsReady
                    ? isLoggedIn
                      ? 'All items are ready for checkout.'
                      : 'All items ready. Sign in to confirm the request.'
                    : 'Set valid dates for every item before checkout.'}
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => void handleCheckout()}
                  disabled={!allItemsReady}
                  className="btn-primary !block !w-full !rounded-[14px] !text-center !text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggedIn ? 'Continue to Checkout' : 'Sign In to Checkout'}
                </button>
                <Link
                  to="/products"
                  className="btn-outline !block !w-full !rounded-[14px] !text-center !text-[13px]"
                >
                  Keep Browsing
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
