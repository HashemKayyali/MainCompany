import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { allCountries } from 'country-region-data'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useRateLimit } from '../../hooks/useRateLimit'
import { validateContactForm, sanitizeInput } from '../../utils/validators'
import { sanitize, buildMailtoUrl, buildWhatsAppUrl } from '../../utils/format'
import { social } from '../../data/social'
import { t } from '../../lib/i18n'
import * as contactApi from '../../services/contact.service'

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
  const { products } = useData()
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

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-600'

  return (
    <div className="space-y-4">
      <div className="glass rounded-[20px] p-4.5 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="cf-name" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Full Name *
            </label>
            <input
              id="cf-name"
              className={`form-field ${errors.name ? '!border-red-400/40' : ''}`}
              value={form.name}
              onChange={event => update('name', event.target.value)}
              autoComplete="name"
              maxLength={100}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'cf-name-error' : undefined}
            />
            {errors.name && <p id="cf-name-error" role="alert" className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="cf-email" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Email *
            </label>
            <input
              id="cf-email"
              type="email"
              className={`form-field ${errors.email ? '!border-red-400/40' : ''}`}
              value={form.email}
              onChange={event => update('email', event.target.value)}
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'cf-email-error' : undefined}
            />
            {errors.email && <p id="cf-email-error" role="alert" className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="sm:col-span-2 xl:col-span-1">
            <label htmlFor="cf-phone" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Phone
            </label>
            <input
              id="cf-phone"
              type="tel"
              className={`form-field ${errors.phone ? '!border-red-400/40' : ''}`}
              value={form.phone}
              onChange={event => update('phone', event.target.value)}
              placeholder="+962..."
              autoComplete="tel"
              maxLength={20}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
            />
            {errors.phone && <p id="cf-phone-error" role="alert" className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>
        </div>
      </div>

      <div className="glass rounded-[20px] p-4.5 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="cf-inquiry" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Inquiry Type
            </label>
            <select
              id="cf-inquiry"
              className="form-field"
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
            <label htmlFor="cf-eventtype" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Event Type
            </label>
            <select
              id="cf-eventtype"
              className="form-field"
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
            <label htmlFor="cf-eventdate" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Event Date
            </label>
            <input
              id="cf-eventdate"
              type="date"
              className="form-field"
              value={form.eventDate}
              onChange={event => update('eventDate', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-[20px] p-4.5 sm:p-5">
        <label htmlFor="cf-product" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
          Service / Request
        </label>
        <select
          id="cf-product"
          className={`form-field ${errors.product ? '!border-red-400/40' : ''}`}
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
        {errors.product && <p className="mt-1 text-xs text-red-400">{errors.product}</p>}
      </div>

      <div className="glass rounded-[20px] p-4.5 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="cf-country" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Country
            </label>
            <select
              id="cf-country"
              className="form-field"
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
            <label htmlFor="cf-city" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              City / Governorate / State
            </label>
            <select
              id="cf-city"
              className="form-field"
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
            {regionOptions.length > 0 && (
              <p className="mt-1.5 text-[11px] font-medium text-violet-500">
                Showing regions for {selectedCountryName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cf-venue" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Venue
            </label>
            <input
              id="cf-venue"
              className="form-field"
              value={form.address}
              onChange={event => update('address', event.target.value)}
              maxLength={200}
            />
          </div>

          <div className="sm:col-span-2 xl:col-span-3">
            <label htmlFor="cf-notes" className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${sub}`}>
              Message / Notes *
            </label>
            <textarea
              id="cf-notes"
              className="form-field resize-none"
              rows={4}
              value={form.message}
              onChange={event => update('message', event.target.value)}
              maxLength={2000}
              placeholder="Tell us what you need, preferred date, location, expected number of guests, services, rentals, or custom builds you are interested in, and any setup notes."
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'cf-notes-error' : undefined}
            />
            {errors.message && <p id="cf-notes-error" role="alert" className="mt-1 text-xs text-red-400">{errors.message}</p>}
          </div>
        </div>
      </div>

      {errors._global && (
        <div
          role="alert"
          className={`rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'
          }`}
        >
          {errors._global}
        </div>
      )}

      {Object.entries(errors)
        .filter(([key]) => key !== '_global')
        .some(([, value]) => value) && (
        <div
          role="alert"
          className={`rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'
          }`}
        >
          {t('contact.fixErrors')}
        </div>
      )}

      {saved && (
        <div
          role="status"
          className={`rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-emerald-400/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {t('contact.savedBanner')}
        </div>
      )}

      <p className="rounded-xl border border-violet-200/70 bg-violet-50/60 px-3.5 py-2.5 text-[12px] leading-[1.6] text-ink-600">
        Submitting this form starts a request review. The Eventies team reviews availability,
        pricing, scope, delivery or shipping, and next steps before confirmation.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('whatsapp')}
          className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2.5 rounded-[18px] bg-[#25D366] px-5 py-3 text-[13.5px] font-semibold text-white transition-all hover:bg-[#20BD5A] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Send via WhatsApp'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('email')}
          className="btn-outline flex-1 !rounded-[18px] !py-3 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Send via Email'}
        </button>
      </div>
    </div>
  )
}
