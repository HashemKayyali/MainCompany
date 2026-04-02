import { useTheme } from '../../contexts/ThemeContext'
import type { RequestContactForm } from '../../types/commerce'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function RequestContactFields({
  form,
  onChange,
  showEventName = false,
}: {
  form: RequestContactForm
  onChange: <K extends keyof RequestContactForm>(field: K, value: RequestContactForm[K]) => void
  showEventName?: boolean
}) {
  const { isDark } = useTheme()
  const labelClass = cn('mb-1.5 block text-[11px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input className="form-field" value={form.customerName} onChange={event => onChange('customerName', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input type="email" className="form-field" value={form.email} onChange={event => onChange('email', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Phone *</label>
        <input className="form-field" value={form.phone} onChange={event => onChange('phone', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Company Name</label>
        <input className="form-field" value={form.companyName} onChange={event => onChange('companyName', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>City *</label>
        <input className="form-field" value={form.city} onChange={event => onChange('city', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Address *</label>
        <input className="form-field" value={form.address} onChange={event => onChange('address', event.target.value)} />
      </div>

      {showEventName && (
        <div className="md:col-span-2">
          <label className={labelClass}>Event Name</label>
          <input className="form-field" value={form.eventName} onChange={event => onChange('eventName', event.target.value)} />
        </div>
      )}

      <div className="md:col-span-2">
        <label className={labelClass}>Notes</label>
        <textarea
          rows={3}
          className="form-field resize-none"
          value={form.notes}
          onChange={event => onChange('notes', event.target.value)}
        />
      </div>
    </div>
  )
}
