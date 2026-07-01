import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, FileText, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import RequestContactFields from '../components/requests/RequestContactFields'
import FramedImage from '../components/ui/FramedImage'
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
import { getErrorMessage } from '../lib/errors'
import { cn } from '../utils/cn'

const ease = [0.16, 1, 0.3, 1] as const

// ── Reusable form-section wrapper (local to this page) ───────────────────────
function QuoteSection({
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

// ── Centered status shell (empty / not-signed-in) ────────────────────────────
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

export default function PurchaseQuotePage() {
  usePageMeta({
    title: 'Purchase Quote Request',
    description:
      'Request pricing for eligible services, items, or custom builds you would like to purchase. The Eventies team reviews scope, availability, delivery or shipping, and final pricing before confirmation.',
    noIndex: true,
  })

  const reducedMotion = useReducedMotion()
  const motionEnabled = !reducedMotion
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
    if (!purchaseQuote.items.length) return 'Your purchase quote request draft is empty.'
    if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim()) return 'Please complete your contact details.'
    if (!form.city.trim() || !form.address.trim()) return 'City and address are required.'
    if (purchaseQuote.items.some(item => !item.productId)) return 'One or more services are missing a valid id.'
    return ''
  }, [form, purchaseQuote.items])

  const submit = async () => {
    const canContinue = await requireAuthAction({
      redirectTo: '/purchase-quote',
      title: 'Sign in to submit your purchase quote request',
      message:
        'You need to sign in before we can submit this purchase quote request. Your selected services will stay saved on this device.',
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
      toast('Purchase quote request submitted successfully.', 'success')
      navigate(`/my-requests/${response.requestNumber}`)
    } catch (error: unknown) {
      toast(getErrorMessage(error, 'Could not submit purchase quote request.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Empty draft ────────────────────────────────────────────────────────────
  if (!purchaseQuote.items.length) {
    return (
      <StatusShell>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border border-violet-200 bg-violet-50">
          <FileText className="h-7 w-7 text-[#7126e3]" strokeWidth={2} />
        </div>
        <span className="section-label justify-center">// Purchase Quote Request</span>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] text-[#1a0b3d] sm:text-4xl">
          Your request draft is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-[#4b3a63]">
          Add eligible services from the catalog to prepare a purchase quote request. Drafts stay on this device until you submit them.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link to="/products" className="btn-primary !rounded-[14px] !px-6 !py-3 !text-sm">
            Browse Services
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          {rentalCart.itemCount > 0 && (
            <Link
              to="/rental-cart"
              className="btn-outline !rounded-[12px] !px-4 !py-2 !text-[12px]"
            >
              <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
              You have {rentalCart.itemCount} item{rentalCart.itemCount === 1 ? '' : 's'} in your rental request draft
            </Link>
          )}
        </div>
      </StatusShell>
    )
  }

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <StatusShell>
        <span className="section-label justify-center">// Purchase Quote Request</span>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] text-[#1a0b3d] sm:text-4xl">
          Sign in to submit your purchase quote request
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-7 text-[#4b3a63]">
          Sign in or create an account to submit this purchase quote request and track updates from My Requests later. Your request draft stays saved on this device.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/products" className="btn-outline !rounded-[14px] !px-5 !py-3 !text-sm">
            Back to Services
          </Link>
          <button
            type="button"
            onClick={() =>
              void dialog
                .alert({
                  title: 'Sign in to continue',
                  message:
                    'Please sign in first. Your purchase quote request draft will stay saved and you will return here right after login.',
                  confirmLabel: 'Go to Login',
                  variant: 'info',
                })
                .then(() => navigate(`/login?redirect=${encodeURIComponent('/purchase-quote')}`))
            }
            className="btn-primary !rounded-[14px] !px-5 !py-3 !text-sm"
          >
            Sign In
          </button>
        </div>
      </StatusShell>
    )
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <section className="site-section">
      <div className="site-container">

        {/* Hero header */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : false}
          animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
          transition={motionEnabled ? { duration: 0.6, ease } : undefined}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <span className="section-label justify-center">// Purchase Quote Request</span>
          <h1 className="mt-3 font-display text-3xl font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl">
            <span className="text-glow">Purchase Quote Request</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#4b3a63]">
            Request pricing for eligible services, items, or custom builds you would like to purchase. The Eventies team reviews scope, availability, delivery or shipping, and final pricing before confirmation.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* LEFT — form column */}
          <div className="space-y-8">

            {/* 01 — ITEMS */}
            <QuoteSection
              index="01"
              eyebrow="ITEMS"
              title="Request draft services"
              description="Adjust quantities or remove services. Each item can carry its own note."
              motionEnabled={motionEnabled}
            >
              <div className="divide-y divide-violet-100">
                {purchaseQuote.items.map(item => (
                  <div key={item.productSlug} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-violet-100 bg-violet-50">
                      {item.productImage ? (
                        <FramedImage
                          media={item.productImage}
                          alt={item.productTitle}
                          width={128}
                          height={128}
                          loading="lazy"
                          sizes="64px"
                          className="h-full w-full object-cover"
                          fallbackTransform={{ fit: 'cover' }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#7126e3]">
                          <FileText className="h-5 w-5" strokeWidth={2} />
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-display text-[1rem] font-bold text-[#1a0b3d]">
                            {item.productTitle}
                          </div>
                          <div className="mt-0.5 truncate font-mono text-[11px] text-[#6b5a82]">
                            {item.productSlug}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => purchaseQuote.removeItem(item.productSlug)}
                          aria-label={`Remove ${item.productTitle}`}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                        {/* Qty stepper */}
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#4b3a63]">
                            Quantity
                          </label>
                          <div className="inline-flex items-center rounded-[12px] border border-violet-200 bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                              onClick={() => purchaseQuote.updateQuantity(item.productSlug, item.quantity - 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-l-[12px] text-[#1a0b3d] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Minus size={15} strokeWidth={2.4} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={event =>
                                purchaseQuote.updateQuantity(
                                  item.productSlug,
                                  Number(event.target.value) || 1
                                )
                              }
                              onBlur={event => {
                                const next = Math.max(1, Math.min(999, Number(event.target.value) || 1))
                                purchaseQuote.updateQuantity(item.productSlug, next)
                              }}
                              className="h-10 w-14 border-x border-violet-200 bg-transparent text-center text-[14px] font-bold tabular-nums text-[#1a0b3d] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= 999}
                              onClick={() => purchaseQuote.updateQuantity(item.productSlug, item.quantity + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-r-[12px] text-[#1a0b3d] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus size={15} strokeWidth={2.4} />
                            </button>
                          </div>
                        </div>

                        {/* Service note */}
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#4b3a63]">
                            Service note
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Optional note for the Eventies team..."
                            className="form-field resize-none"
                            value={item.note}
                            onChange={event => purchaseQuote.updateNote(item.productSlug, event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Link to="/products" className="btn-outline !rounded-[12px] !px-4 !py-2 !text-[12px]">
                  Add more services
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    purchaseQuote.clearDraft()
                    toast('Purchase quote request draft cleared from this device.', 'success')
                  }}
                  className="btn-outline !rounded-[12px] !px-4 !py-2 !text-[12px]"
                >
                  Clear draft
                </button>
              </div>
            </QuoteSection>

            {/* 02 — CONTACT & DELIVERY */}
            <QuoteSection
              index="02"
              eyebrow="CONTACT & REQUEST DETAILS"
              title="Where should the Eventies team reach you?"
              description="The Eventies team uses these details to review and follow up on your request."
              motionEnabled={motionEnabled}
              delay={0.08}
            >
              <RequestContactFields
                form={form}
                onChange={(field, value) => setForm(current => ({ ...current, [field]: value }))}
              />
            </QuoteSection>
          </div>

          {/* RIGHT — sticky summary */}
          <motion.aside
            initial={motionEnabled ? { opacity: 0, x: 20 } : false}
            animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.55, ease, delay: 0.1 } : undefined}
            className="order-first xl:order-none"
          >
            <div className="glass !rounded-[22px] p-5 xl:sticky xl:top-24">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7126e3]">
                Purchase Quote Request Draft
              </div>

              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-5xl font-black leading-none">
                  <span className="text-glow">{purchaseQuote.itemCount}</span>
                </span>
                <span className="pb-1 text-[0.85rem] font-medium text-[#4b3a63]">
                  total units
                </span>
              </div>
              <div className="mt-1 text-[0.85rem] text-[#6b5a82]">
                across {purchaseQuote.items.length} service{purchaseQuote.items.length === 1 ? '' : 's'}
              </div>

              {/* Breakdown — vertical mini-rows */}
              <div className="mt-5 max-h-[15rem] divide-y divide-violet-100 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {purchaseQuote.items.map(item => (
                  <div key={item.productSlug} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-[0.88rem] font-semibold text-[#1a0b3d]">
                      {item.productTitle}
                    </span>
                    <span className="shrink-0 text-[0.82rem] font-medium tabular-nums text-[#6b5a82]">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[12px] bg-violet-50 px-3.5 py-3 text-[0.8rem] leading-5 text-[#4b3a63]">
                Drafts stay local until you submit. Requests do not reserve inventory or confirm pricing.
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving || !!validationMessage}
                  className="btn-primary !w-full !rounded-[14px] !py-3 !text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Submit Purchase Quote Request
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                    </>
                  )}
                </button>

                {validationMessage && !saving && (
                  <p className="text-center text-[11.5px] font-medium leading-5 text-amber-700">
                    {validationMessage}
                  </p>
                )}

                {rentalCart.itemCount > 0 && (
                  <Link
                    to="/rental-cart"
                    className="btn-outline !w-full !rounded-[14px] !py-2.5 !text-[12px]"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                    Open Rental Request Draft
                  </Link>
                )}
                <Link
                  to="/my-requests"
                  className="block text-center text-[12px] font-semibold text-[#7126e3] transition hover:text-[#1a0b3d]"
                >
                  Go to My Requests
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
