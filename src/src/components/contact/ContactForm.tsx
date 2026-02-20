import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { jordanCities } from '../../data/locations'
import { validateContactForm } from '../../utils/validators'
import { sanitize, buildWhatsAppUrl, buildMailtoUrl } from '../../utils/format'
import { social } from '../../data/social'
import * as contactApi from '../../services/contact.service'

export default function ContactForm() {
  const [searchParams] = useSearchParams()
  const pre = searchParams.get('product') || ''
  const { products } = useData()
  const { isDark } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', phone: '', product: pre, city: 'Amman', address: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (pre) setForm(f => ({ ...f, product: pre })) }, [pre])

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: sanitize(value) }))
    setErrors(e => ({ ...e, [field]: '' }))
    if (saved) setSaved(false)
  }

  const validate = (): boolean => {
    const r = validateContactForm(form)
    const m: Record<string, string> = {}
    r.forEach(e => m[e.field] = e.message)
    setErrors(m)
    return r.length === 0
  }

  const msg = () => {
    const p = products.find(x => x.slug === form.product)
    return [
      'Bike Land Booking', '',
      `Name: ${form.name}`, `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : '',
      `Product: ${p?.name || form.product}`,
      `City: ${form.city}`,
      form.address ? `Venue: ${form.address}` : '',
      form.message ? `Notes: ${form.message}` : ''
    ].filter(Boolean).join('\n')
  }

  // Save to Supabase + open channel
  const submit = async (channel: 'whatsapp' | 'email') => {
    if (!validate()) return

    setSaving(true)
    try {
      // Save to Supabase
      await contactApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        productSlug: form.product,
        city: form.city,
        address: form.address,
        message: form.message,
      })
      setSaved(true)
    } catch (err) {
      console.warn('Failed to save to DB (continuing with message):', err)
    } finally {
      setSaving(false)
    }

    // Open WhatsApp or Email
    if (channel === 'whatsapp') {
      window.open(buildWhatsAppUrl(social.phone, msg()), '_blank')
    } else {
      window.open(buildMailtoUrl(social.email, 'Event Booking', msg()), '_blank')
    }
  }

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-600'

  return (
    <div className="space-y-5">
      <div className="glass p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Full Name *</label>
            <input className={`form-field ${errors.name ? '!border-red-400/40' : ''}`} value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div>
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Email *</label>
            <input type="email" className={`form-field ${errors.email ? '!border-red-400/40' : ''}`} value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Phone</label>
            <input type="tel" className="form-field" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+962..." />
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Product *</label>
        <select className={`form-field ${errors.product ? '!border-red-400/40' : ''}`} value={form.product} onChange={e => update('product', e.target.value)}>
          <option value="">Select...</option>
          {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>

      <div className="glass p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>City</label>
            <select className="form-field" value={form.city} onChange={e => update('city', e.target.value)}>
              {jordanCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Venue</label>
            <input className="form-field" value={form.address} onChange={e => update('address', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={`block text-[13px] mb-2 font-medium ${sub}`}>Notes</label>
            <textarea className="form-field resize-none" rows={3} value={form.message} onChange={e => update('message', e.target.value)} />
          </div>
        </div>
      </div>

      {Object.values(errors).some(Boolean) && (
        <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'}`}>
          Please fill in all required fields.
        </div>
      )}

      {saved && (
        <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-emerald-400/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          ✅ Your request has been saved! We'll follow up soon.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('whatsapp')}
          className="flex-1 inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#20BD5A] transition-all disabled:opacity-50"
        >
          {saving ? '⏳ Saving...' : 'WhatsApp'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit('email')}
          className="flex-1 btn-outline !py-4 disabled:opacity-50"
        >
          {saving ? '⏳ Saving...' : 'Email'}
        </button>
      </div>
    </div>
  )
}
