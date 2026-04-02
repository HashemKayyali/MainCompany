import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import RequestContactFields from '../components/requests/RequestContactFields'
import { useDialog } from '../contexts/DialogContext'
import { usePurchaseQuote } from '../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { createPurchaseQuoteRequest } from '../services/purchase-quotes.service'
import { buildInitialRequestForm, combinePurchaseQuoteNotes } from '../utils/commerce'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function PurchaseQuotePage() {
  usePageMeta({
    title: 'Purchase Quote',
    description: 'Review your purchase quote draft and send it to the sales team.',
    noIndex: true,
  })

  const { isDark } = useTheme()
  const dialog = useDialog()
  const requireAuthAction = useRequireAuthAction()
  const { currentUser, isLoggedIn } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
  const purchaseQuote = usePurchaseQuote()
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
      notes: current.notes,
    }))
  }, [currentUser])

  const validationMessage = useMemo(() => {
    if (!purchaseQuote.items.length) return 'Your purchase quote draft is empty.'
    if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim()) return 'Please complete your contact details.'
    if (!form.city.trim() || !form.address.trim()) return 'City and address are required.'
    if (purchaseQuote.items.some(item => !item.productId)) return 'One or more products are missing a valid id.'
    return ''
  }, [form, purchaseQuote.items])

  const submit = async () => {
    const canContinue = await requireAuthAction({
      redirectTo: '/purchase-quote',
      title: 'Sign in to send your purchase quote',
      message:
        'You need to sign in before we can send this purchase quote request. Your selected items will stay saved on this device.',
    })
    if (!canContinue) return

    if (validationMessage) {
      toast(validationMessage, 'error')
      return
    }

    setSaving(true)
    try {
      const response = await createPurchaseQuoteRequest({
        ...form,
        notes: combinePurchaseQuoteNotes(form.notes, purchaseQuote.items),
        items: purchaseQuote.items.map(item => ({
          productId: item.productId as string,
          quantity: item.quantity,
          note: item.note,
        })),
      })

      purchaseQuote.clearDraft()
      toast('Purchase quote request sent successfully.', 'success')
      navigate(`/my-requests/${response.requestNumber}`)
    } catch (error: any) {
      toast(error?.message || 'Could not submit purchase quote request.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!purchaseQuote.items.length) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Purchase Quote
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Your quote draft is empty. Add products from the catalog to prepare a multi-product RFQ.
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

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Sign in to Send Your Quote Request
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Sign in or create an account to send this RFQ and track updates from My Requests later. Your quote draft will stay saved on this device.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="btn-outline !rounded-xl !px-5 !py-3 !text-sm">
                Back to Products
              </Link>
              <button
                type="button"
                onClick={() =>
                  void dialog
                    .alert({
                      title: 'Sign in to continue',
                      message:
                        'Please sign in first. Your purchase quote draft will stay saved and you will return here right after login.',
                      confirmLabel: 'Go to Login',
                      variant: 'info',
                    })
                    .then(() => navigate(`/login?redirect=${encodeURIComponent('/purchase-quote')}`))
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
          <span className="section-label">// Purchase Quote</span>
          <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>Send a Purchase RFQ</h1>
          <p className={cn('mt-2 max-w-2xl text-sm leading-6', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
            Review your selected products, fine-tune quantities, and send the request to the sales team. Until you submit it, this draft is saved locally on this device only.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-fuchsia-400/14 bg-[linear-gradient(180deg,rgba(34,12,45,0.74),rgba(10,10,22,0.94))]' : 'border-fuchsia-200 bg-white')}>
              <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-fuchsia-100/72' : 'text-fuchsia-700/80')}>
                Draft Destination
              </div>
              <h2 className={cn('mt-3 font-display text-[1.2rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
                Saved locally until you send it
              </h2>
              <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
                This quote draft stays on this device and is available from the navbar draft button. After you send it, the submitted request appears in My Requests.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link to="/my-requests" className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                  Go to My Requests
                </Link>
                {rentalCart.itemCount > 0 && (
                  <Link to="/rental-cart" className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                    Open Rental Cart
                  </Link>
                )}
              </div>
            </div>

            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <RequestContactFields
                form={form}
                onChange={(field, value) => setForm(current => ({ ...current, [field]: value }))}
              />

              {validationMessage && (
                <div className={cn('mt-4 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-700')}>
                  {validationMessage}
                </div>
              )}
            </div>

            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Quote Draft Items</div>
              <div className="mt-4 space-y-4">
                {purchaseQuote.items.map(item => (
                  <div key={item.productSlug} className={cn('rounded-[16px] border p-3.5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{item.productTitle}</div>
                        <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/66' : 'text-gray-500')}>{item.productSlug}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => purchaseQuote.removeItem(item.productSlug)}
                        className={cn('inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm', isDark ? 'bg-red-500/10 text-red-200' : 'bg-red-50 text-red-600')}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
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
                          onChange={event => purchaseQuote.updateQuantity(item.productSlug, Number(event.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <label className={cn('mb-1.5 block text-[12px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                          Item Note
                        </label>
                        <textarea
                          rows={3}
                          className="form-field resize-none"
                          value={item.note}
                          onChange={event => purchaseQuote.updateNote(item.productSlug, event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    purchaseQuote.clearDraft()
                    toast('Purchase quote draft cleared from this device.', 'success')
                  }}
                  className="btn-outline !rounded-xl !px-5 !py-3 !text-sm"
                >
                  Clear Draft
                </button>
                <Link to="/products" className="btn-outline !rounded-xl !px-5 !py-3 !text-sm">
                  Add More Products
                </Link>
                <button type="button" onClick={submit} disabled={saving || !!validationMessage} className="btn-primary !rounded-xl !px-5 !py-3 !text-sm disabled:opacity-50">
                  {saving ? 'Submitting...' : 'Send Purchase Quote'}
                </button>
              </div>
            </div>
          </div>

          <div className={cn('h-fit rounded-[20px] border p-4 xl:sticky xl:top-24', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <div className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
              Draft Summary
            </div>
            <div className={cn('mt-2 text-3xl font-display font-black', isDark ? 'text-white' : 'text-gray-900')}>
              {purchaseQuote.itemCount}
            </div>
            <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/65' : 'text-gray-500')}>
              total unit(s) across {purchaseQuote.items.length} selected product(s)
            </div>

            <div className={cn('mt-4 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-gray-50 text-gray-600')}>
              Submitted purchase quotes stay separate from rental approvals and do not reserve inventory. Drafts remain local until you send them.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
