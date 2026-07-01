import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import FramedImage from '../components/ui/FramedImage'
import { useDialog } from '../contexts/DialogContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useUser } from '../contexts/UserContext'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { getRentalAvailability } from '../services/availability.service'
import type { RentalAvailability, RentalCartItem } from '../types/commerce'
import { hasValidDateRange } from '../utils/commerce'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

const todayISO = () => new Date().toISOString().slice(0, 10)

// ── Reusable form-section wrapper (local to this page) ───────────────────────
function CartSection({
  index,
  eyebrow,
  title,
  description,
  motionEnabled,
  delay = 0,
  children,
}: {
  index: string
  eyebrow: string
  title: string
  description: string
  motionEnabled: boolean
  delay?: number
  children: ReactNode
}) {
  return (
    <motion.section
      initial={motionEnabled ? { opacity: 0, y: 20 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-60px' }}
      transition={motionEnabled ? { duration: 0.5, ease, delay } : undefined}
      className="glass !rounded-[22px] p-5 transition-shadow duration-300 hover:shadow-[0_18px_44px_-18px_rgba(89,23,196,0.28)] sm:p-6"
    >
      <div className="mb-5">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7126e3]">
          {index} — {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-[1.35rem] font-black tracking-[-0.02em] text-[#1a0b3d] sm:text-[1.5rem]">
          {title}
        </h2>
        <p className="mt-1.5 text-[0.9rem] leading-6 text-[#4b3a63]">{description}</p>
      </div>
      {children}
    </motion.section>
  )
}

// ── Centered status shell (empty request draft) ──────────────────────────────
function StatusShell({ children }: { children: ReactNode }) {
  return (
    <section className="site-section">
      <div className="site-container max-w-2xl">
        <div className="glass !rounded-[28px] px-6 py-12 text-center sm:px-10 sm:py-14">
          {children}
        </div>
      </div>
    </section>
  )
}

// ── Date field with calendar icon + native picker ────────────────────────────
function DateField({
  label,
  value,
  min,
  disabled,
  onChange,
}: {
  label: string
  value: string
  min?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#4b3a63]">
        {label}
      </label>
      <div className="relative">
        <CalendarDays
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7126e3]"
        />
        <input
          type="date"
          value={value}
          min={min}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
          className="form-field !pl-10 disabled:cursor-not-allowed disabled:opacity-55"
        />
      </div>
    </div>
  )
}

// ── Quantity stepper (mirrors PurchaseQuotePage) ─────────────────────────────
function QtyStepper({
  quantity,
  onChange,
}: {
  quantity: number
  onChange: (next: number) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#4b3a63]">
        Quantity
      </label>
      <div className="inline-flex items-center rounded-[12px] border border-violet-200 bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-l-[12px] text-[#1a0b3d] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Minus size={15} strokeWidth={2.4} />
        </button>
        <input
          type="number"
          min={1}
          max={999}
          inputMode="numeric"
          value={quantity}
          onChange={event => onChange(Number(event.target.value) || 1)}
          onBlur={event => onChange(Math.max(1, Math.min(999, Number(event.target.value) || 1)))}
          className="h-10 w-14 border-x border-violet-200 bg-transparent text-center text-[14px] font-bold tabular-nums text-[#1a0b3d] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={quantity >= 999}
          onClick={() => onChange(quantity + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-r-[12px] text-[#1a0b3d] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Plus size={15} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}

// ── Availability sticker ─────────────────────────────────────────────────────
function AvailabilitySticker({
  dateRangeValid,
  availability,
  availOk,
}: {
  dateRangeValid: boolean
  availability: RentalAvailability | null | undefined
  availOk: boolean | null
}) {
  if (!dateRangeValid) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11.5px] font-bold text-[#4b3a63]">
        <CalendarDays size={11} strokeWidth={2.4} />
        Pick dates
      </span>
    )
  }
  if (!availability) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11.5px] font-semibold text-[#4b3a63]">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-[#7126e3]" />
        Checking…
      </span>
    )
  }
  if (availOk) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-800">
        <CheckCircle2 size={11} strokeWidth={2.4} />
        {availability.availableQuantity} available
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11.5px] font-bold text-red-800">
      <AlertTriangle size={11} strokeWidth={2.4} />
      Only {availability.availableQuantity} available for these dates
    </span>
  )
}

// ── Rental item card ─────────────────────────────────────────────────────────
function RentalItemCard({
  item,
  index,
  total,
  perItem,
  startDate,
  endDate,
  days,
  dateRangeValid,
  minDaysMissed,
  availability,
  availOk,
  lineTotal,
  motionEnabled,
  onQty,
  onDates,
  onRemove,
}: {
  item: RentalCartItem
  index: number
  total: number
  perItem: boolean
  startDate: string
  endDate: string
  days: number
  dateRangeValid: boolean
  minDaysMissed: boolean
  availability: RentalAvailability | null | undefined
  availOk: boolean | null
  lineTotal: number
  motionEnabled: boolean
  onQty: (next: number) => void
  onDates: (start: string, end: string) => void
  onRemove: () => void
}) {
  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 14 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={motionEnabled ? { duration: 0.4, ease, delay: index * 0.05 } : undefined}
      className="rounded-[18px] border border-violet-100 bg-white p-4 shadow-[0_4px_20px_rgba(124,58,237,0.05)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6b5a82]">
          Item {index + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.productTitle}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3 flex gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border border-violet-100 bg-violet-50">
          {item.productImage ? (
            <FramedImage
              media={item.productImage}
              alt={item.productTitle}
              width={160}
              height={160}
              loading="lazy"
              sizes="80px"
              className="h-full w-full object-cover"
              fallbackTransform={{ fit: 'cover' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#7126e3]">
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1.05rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1a0b3d]">
            {item.productTitle}
          </h3>
          <p className="mt-1 text-[12.5px] font-semibold text-[#4b3a63]">
            <span className="font-bold text-[#1a0b3d]">
              {item.unitPrice} {item.currency}/day
            </span>
            <span className="mx-1.5 text-violet-400">·</span>
            min {item.minimumRentalDays} day{item.minimumRentalDays === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <QtyStepper quantity={item.quantity} onChange={onQty} />

        {perItem && (
          <>
            <DateField
              label="Start date"
              value={startDate}
              min={todayISO()}
              onChange={value => onDates(value, endDate)}
            />
            <DateField
              label="End date"
              value={endDate}
              min={startDate || todayISO()}
              onChange={value => onDates(startDate, value)}
            />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11.5px] font-bold text-[#140832]">
          <Clock size={11} strokeWidth={2.4} />
          {days ? `${days} day${days === 1 ? '' : 's'}` : 'No dates'}
        </span>

        {days > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-100/90 px-3 py-1 text-[11.5px] font-extrabold tabular-nums text-[#2e0a72]">
            {days} × {item.quantity} × {item.unitPrice} = {lineTotal.toFixed(2)} {item.currency}
          </span>
        )}

        <AvailabilitySticker
          dateRangeValid={dateRangeValid}
          availability={availability}
          availOk={availOk}
        />
      </div>

      {minDaysMissed && (
        <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] font-semibold text-amber-800">
          <AlertTriangle size={13} strokeWidth={2} className="shrink-0" />
          Minimum {item.minimumRentalDays} day{item.minimumRentalDays === 1 ? '' : 's'} required for this service.
        </div>
      )}
    </motion.div>
  )
}

export default function RentalCartPage() {
  usePageMeta({
    title: 'Rental Request Draft',
    description: 'Review your rental request draft, set event dates, and submit it for review.',
    noIndex: true,
  })

  const reducedMotion = useReducedMotion()
  const motionEnabled = !reducedMotion
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
    [
      rentalCart.items,
      rentalCart.mode,
      rentalCart.sharedStartDate,
      rentalCart.sharedEndDate,
    ]
  )

  const handleCheckout = async () => {
    if (!allItemsReady) {
      await dialog.alert({
        title: 'Complete your request first',
        message: 'Choose valid rental dates for every service before submitting your request.',
        confirmLabel: 'Review Request',
        variant: 'warning',
      })
      return
    }
    if (!isLoggedIn) {
      const canContinue = await requireAuthAction({
        redirectTo: '/checkout',
        title: 'Sign in to submit your request',
        message: 'You can keep building your request draft as a guest, but you need to sign in before submitting it. Your draft will stay saved.',
      })
      if (!canContinue) return
    }
    navigate('/checkout')
  }

  const currency = rentalCart.items[0]?.currency || 'JOD'
  const sharedDatesValid = hasValidDateRange(rentalCart.sharedStartDate, rentalCart.sharedEndDate)
  const readinessMessage = allItemsReady
    ? isLoggedIn
      ? 'All services are ready to submit for review.'
      : 'All services are ready. Sign in to submit the request.'
    : 'Set valid dates for every service before submitting.'

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!hasItems) {
    return (
      <StatusShell>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border border-violet-200 bg-violet-50">
          <ShoppingBag className="h-7 w-7 text-[#7126e3]" strokeWidth={2} />
        </div>
        <span className="section-label justify-center">// Rental Request Draft</span>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] text-[#1a0b3d] sm:text-4xl">
          Your rental request draft is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-[#4b3a63]">
          Browse our event services and start building your request. Pick your dates and we'll
          check availability for you.
        </p>
        <div className="mt-7">
          <Link to="/products" className="btn-primary !rounded-[14px] !px-6 !py-3 !text-sm">
            Browse Services
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </StatusShell>
    )
  }

  return (
    <>
      <section className="site-section pb-28 lg:pb-0">
        <div className="site-container">

          {/* Hero header */}
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 20 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.6, ease } : undefined}
            className="mx-auto mb-10 max-w-3xl text-center"
          >
            <span className="section-label justify-center">// Rental Request Draft</span>
            <h1 className="mt-3 font-display text-3xl font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl">
              <span className="text-glow">Prepare Your Request</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#4b3a63]">
              Set shared event dates for the whole request, or switch to per-item mode. We review
              availability against your selected rental range.
            </p>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
          </motion.div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">

            {/* LEFT — sections */}
            <div className="space-y-8">

              {/* 01 — EVENT DATES */}
              <CartSection
                index="01"
                eyebrow="EVENT DATES"
                title="When is your event?"
                description="Apply one date range to every item, or set dates per item."
                motionEnabled={motionEnabled}
              >
                <div className="grid grid-cols-2 gap-1.5 rounded-[16px] border border-violet-100 bg-violet-50/50 p-1">
                  {[
                    { mode: 'shared' as const, label: 'Shared dates for all' },
                    { mode: 'per_item' as const, label: 'Per-item dates' },
                  ].map(({ mode, label }) => {
                    const active = rentalCart.mode === mode
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => rentalCart.setMode(mode)}
                        className={
                          'min-h-[42px] rounded-[12px] px-4 py-2.5 text-[12.5px] font-bold transition ' +
                          (active
                            ? 'border border-violet-200 bg-white text-[#1a0b3d] shadow-[0_4px_14px_-4px_rgba(89,23,196,0.28)]'
                            : 'text-[#6b5a82] hover:text-[#1a0b3d]')
                        }
                        aria-pressed={active}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence initial={false} mode="wait">
                  {rentalCart.mode === 'shared' && (
                    <motion.div
                      key="shared-dates"
                      initial={motionEnabled ? { opacity: 0, height: 0 } : false}
                      animate={motionEnabled ? { opacity: 1, height: 'auto' } : undefined}
                      exit={motionEnabled ? { opacity: 0, height: 0 } : undefined}
                      transition={motionEnabled ? { duration: 0.28, ease } : undefined}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DateField
                          label="Start date"
                          value={rentalCart.sharedStartDate}
                          min={todayISO()}
                          onChange={value => rentalCart.setSharedDates(value, rentalCart.sharedEndDate)}
                        />
                        <DateField
                          label="End date"
                          value={rentalCart.sharedEndDate}
                          min={rentalCart.sharedStartDate || todayISO()}
                          onChange={value => rentalCart.setSharedDates(rentalCart.sharedStartDate, value)}
                        />
                      </div>
                      <div className="mt-3">
                        {sharedDatesValid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-100/90 px-3 py-1 text-[11.5px] font-bold text-[#2e0a72]">
                            <Clock size={11} strokeWidth={2.4} />
                            {Math.max(
                              1,
                              Math.round(
                                (new Date(rentalCart.sharedEndDate).getTime() -
                                  new Date(rentalCart.sharedStartDate).getTime()) /
                                  86400000
                              ) + 1
                            )}{' '}
                            day range applied to all items
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11.5px] font-semibold text-[#4b3a63]">
                            <CalendarDays size={11} strokeWidth={2.4} />
                            Pick a start and end date
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CartSection>

              {/* 02 — ITEMS */}
              <CartSection
                index="02"
                eyebrow="ITEMS"
                title="Your selected services"
                description={
                  rentalCart.mode === 'per_item'
                    ? 'Set dates per item and adjust quantities.'
                    : 'Adjust quantities. Dates come from the shared range above.'
                }
                motionEnabled={motionEnabled}
                delay={0.08}
              >
                <div className="space-y-4">
                  {rentalCart.items.map((item, idx) => {
                    const { startDate, endDate } = rentalCart.getItemDates(item)
                    const days = rentalCart.getItemDays(item)
                    const availability = availabilityMap[item.productSlug]
                    const dateRangeValid = hasValidDateRange(startDate, endDate)
                    const minDaysMissed = dateRangeValid && days < item.minimumRentalDays
                    const availOk = availability
                      ? availability.availableQuantity >= item.quantity
                      : null

                    return (
                      <RentalItemCard
                        key={item.productSlug}
                        item={item}
                        index={idx}
                        total={rentalCart.items.length}
                        perItem={rentalCart.mode === 'per_item'}
                        startDate={startDate}
                        endDate={endDate}
                        days={days}
                        dateRangeValid={dateRangeValid}
                        minDaysMissed={minDaysMissed}
                        availability={availability}
                        availOk={availOk}
                        lineTotal={rentalCart.getItemLineTotal(item)}
                        motionEnabled={motionEnabled}
                        onQty={next => rentalCart.updateQuantity(item.productSlug, next)}
                        onDates={(start, end) => rentalCart.setItemDates(item.productSlug, start, end)}
                        onRemove={() => rentalCart.removeItem(item.productSlug)}
                      />
                    )
                  })}
                </div>
              </CartSection>
            </div>

            {/* RIGHT — summary (order-last on mobile, sticky on desktop) */}
            <motion.aside
              initial={motionEnabled ? { opacity: 0, x: 20 } : false}
              animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.55, ease, delay: 0.1 } : undefined}
              className="order-last xl:order-none"
            >
              <div className="glass !rounded-[22px] p-5 xl:sticky xl:top-24">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7126e3]">
                  Rental Request Draft Summary
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <span className="font-display text-5xl font-black leading-none">
                    <span className="text-glow">{rentalCart.itemCount}</span>
                  </span>
                  <span className="pb-1 text-[0.85rem] font-medium text-[#4b3a63]">
                    item{rentalCart.itemCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-1 text-[0.85rem] text-[#6b5a82]">
                  across {rentalCart.items.length} service{rentalCart.items.length === 1 ? '' : 's'}
                </div>

                {/* Breakdown */}
                <div className="mt-5 max-h-[15rem] divide-y divide-violet-100 overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {rentalCart.items.map(item => (
                    <div key={item.productSlug} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0 truncate text-[0.88rem] font-semibold text-[#1a0b3d]">
                        {item.productTitle}
                      </span>
                      <span className="shrink-0 text-[0.82rem] font-medium tabular-nums text-[#6b5a82]">
                        {item.quantity} × {item.unitPrice} {item.currency}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="mt-4 rounded-[16px] border border-violet-200 bg-violet-50/70 p-4">
                  <div className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[#2e0a72]">
                    Estimated total
                  </div>
                  <div className="mt-1.5 font-display text-[2.1rem] font-black leading-none tabular-nums tracking-[-0.04em] text-[#07041a]">
                    {rentalCart.grandTotal.toFixed(2)}{' '}
                    <span className="text-[1.1rem] font-bold text-[#4b3a63]">{currency}</span>
                  </div>
                  <div className="mt-1 text-[11.5px] font-semibold text-[#4b3a63]">
                    {allItemsReady ? 'Based on current day rates; final pricing is reviewed before confirmation' : 'Set dates to see the full estimate'}
                  </div>
                </div>

                {/* Readiness */}
                <div
                  className={
                    'mt-4 flex items-start gap-2.5 rounded-[14px] border px-3.5 py-3 text-[12.5px] font-semibold leading-[1.6] ' +
                    (allItemsReady
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-amber-300 bg-amber-50 text-amber-900')
                  }
                >
                  {allItemsReady ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  )}
                  <span>{readinessMessage}</span>
                </div>

                {/* CTAs */}
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => void handleCheckout()}
                    disabled={!allItemsReady}
                    title={!allItemsReady ? readinessMessage : undefined}
                    className="btn-primary !w-full !rounded-[14px] !py-3 !text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoggedIn ? 'Submit Rental Request' : 'Sign In to Submit'}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <Link
                    to="/products"
                    className="btn-outline !w-full !rounded-[14px] !py-2.5 !text-[12px]"
                  >
                    Keep Browsing
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Mobile sticky footer */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(89,23,196,0.08)] backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {allItemsReady ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b5a82]">
                  Total
                </div>
                <div className="font-display text-[1.15rem] font-black tabular-nums leading-tight text-[#07041a]">
                  {rentalCart.grandTotal.toFixed(2)}{' '}
                  <span className="text-[0.85rem] font-bold text-[#4b3a63]">{currency}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-700">
                <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0" />
                Set dates to see total
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={!allItemsReady}
            title={!allItemsReady ? readinessMessage : undefined}
            className="btn-primary !shrink-0 !whitespace-nowrap !rounded-[14px] !px-5 !py-2.5 !text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggedIn ? 'Continue' : 'Sign In'}
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </>
  )
}
