import { useTheme } from '../../contexts/ThemeContext'
import { useI18n } from '../../contexts/LanguageContext'
import type { RequestContactForm } from '../../types/commerce'
import { cn } from '../../utils/cn'

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
  const { t } = useI18n()
  const labelClass = cn('mb-2 block text-[13px] font-medium sm:text-[13.5px]', isDark ? 'text-purple-200/80' : 'text-gray-600')

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className={labelClass}>{t('Full Name *')}</label>
        <input className="form-field" value={form.customerName} onChange={event => onChange('customerName', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t('Email *')}</label>
        <input type="email" className="form-field" value={form.email} onChange={event => onChange('email', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t('Phone *')}</label>
        <input className="form-field" value={form.phone} onChange={event => onChange('phone', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t('Company Name')}</label>
        <input className="form-field" value={form.companyName} onChange={event => onChange('companyName', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t('City *')}</label>
        <input className="form-field" value={form.city} onChange={event => onChange('city', event.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t('Address *')}</label>
        <input className="form-field" value={form.address} onChange={event => onChange('address', event.target.value)} />
      </div>

      {showEventName && (
        <div className="md:col-span-2">
          <label className={labelClass}>{t('Event Name')}</label>
          <input className="form-field" value={form.eventName} onChange={event => onChange('eventName', event.target.value)} />
        </div>
      )}

      <div className="md:col-span-2">
        <label className={labelClass}>{t('Notes')}</label>
        <textarea
          rows={4}
          className="form-field resize-none"
          value={form.notes}
          onChange={event => onChange('notes', event.target.value)}
        />
      </div>
    </div>
  )
}
