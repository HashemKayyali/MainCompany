import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useRateLimit } from '../../hooks/useRateLimit'
import { jordanCities } from '../../data/locations'
import { validateContactForm, sanitizeInput } from '../../utils/validators'
import { sanitize, buildMailtoUrl, buildWhatsAppUrl } from '../../utils/format'
import { social } from '../../data/social'
import * as contactApi from '../../services/contact.service'

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
    product: preselectedProduct,
    city: 'Amman',
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
    const cleanedValue =
      field === 'message'
        ? sanitize(sanitizeInput(value, 2000))
        : sanitize(sanitizeInput(value, 200))

    setForm(current => ({ ...current, [field]: cleanedValue }))
    setErrors(current => ({ ...current, [field]: '', _global: '' }))

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
      'Bike Land Inquiry',
      '',
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : '',
      `Product: ${selectedProduct?.name || form.product || 'General inquiry'}`,
      `City: ${form.city}`,
      form.address ? `Venue: ${form.address}` : '',
      form.message ? `Notes: ${form.message}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  const submit = async (channel: 'whatsapp' | 'email') => {
    if (!validate()) return

    if (!checkRate()) {
      setErrors({
        _global: `Too many requests. Please wait before trying again. (${remaining()} left)`,
      })
      toast('Too many requests. Please wait a moment.', 'error')
      return
    }

    setSaving(true)
    try {
      await contactApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        productSlug: form.product || null,
        city: form.city,
        address: form.address,
        message: form.message,
      })
      setSaved(true)
      toast("Request saved! We'll follow up soon.", 'success')
    } catch (error) {
      console.warn('Failed to save to DB (continuing with message):', error)
      toast('Could not save to database, but your message will still be sent.', 'info')
    } finally {
      setSaving(false)
    }

    if (channel === 'whatsapp') {
      window.open(buildWhatsAppUrl(social.phone, buildMessage()), '_blank')
      return
    }

    window.open(buildMailtoUrl(social.email, 'Event Booking', buildMessage()), '_blank')
  }

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-600'

  return (
    <div className="space-y-3.5">
      <div className="glass rounded-[18px] p-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className={`mb-2 block text-[13px] font-medium ${sub}`}>
              Full Name *
            </label>
            <input
              id="cf-name"
              className={`form-field ${errors.name ? '!border-red-400/40' : ''}`}
              value={form.name}
              onChange={event => update('name', event.target.value)}
              autoComplete="name"
              maxLength={100}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="cf-email" className={`mb-2 block text-[13px] font-medium ${sub}`}>
              Email *
            </label>
            <input
              id="cf-email"
              type="email"
              className={`form-field ${errors.email ? '!border-red-400/40' : ''}`}
              value={form.email}
              onChange={event => update('email', event.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cf-phone" className={`mb-2 block text-[13px] font-medium ${sub}`}>
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
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>
        </div>
      </div>

      <div className="glass rounded-[18px] p-4">
        <label htmlFor="cf-product" className={`mb-2 block text-[13px] font-medium ${sub}`}>
          Product (optional)
        </label>
        <select
          id="cf-product"
          className={`form-field ${errors.product ? '!border-red-400/40' : ''}`}
          value={form.product}
          onChange={event => update('product', event.target.value)}
        >
          <option value="">General inquiry / no specific product</option>
          {products.map(product => (
            <option key={product.slug} value={product.slug}>
              {product.name}
            </option>
          ))}
        </select>
        {errors.product && <p className="mt-1 text-xs text-red-400">{errors.product}</p>}
      </div>

      <div className="glass rounded-[18px] p-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-city" className={`mb-2 block text-[13px] font-medium ${sub}`}>
              City
            </label>
            <select
              id="cf-city"
              className="form-field"
              value={form.city}
              onChange={event => update('city', event.target.value)}
            >
              {jordanCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cf-venue" className={`mb-2 block text-[13px] font-medium ${sub}`}>
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

          <div className="sm:col-span-2">
            <label htmlFor="cf-notes" className={`mb-2 block text-[13px] font-medium ${sub}`}>
              Notes
            </label>
            <textarea
              id="cf-notes"
              className="form-field resize-none"
              rows={3}
              value={form.message}
              onChange={event => update('message', event.target.value)}
              maxLength={2000}
            />
            {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
          </div>
        </div>
      </div>

      {errors._global && (
        <div
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
          className={`rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'
          }`}
        >
          Please fill in all required fields correctly.
        </div>
      )}

      {saved && (
        <div
          className={`rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-emerald-400/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          Your request has been saved. We&apos;ll follow up soon.
        </div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('whatsapp')}
          className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2.5 rounded-[16px] bg-[#25D366] px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-[#20BD5A] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'WhatsApp'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('email')}
          className="btn-outline flex-1 !rounded-[16px] !py-3 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Email'}
        </button>
      </div>
    </div>
  )
}
