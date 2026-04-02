import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RequestContactFields from '../components/requests/RequestContactFields'
import { useDialog } from '../contexts/DialogContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { createRentalRequest } from '../services/rental-requests.service'
import { usePageMeta } from '../hooks/usePageMeta'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { buildInitialRequestForm, hasValidDateRange } from '../utils/commerce'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function CheckoutPage() {
  usePageMeta({
    title: 'Checkout',
    description: 'Complete your rental request and submit it for review.',
    noIndex: true,
  })

  const { isDark } = useTheme()
  const dialog = useDialog()
  const requireAuthAction = useRequireAuthAction()
  const { currentUser, isLoggedIn } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
  const rentalCart = useRentalCart()
  const [form, setForm] = useState(() => buildInitialRequestForm(currentUser || undefined))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(current => ({
      ...current,
      ...buildInitialRequestForm(currentUser || undefined),
      companyName: current.companyName,
      city: current.city,
      address: current.address,
      eventName: current.eventName,
      notes: current.notes,
    }))
  }, [currentUser])

  const validationMessage = useMemo(() => {
    if (!rentalCart.items.length) return 'Your rental cart is empty.'
    if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim()) return 'Please complete your contact details.'
    if (!form.city.trim() || !form.address.trim()) return 'City and address are required.'

    for (const item of rentalCart.items) {
      const { startDate, endDate } = rentalCart.getItemDates(item)
      if (!item.productId) return `Product id is missing for ${item.productTitle}.`
      if (!hasValidDateRange(startDate, endDate)) return `Choose valid rental dates for ${item.productTitle}.`
      if (rentalCart.getItemDays(item) < item.minimumRentalDays) {
        return `${item.productTitle} requires at least ${item.minimumRentalDays} rental day(s).`
      }
    }

    return ''
  }, [form, rentalCart])

  const submit = async () => {
    const canContinue = await requireAuthAction({
      redirectTo: '/checkout',
      title: 'Sign in to confirm your rental request',
      message:
        'You need to sign in before we can submit this rental request. Your cart will stay saved and you will return here after login.',
    })
    if (!canContinue) return

    if (validationMessage) {
      toast(validationMessage, 'error')
      return
    }

    setSaving(true)
    try {
      const response = await createRentalRequest({
        ...form,
        extraFees: 0,
        items: rentalCart.items.map(item => {
          const { startDate, endDate } = rentalCart.getItemDates(item)
          return {
            productId: item.productId as string,
            quantity: item.quantity,
            rentalStartDate: startDate,
            rentalEndDate: endDate,
          }
        }),
      })

      rentalCart.clearCart()
      toast('Rental request submitted successfully.', 'success')
      navigate(`/order-summary/${response.requestNumber}`)
    } catch (error: any) {
      toast(error?.message || 'Could not submit rental request.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!rentalCart.items.length) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Checkout
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              There are no rental items to submit yet.
            </p>
            <div className="mt-6">
              <Link to="/rental-cart" className="btn-primary !rounded-xl !px-5 !py-3 !text-sm">
                Go to Rental Cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Sign in to Continue
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Sign in or create an account to complete this rental request and track it later from My Requests. Your cart will stay saved on this device.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/rental-cart" className="btn-outline !rounded-xl !px-5 !py-3 !text-sm">
                Back to Rental Cart
              </Link>
              <button
                type="button"
                onClick={() =>
                  void dialog
                    .alert({
                      title: 'Sign in to continue',
                      message:
                        'Please sign in first. Your rental cart will stay saved and you will return to checkout right after login.',
                      confirmLabel: 'Go to Login',
                      variant: 'info',
                    })
                    .then(() => navigate(`/login?redirect=${encodeURIComponent('/checkout')}`))
                }
                className="btn-primary !rounded-xl !px-5 !py-3 !text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-6">
          <span className="section-label">// Checkout</span>
          <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>Confirm Your Rental Request</h1>
          <p className={cn('mt-2 max-w-2xl text-sm leading-6', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
            Review your items, complete your contact details, and submit the rental request for admin approval.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <RequestContactFields
              form={form}
              showEventName
              onChange={(field, value) => setForm(current => ({ ...current, [field]: value }))}
            />

            {validationMessage && (
              <div className={cn('mt-4 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-700')}>
                {validationMessage}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Link to="/rental-cart" className="btn-outline !rounded-xl !px-5 !py-3 !text-sm">
                Back to Cart
              </Link>
              <button type="button" onClick={submit} disabled={saving || !!validationMessage} className="btn-primary !rounded-xl !px-5 !py-3 !text-sm disabled:opacity-50">
                {saving ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </div>

          <div className={cn('h-fit rounded-[20px] border p-4 xl:sticky xl:top-24', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <div className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
              Order Preview
            </div>
            <div className="mt-4 space-y-3">
              {rentalCart.items.map(item => {
                const { startDate, endDate } = rentalCart.getItemDates(item)
                return (
                  <div key={item.productSlug} className={cn('rounded-xl border px-4 py-3', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{item.productTitle}</div>
                    <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {item.quantity} x {item.unitPrice} {item.currency}/day
                    </div>
                    <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {startDate || '-'}
                      {' -> '}
                      {endDate || '-'}
                      {' | '}
                      {rentalCart.getItemDays(item)} day(s)
                    </div>
                    <div className={cn('mt-2 text-sm font-semibold', isDark ? 'text-cyan-200' : 'text-violet-700')}>
                      {rentalCart.getItemLineTotal(item).toFixed(2)} {item.currency}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={cn('mt-5 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-[#0d1430]/88 text-cyan-100' : 'bg-violet-50 text-violet-700')}>
              Grand total: {rentalCart.grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

