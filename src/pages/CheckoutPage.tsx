import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { allCountries } from 'country-region-data'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  LockKeyhole,
  MapPin,
  ShoppingCart,
  UserRound,
} from 'lucide-react'
import { useDialog } from '../contexts/DialogContext'
import { useRentalCart } from '../contexts/RentalCartContext'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { createRentalRequest } from '../services/rental-requests.service'
import { usePageMeta } from '../hooks/usePageMeta'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { buildInitialRequestForm, hasValidDateRange } from '../utils/commerce'
import { getErrorMessage } from '../lib/errors'
import { cn } from '../utils/cn'
import FramedImage from '../components/ui/FramedImage'

const cardShell =
  'rounded-[22px] border border-violet-200/70 bg-white shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)]'

// ── Country / region options (same behavior as the contact page) ────────────
type LocationOption = { value: string; label: string }

const DEFAULT_COUNTRY_CODE = 'JO'
const DEFAULT_REGION = 'Amman Governorate'

const REGION_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  JO: {
    AJ: 'Ajloun Governorate',
    AM: 'Amman Governorate',
    AQ: 'Aqaba Governorate',
    AT: 'Tafilah Governorate',
    AZ: 'Zarqa Governorate',
    BA: 'Balqa Governorate',
    IR: 'Irbid Governorate',
    JA: 'Jerash Governorate',
    KA: 'Karak Governorate',
    MA: 'Mafraq Governorate',
    MD: 'Madaba Governorate',
    MN: "Ma'an Governorate",
  },
}

const getCountryOptions = (): LocationOption[] =>
  allCountries
    .map(([countryName, countryCode]) => ({ value: countryCode, label: countryName }))
    .sort((a, b) => a.label.localeCompare(b.label))

const getRegionOptions = (countryCode: string): LocationOption[] => {
  const country = allCountries.find(([, code]) => code === countryCode)
  const regionOverrides = REGION_LABEL_OVERRIDES[countryCode] || {}

  return (country?.[2] || [])
    .map(([regionName, regionCode]) => {
      const label = regionOverrides[regionCode] || regionName
      return { value: label, label }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

// ── Shared field styling (matches the contact form) ─────────────────────────
const labelClass = 'mb-2 block text-[12.5px] font-bold leading-none tracking-[-0.01em] text-ink-800'
const hintClass = 'mt-2 text-[11.5px] font-semibold leading-5 text-violet-600'
const fieldClass =
  'form-field !min-h-[50px] !rounded-[16px] !border-violet-200/85 !bg-white/95 !px-4 !py-3 !text-[13.5px] !font-semibold !text-ink-900 !shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-[border-color,box-shadow] duration-200 placeholder:!text-ink-400/70 focus:!border-violet-400 focus:!shadow-[0_0_0_4px_rgba(124,58,237,0.10)]'
const sectionTitleClass = 'text-[13px] font-black uppercase tracking-[0.14em] text-ink-900'
const sectionCaptionClass = 'mt-1 text-[12px] leading-5 text-ink-500'
const sectionIconClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-violet-50 text-violet-700 ring-1 ring-violet-200/80'

function FormSection({
  icon: Icon,
  title,
  caption,
  children,
}: {
  icon: typeof UserRound
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <section className="py-5 first:pt-0 last:pb-0 sm:py-6">
      <div className="mb-5 flex items-start gap-3">
        <span className={sectionIconClass}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <h3 className={sectionTitleClass}>{title}</h3>
          <p className={sectionCaptionClass}>{caption}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function CheckoutPage() {
  usePageMeta({
    title: 'Submit Request',
    description: 'Complete your rental request and submit it for review.',
    noIndex: true,
  })

  const dialog = useDialog()
  const requireAuthAction = useRequireAuthAction()
  const { currentUser, isLoggedIn } = useUser()
  const { toast } = useToast()
  const navigate = useNavigate()
  const rentalCart = useRentalCart()
  const currency = rentalCart.items[0]?.currency || 'JOD'
  const [form, setForm] = useState(() => ({
    ...buildInitialRequestForm(currentUser || undefined),
    city: DEFAULT_REGION,
  }))
  const [country, setCountry] = useState(DEFAULT_COUNTRY_CODE)
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

  const countryOptions = useMemo(() => getCountryOptions(), [])
  const regionOptions = useMemo(() => getRegionOptions(country), [country])
  const selectedCountryName = countryOptions.find(option => option.value === country)?.label || country

  const update = <K extends keyof typeof form>(field: K, value: string) =>
    setForm(current => ({ ...current, [field]: value }))

  const updateCountry = (countryCode: string) => {
    const nextRegions = getRegionOptions(countryCode)
    setCountry(countryCode)
    setForm(current => ({ ...current, city: nextRegions[0]?.value || '' }))
  }

  const validationMessage = useMemo(() => {
    if (!rentalCart.items.length) return 'Your rental request draft is empty.'
    if (!form.customerName.trim() || !form.email.trim() || !form.phone.trim()) return 'Please complete your contact details.'
    if (!form.city.trim() || !form.address.trim()) return 'City and address are required.'

    for (const item of rentalCart.items) {
      const { startDate, endDate } = rentalCart.getItemDates(item)
      if (!item.productId) return `Service id is missing for ${item.productTitle}.`
      if (!hasValidDateRange(startDate, endDate)) return `Choose valid rental dates for ${item.productTitle}.`
      if (rentalCart.getItemDays(item) < item.minimumRentalDays) {
        return `${item.productTitle} requires at least ${item.minimumRentalDays} rental day(s).`
      }
    }

    return ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, rentalCart.items, rentalCart.mode, rentalCart.sharedStartDate, rentalCart.sharedEndDate])

  const submit = async () => {
    const canContinue = await requireAuthAction({
      redirectTo: '/checkout',
      title: 'Sign in to submit your rental request',
      message:
        'You need to sign in before we can submit this rental request. Your request draft will stay saved and you will return here after login.',
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
        city: [form.city.trim(), selectedCountryName].filter(Boolean).join(', '),
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
        <div className="site-container">
          <div className={cn(cardShell, 'mx-auto max-w-2xl p-7 text-center sm:p-9')}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/80">
              <ShoppingCart size={20} strokeWidth={2.2} />
            </span>
            <h1 className="mt-4 font-display text-[1.7rem] font-black tracking-[-0.03em] text-ink-900">
              Nothing to submit yet
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
              Your rental request draft is empty. Add services first, then come back to submit them for review.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/rental-cart" className="btn-outline !rounded-[14px] !px-5 !py-3 !text-[13px]">
                Go to Request Draft
              </Link>
              <Link to="/products" className="btn-primary !rounded-[14px] !px-5 !py-3 !text-[13px]">
                Browse Services
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
        <div className="site-container">
          <div className={cn(cardShell, 'mx-auto max-w-2xl p-7 text-center sm:p-9')}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/80">
              <LockKeyhole size={20} strokeWidth={2.2} />
            </span>
            <h1 className="mt-4 font-display text-[1.7rem] font-black tracking-[-0.03em] text-ink-900">
              Sign in to submit your request
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
              Sign in or create an account to submit this rental request and track it later from My Requests. Your
              request draft stays saved on this device.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/rental-cart" className="btn-outline !rounded-[14px] !px-5 !py-3 !text-[13px]">
                Back to Request Draft
              </Link>
              <button
                type="button"
                onClick={() =>
                  void dialog
                    .alert({
                      title: 'Sign in to continue',
                      message:
                        'Please sign in first. Your rental request draft will stay saved and you will return here right after login.',
                      confirmLabel: 'Go to Login',
                      variant: 'info',
                    })
                    .then(() => navigate(`/login?redirect=${encodeURIComponent('/checkout')}`))
                }
                className="btn-primary !rounded-[14px] !px-5 !py-3 !text-[13px]"
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
        <div className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2.5">
            <span className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400" aria-hidden="true" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">Submit Request</span>
          </div>
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.7rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
            One step away from{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">review</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-ink-600">
            Complete your details and submit the rental request. The Eventies team reviews availability, pricing, and
            delivery before anything is confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Form ── */}
          <div className={cn(cardShell, 'relative overflow-hidden !rounded-[26px] p-4 sm:p-5 lg:p-6')}>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent"
              aria-hidden="true"
            />

            <div className="divide-y divide-violet-100/90">
              <FormSection icon={UserRound} title="Contact details" caption="Name and reachable contact information.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="co-name" className={labelClass}>Full Name *</label>
                    <input
                      id="co-name"
                      className={fieldClass}
                      value={form.customerName}
                      onChange={event => update('customerName', event.target.value)}
                      autoComplete="name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="co-email" className={labelClass}>Email *</label>
                    <input
                      id="co-email"
                      type="email"
                      className={fieldClass}
                      value={form.email}
                      onChange={event => update('email', event.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className={labelClass}>Phone *</label>
                    <input
                      id="co-phone"
                      type="tel"
                      className={fieldClass}
                      value={form.phone}
                      onChange={event => update('phone', event.target.value)}
                      placeholder="+962..."
                      autoComplete="tel"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label htmlFor="co-company" className={labelClass}>Company Name</label>
                    <input
                      id="co-company"
                      className={fieldClass}
                      value={form.companyName}
                      onChange={event => update('companyName', event.target.value)}
                      autoComplete="organization"
                      maxLength={120}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection icon={CalendarDays} title="Event details" caption="What this request is for.">
                <div>
                  <label htmlFor="co-event" className={labelClass}>Event Name</label>
                  <input
                    id="co-event"
                    className={fieldClass}
                    value={form.eventName}
                    onChange={event => update('eventName', event.target.value)}
                    placeholder="e.g. Company family day, brand activation..."
                    maxLength={140}
                  />
                </div>
              </FormSection>

              <FormSection icon={MapPin} title="Location and notes" caption="Where the services are needed and anything the team should know.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label htmlFor="co-country" className={labelClass}>Country</label>
                    <select
                      id="co-country"
                      className={fieldClass}
                      value={country}
                      onChange={event => updateCountry(event.target.value)}
                      autoComplete="country-name"
                    >
                      {countryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="co-city" className={labelClass}>City / Governorate *</label>
                    {regionOptions.length > 0 ? (
                      <>
                        <select
                          id="co-city"
                          className={fieldClass}
                          value={form.city}
                          onChange={event => update('city', event.target.value)}
                          autoComplete="address-level1"
                        >
                          {regionOptions.map(region => (
                            <option key={region.value} value={region.value}>
                              {region.label}
                            </option>
                          ))}
                        </select>
                        <p className={hintClass}>Showing regions for {selectedCountryName}</p>
                      </>
                    ) : (
                      <input
                        id="co-city"
                        className={fieldClass}
                        value={form.city}
                        onChange={event => update('city', event.target.value)}
                        placeholder="Type your city"
                        maxLength={100}
                      />
                    )}
                  </div>

                  <div className="md:col-span-2 xl:col-span-1">
                    <label htmlFor="co-address" className={labelClass}>Address / Venue *</label>
                    <input
                      id="co-address"
                      className={fieldClass}
                      value={form.address}
                      onChange={event => update('address', event.target.value)}
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <label htmlFor="co-notes" className={labelClass}>Notes</label>
                    <textarea
                      id="co-notes"
                      rows={4}
                      className={cn(fieldClass, '!min-h-[120px] !leading-7 resize-none')}
                      value={form.notes}
                      onChange={event => update('notes', event.target.value)}
                      maxLength={2000}
                      placeholder="Setup notes, timing, access details, or anything else the team should know."
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {validationMessage && (
              <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] font-semibold leading-6 text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
                <span>{validationMessage}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link to="/rental-cart" className="btn-outline !w-full !rounded-[15px] !px-5 !py-3 !text-[13px] sm:!w-auto">
                <ArrowLeft size={13} className="mr-1.5 inline" />
                Back to Request Draft
              </Link>
              <button
                type="button"
                onClick={submit}
                disabled={saving || !!validationMessage}
                className="btn-primary !w-full !rounded-[15px] !px-6 !py-3 !text-[13px] disabled:opacity-50 sm:!w-auto"
              >
                {saving ? 'Submitting...' : 'Submit Rental Request'}
              </button>
            </div>
          </div>

          {/* ── Summary ── */}
          <aside className={cn(cardShell, 'order-first h-fit overflow-hidden !p-0 xl:order-none xl:sticky xl:top-[calc(var(--app-navbar-height)+1.25rem)]')}>
            <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#faf6ff,#ffffff_55%,#fdf4ff)] px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/70">
                  <ClipboardList size={14} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="text-[13px] font-black text-ink-900">Request Summary</div>
                  <div className="text-[10.5px] font-semibold text-ink-400">
                    {rentalCart.items.length} service{rentalCart.items.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 p-4">
              {rentalCart.items.map(item => {
                const { startDate, endDate } = rentalCart.getItemDates(item)
                return (
                  <div key={item.productSlug} className="flex gap-3 rounded-[15px] border border-violet-100 bg-violet-50/40 p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-white ring-1 ring-violet-200/60">
                      {item.productImage ? (
                        <FramedImage
                          media={item.productImage}
                          preset="tiny"
                          alt={item.productTitle}
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                          onError={event => {
                            ;(event.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ShoppingCart size={15} className="text-violet-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-black text-ink-900">{item.productTitle}</div>
                      <div className="mt-0.5 text-[10.5px] font-semibold text-ink-500">
                        {item.quantity} × {item.unitPrice} {item.currency}/day
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10.5px] font-semibold text-ink-400">
                        <CalendarDays size={10} className="text-violet-400" />
                        {startDate || '—'} → {endDate || '—'}
                        <span className="text-ink-300">·</span>
                        {rentalCart.getItemDays(item)} day(s)
                      </div>
                      <div className="mt-1 text-[12px] font-black text-violet-700">
                        {rentalCart.getItemLineTotal(item).toFixed(2)} {item.currency}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between rounded-[15px] bg-[linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)] px-4 py-3.5 shadow-[0_14px_32px_-18px_rgba(124,58,237,0.6)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">Estimated Total</span>
                <span className="font-display text-[1.2rem] font-black text-white">
                  {rentalCart.grandTotal.toFixed(2)} <span className="text-[0.8rem] font-bold text-white/80">{currency}</span>
                </span>
              </div>
              <p className="mt-3 text-[10.75px] leading-[1.6] text-ink-400">
                Estimate based on current day rates. Final pricing, availability, and setup details are confirmed by the
                Eventies team after review.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
