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
import { getErrorMessage } from '../lib/errors'
import { cn } from '../utils/cn'

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
  const currency = rentalCart.items[0]?.currency || 'JOD'
  const [form, setForm] = useState(() => buildInitialRequestForm(currentUser || undefined))
  const [saving, setSaving] = useState(false)

  const [contactSynced, setContactSynced] = useState(false)

  useEffect(() => {
    if (contactSynced || !currentUser) return
    setForm(current => ({
      ...current,
      customerName: current.customerName || currentUser.name || '',
      email: current.email || currentUser.email || '',
      phone: current.phone || currentUser.phone || '',
    }))
    setContactSynced(true)
  }, [currentUser, contactSynced])

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
  }, [form, rentalCart.items, rentalCart.mode, rentalCart.sharedStartDate, rentalCart.sharedEndDate])

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
    } catch (error: unknown) {
      toast(getErrorMessage(error, 'Could not submit rental request.'), 'error')
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
          <p className={cn('mt-2.5 max-w-2xl text-[0.95rem] leading-6.5', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
            Review your items, complete your contact details, and submit the rental request for admin approval.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className={cn('rounded-[22px] border p-4.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <RequestContactFields
              form={form}
              showEventName
              onChange={(field, value) => setForm(current => ({ ...current, [field]: value }))}
            />

            {validationMessage && (
              <div className={cn('mt-4 rounded-[14px] px-4 py-3.5 text-[0.92rem] leading-5.5', isDark ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-700')}>
                {validationMessage}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link to="/rental-cart" className="btn-outline !w-full !rounded-[14px] !px-5 !py-3 !text-[0.95rem] sm:!w-auto">
                Back to Cart
              </Link>
              <button type="button" onClick={submit} disabled={saving || !!validationMessage} className="btn-primary !w-full !rounded-[14px] !px-5 !py-3 !text-[0.95rem] disabled:opacity-50 sm:!w-auto">
                {saving ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </div>

          <div className={cn('order-first h-fit rounded-[22px] border p-4 xl:order-none xl:sticky xl:top-28', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
              Order Preview
            </div>
            <div className="mt-4 space-y-3.5">
              {rentalCart.items.map(item => {
                const { startDate, endDate } = rentalCart.getItemDates(item)
                return (
                  <div key={item.productSlug} className={cn('rounded-[15px] border px-4 py-3.5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{item.productTitle}</div>
                    <div className={cn('mt-1.5 text-[0.92rem]', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {item.quantity} x {item.unitPrice} {item.currency}/day
                    </div>
                    <div className={cn('mt-1.5 text-[0.92rem]', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {startDate || '-'}
                      {' -> '}
                      {endDate || '-'}
                      {' | '}
                      {rentalCart.getItemDays(item)} day(s)
                    </div>
                    <div className={cn('mt-2.5 text-[0.95rem] font-semibold', isDark ? 'text-cyan-200' : 'text-violet-700')}>
                      {rentalCart.getItemLineTotal(item).toFixed(2)} {item.currency}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={cn('mt-5 rounded-[14px] px-4 py-3.5', isDark ? 'bg-[#0d1430]/88 text-cyan-100' : 'bg-violet-50 text-violet-700')}>
              <div className="text-[0.95rem] font-semibold">
                Estimated total: {rentalCart.grandTotal.toFixed(2)} {currency}
              </div>
              <div className={cn('mt-1 text-[11.5px] font-medium leading-5', isDark ? 'text-cyan-100/70' : 'text-violet-700/75')}>
                Estimate based on current day rates. The final price is calculated by the
                database and shown on your order summary after you confirm.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

