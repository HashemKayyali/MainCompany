import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { allCountries } from 'country-region-data'
import { AlertCircle, CalendarDays, CheckCircle2, Mail, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useRateLimit } from '../../hooks/useRateLimit'
import { validateContactForm, sanitizeInput } from '../../utils/validators'
import { sanitize, buildMailtoUrl, buildWhatsAppUrl } from '../../utils/format'
import { social } from '../../data/social'
import { t } from '../../lib/i18n'
import * as contactApi from '../../services/contact.service'
import { cn } from '../../utils/cn'

/**
 * Classify a failed contact_submissions insert so the UI can react honestly:
 *  - 'rejected' → the server refused the row (rate-limit trigger or a CHECK
 *    constraint). This is deterministic; retrying the same payload won't help,
 *    so we surface the reason and do not claim success.
 *  - 'network'  → a transient/connectivity failure with no server verdict, so
 *    the WhatsApp/email fallback is still worth offering (with a clear "not
 *    saved" notice).
 */
function classifyContactError(
  error: unknown
): { kind: 'rejected' | 'network'; message: string } {
  const candidate = error as {
    code?: string | null
    message?: string | null
    details?: string | null
  }
  const code = candidate?.code || ''
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()

  if (text.includes('rate limit')) {
    return { kind: 'rejected', message: t('contact.rateLimited') }
  }

  // Postgres integrity/constraint violations (class 23) or an explicit
  // RAISE EXCEPTION (P0001) from a trigger = a definite server-side rejection.
  if (/^23/.test(code) || code === 'P0001') {
    return { kind: 'rejected', message: t('contact.rejected') }
  }

  return { kind: 'network', message: '' }
}

const INQUIRY_TYPES = [
  'Rental request',
  'Purchase quote request',
  'Service availability',
  'Corporate event / activation',
  'Provider inquiry',
  'Support / request follow-up',
  'General question',
]

const EVENT_TYPES = [
  'Corporate activation',
  'Exhibition / booth',
  'Private event',
  'University event',
  'Festival / public event',
  'Brand launch',
  'Other',
]

type LocationOption = {
  value: string
  label: string
}

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

export default function ContactForm() {
  const [searchParams] = useSearchParams()
  const preselectedProduct = searchParams.get('product') || ''
  // Split hook (batch 4): the contact form only ensures products.
  const { products } = useProductsData()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const { check: checkRate, remaining } = useRateLimit(3, 60_000)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    eventType: '',
    eventDate: '',
    product: preselectedProduct,
    country: DEFAULT_COUNTRY_CODE,
    city: DEFAULT_REGION,
    address: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!preselectedProduct) return
    setForm(current => ({ ...current, product: preselectedProduct }))
  }, [preselectedProduct])

  const update = (field: string, value: string) => {
    const cleanedValue = sanitizeInput(value, field === 'message' ? 2000 : 200)
    setForm(current => ({ ...current, [field]: cleanedValue }))
    setErrors(current => ({ ...current, [field]: '', _global: '' }))
    if (saved) setSaved(false)
  }

  const countryOptions = useMemo(() => getCountryOptions(), [])
  const regionOptions = useMemo(() => getRegionOptions(form.country), [form.country])
  const selectedCountryName = countryOptions.find(country => country.value === form.country)?.label || form.country
  const cityForSubmission = [form.city, selectedCountryName].filter(Boolean).join(', ')

  const updateCountry = (countryCode: string) => {
    const cleanedCountryCode = sanitizeInput(countryCode, 3).toUpperCase()
    const nextRegions = getRegionOptions(cleanedCountryCode)
    setForm(current => ({
      ...current,
      country: cleanedCountryCode,
      city: nextRegions[0]?.value || '',
    }))
    setErrors(current => ({ ...current, country: '', city: '', _global: '' }))
    if (saved) setSaved(false)
  }

  const validate = (): boolean => {
    const validationErrors = validateContactForm(form)
    const mapped: Record<string, string> = {}
    validationErrors.forEach(error => {
      mapped[error.field] = error.message
    })
    setErrors(mapped)
    return validationErrors.length === 0
  }

  const buildMessage = () => {
    const selectedProduct = products.find(product => product.slug === form.product)

    return [
      'Eventies Inquiry',
      '',
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : '',
      form.inquiryType ? `Inquiry type: ${form.inquiryType}` : '',
      `Service / Request: ${selectedProduct?.name || form.product || 'General inquiry'}`,
      form.eventType ? `Event type: ${form.eventType}` : '',
      form.eventDate ? `Event date: ${form.eventDate}` : '',
      `Country: ${selectedCountryName}`,
      form.city ? `City / Governorate / State: ${form.city}` : '',
      form.address ? `Venue: ${form.address}` : '',
      form.message ? `Notes: ${form.message}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  // Route the email fallback to the official team that matches the inquiry.
  const targetEmail = () => {
    if (form.inquiryType === 'Provider inquiry') return 'vendors@eventiesjo.com'
    if (form.inquiryType === 'Support / request follow-up') return 'support@eventiesjo.com'
    if (form.inquiryType === 'General question') return social.email
    return 'booking@eventiesjo.com'
  }

  const openFallbackChannel = (channel: 'whatsapp' | 'email') => {
    if (channel === 'whatsapp') {
      window.open(buildWhatsAppUrl(social.phone, buildMessage()), '_blank')
      return
    }
    window.open(buildMailtoUrl(targetEmail(), 'Eventies Event Inquiry', buildMessage()), '_blank')
  }

  const submit = async (channel: 'whatsapp' | 'email') => {
    if (!validate()) return

    if (!checkRate()) {
      setErrors({
        _global: t('contact.tooManyRequests', { count: remaining() }),
      })
      toast(t('contact.tooManyRequestsToast'), 'error')
      return
    }

    setSaving(true)
    let savedOk = false
    let failure: ReturnType<typeof classifyContactError> | null = null
    try {
      await contactApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        productSlug: form.product || null,
        city: cityForSubmission,
        address: form.address,
        message: form.message,
      })
      savedOk = true
    } catch (error) {
      failure = classifyContactError(error)
      console.warn('Contact submission failed:', error)
    } finally {
      setSaving(false)
    }

    // Success — only here do we claim the request was saved.
    if (savedOk) {
      setErrors({})
      setSaved(true)
      toast(t('contact.saved'), 'success')
      openFallbackChannel(channel)
      return
    }

    // Server rejected the submission (rate limit / constraint). Do NOT claim
    // success and do NOT silently fall through — show the reason clearly.
    if (failure?.kind === 'rejected') {
      setSaved(false)
      setErrors({ _global: failure.message })
      toast(failure.message, 'error')
      return
    }

    // Transient/network failure. Keep the WhatsApp/email fallback so the user
    // can still reach us, but tell them explicitly it was NOT saved.
    const channelLabel = t(channel === 'whatsapp' ? 'channel.whatsapp' : 'channel.email')
    setSaved(false)
    setErrors({
      _global: t('contact.notSavedBanner', { channel: channelLabel }),
    })
    toast(t('contact.notSavedToast', { channel: channelLabel }), 'info')
    openFallbackChannel(channel)
  }

  const labelClass = cn(
    'mb-2 block text-[12.5px] font-bold leading-none tracking-[-0.01em]',
    isDark ? 'text-purple-100/90' : 'text-ink-800'
  )
  const hintClass = cn('mt-2 text-[11.5px] font-semibold leading-5', isDark ? 'text-violet-200/70' : 'text-violet-600')
  const errorTextClass = 'mt-2 text-[11.5px] font-semibold leading-5 text-red-500'
  const fieldClass = (field?: string) =>
    cn(
      'form-field !min-h-[50px] !rounded-[16px] !px-4 !py-3 !text-[13.5px] !font-semibold !shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:!text-ink-400/70 focus:!border-violet-400 focus:!shadow-[0_0_0_4px_rgba(124,58,237,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]',
      isDark
        ? '!border-white/10 !bg-white/[0.05] !text-white placeholder:!text-purple-100/[0.45]'
        : '!border-violet-200/85 !bg-white/95 !text-ink-900',
      field && errors[field] ? '!border-red-400/70 focus:!border-red-400 focus:!shadow-[0_0_0_4px_rgba(248,113,113,0.12)]' : ''
    )
  const textareaClass = cn(fieldClass('message'), '!min-h-[132px] !leading-7')
  const sectionClass = 'py-5 first:pt-0 last:pb-0 sm:py-6'
  const sectionTitleClass = cn('text-[13px] font-black uppercase tracking-[0.14em]', isDark ? 'text-purple-100' : 'text-ink-900')
  const sectionCaptionClass = cn('mt-1 text-[12px] leading-5', isDark ? 'text-purple-100/60' : 'text-ink-500')
  const sectionIconClass = cn(
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]',
    isDark ? 'bg-violet-400/[0.12] text-violet-200 ring-1 ring-white/10' : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80'
  )
  const panelClass = cn(
    'relative overflow-hidden rounded-[26px] p-4 sm:p-5 lg:p-6',
    isDark
      ? 'border border-white/10 bg-white/[0.06] shadow-[0_22px_58px_-34px_rgba(0,0,0,0.65)]'
      : 'border border-violet-200/80 bg-white/95 shadow-[0_22px_58px_-34px_rgba(89,23,196,0.42),0_1px_2px_rgba(20,8,50,0.04)]'
  )
  const dividerClass = cn('relative divide-y', isDark ? 'divide-white/10' : 'divide-violet-100/90')
  const alertErrorClass = cn(
    'mt-5 flex items-start gap-3 rounded-[16px] border px-4 py-3 text-[12.5px] font-semibold leading-6',
    isDark ? 'border-red-300/20 bg-red-400/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'
  )
  const alertSuccessClass = cn(
    'mt-5 flex items-start gap-3 rounded-[16px] border px-4 py-3 text-[12.5px] font-semibold leading-6',
    isDark ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  )
  const reviewNoteClass = cn(
    'mt-5 rounded-[16px] border px-4 py-3 text-[12.5px] font-semibold leading-6',
    isDark ? 'border-white/10 bg-white/[0.05] text-purple-100/80' : 'border-violet-200/70 bg-violet-50/80 text-ink-700'
  )
  const emailButtonClass = cn(
    'inline-flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[16px] border px-5 py-3 text-[13px] font-black shadow-[0_10px_28px_-22px_rgba(89,23,196,0.5)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50',
    isDark
      ? 'border-white/10 bg-white/[0.06] text-purple-100 hover:border-violet-300/50 hover:bg-white/[0.1]'
      : 'border-violet-200 bg-white text-violet-800 hover:border-violet-300 hover:bg-violet-50'
  )

  return (
    <div className={panelClass}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/45 to-transparent" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.045), transparent 32%, rgba(217,70,239,0.035) 100%)',
        }}
        aria-hidden="true"
      />

      <div className={dividerClass}>
        <section className={sectionClass}>
          <div className="mb-5 flex items-start gap-3">
            <span className={sectionIconClass}>
              <UserRound className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className={sectionTitleClass}>Contact details</h3>
              <p className={sectionCaptionClass}>Name and reachable contact information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label htmlFor="cf-name" className={labelClass}>
                Full Name *
              </label>
              <input
                id="cf-name"
                className={fieldClass('name')}
                value={form.name}
                onChange={event => update('name', event.target.value)}
                autoComplete="name"
                maxLength={100}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'cf-name-error' : undefined}
              />
              {errors.name && (
                <p id="cf-name-error" role="alert" className={errorTextClass}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cf-email" className={labelClass}>
                Email *
              </label>
              <input
                id="cf-email"
                type="email"
                className={fieldClass('email')}
                value={form.email}
                onChange={event => update('email', event.target.value)}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'cf-email-error' : undefined}
              />
              {errors.email && (
                <p id="cf-email-error" role="alert" className={errorTextClass}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="md:col-span-2 xl:col-span-1">
              <label htmlFor="cf-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="cf-phone"
                type="tel"
                className={fieldClass('phone')}
                value={form.phone}
                onChange={event => update('phone', event.target.value)}
                placeholder="+962..."
                autoComplete="tel"
                maxLength={20}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
              />
              {errors.phone && (
                <p id="cf-phone-error" role="alert" className={errorTextClass}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-start gap-3">
            <span className={sectionIconClass}>
              <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className={sectionTitleClass}>Event request</h3>
              <p className={sectionCaptionClass}>Category, service, and preferred timing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label htmlFor="cf-inquiry" className={labelClass}>
                Inquiry Type
              </label>
              <select
                id="cf-inquiry"
                className={fieldClass()}
                value={form.inquiryType}
                onChange={event => update('inquiryType', event.target.value)}
              >
                <option value="">Select an inquiry type</option>
                {INQUIRY_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-eventtype" className={labelClass}>
                Event Type
              </label>
              <select
                id="cf-eventtype"
                className={fieldClass()}
                value={form.eventType}
                onChange={event => update('eventType', event.target.value)}
              >
                <option value="">Select an event type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-eventdate" className={labelClass}>
                Event Date
              </label>
              <input
                id="cf-eventdate"
                type="date"
                className={fieldClass()}
                value={form.eventDate}
                onChange={event => update('eventDate', event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="cf-product" className={labelClass}>
              Service / Request
            </label>
            <select
              id="cf-product"
              className={fieldClass('product')}
              value={form.product}
              onChange={event => update('product', event.target.value)}
            >
              <option value="">General inquiry / no specific service</option>
              {products.map(product => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product && <p className={errorTextClass}>{errors.product}</p>}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-start gap-3">
            <span className={sectionIconClass}>
              <MapPin className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className={sectionTitleClass}>Location and notes</h3>
              <p className={sectionCaptionClass}>Where it happens and what the team should know.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label htmlFor="cf-country" className={labelClass}>
                Country
              </label>
              <select
                id="cf-country"
                className={fieldClass()}
                value={form.country}
                onChange={event => updateCountry(event.target.value)}
                autoComplete="country-name"
              >
                {countryOptions.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-city" className={labelClass}>
                City / Governorate / State
              </label>
              <select
                id="cf-city"
                className={fieldClass()}
                value={form.city}
                onChange={event => update('city', event.target.value)}
                autoComplete="address-level1"
                disabled={regionOptions.length === 0}
              >
                {regionOptions.length === 0 ? (
                  <option value="">No regions listed for this country</option>
                ) : (
                  regionOptions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))
                )}
              </select>
              {regionOptions.length > 0 && <p className={hintClass}>Showing regions for {selectedCountryName}</p>}
            </div>

            <div>
              <label htmlFor="cf-venue" className={labelClass}>
                Venue
              </label>
              <input
                id="cf-venue"
                className={fieldClass()}
                value={form.address}
                onChange={event => update('address', event.target.value)}
                maxLength={200}
              />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label htmlFor="cf-notes" className={labelClass}>
                Message / Notes *
              </label>
              <textarea
                id="cf-notes"
                className={textareaClass}
                rows={4}
                value={form.message}
                onChange={event => update('message', event.target.value)}
                maxLength={2000}
                placeholder="Tell us what you need, preferred date, location, expected number of guests, services, rentals, or custom builds you are interested in, and any setup notes."
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'cf-notes-error' : undefined}
              />
              {errors.message && (
                <p id="cf-notes-error" role="alert" className={errorTextClass}>
                  {errors.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {errors._global && (
          <div role="alert" className={alertErrorClass}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
            <span>{errors._global}</span>
          </div>
        )}

        {Object.entries(errors)
          .filter(([key]) => key !== '_global')
          .some(([, value]) => value) && (
          <div role="alert" className={alertErrorClass}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
            <span>{t('contact.fixErrors')}</span>
          </div>
        )}

        {saved && (
          <div role="status" className={alertSuccessClass}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
            <span>{t('contact.savedBanner')}</span>
          </div>
        )}

        <p className={reviewNoteClass}>
          Submitting this form starts a request review. The Eventies team reviews availability, pricing, scope, delivery
          or shipping, and next steps before confirmation.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={saving}
            onClick={() => submit('whatsapp')}
            className="inline-flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[16px] bg-[#25D366] px-5 py-3 text-[13px] font-black text-white shadow-[0_14px_30px_-18px_rgba(22,163,74,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[#20BD5A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
            {saving ? 'Saving...' : 'Send via WhatsApp'}
          </button>
          <button type="button" disabled={saving} onClick={() => submit('email')} className={emailButtonClass}>
            <Mail className="h-4 w-4" strokeWidth={2.4} />
            {saving ? 'Saving...' : 'Send via Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
