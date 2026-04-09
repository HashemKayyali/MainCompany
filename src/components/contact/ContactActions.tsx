import { useData } from '../../contexts/DataContext'
import { social } from '../../data/social'
import { buildWhatsAppUrl, buildMailtoUrl } from '../../utils/format'
export default function ContactActions({ form, validate }: { form: Record<string, string>; validate: () => boolean }) {
  const { products } = useData()
  const msg = () => { const p = products.find(x => x.slug === form.product); return ['Hello Eventies!','','Event booking:','',`Name: ${form.name}`,`Email: ${form.email}`,form.phone ? `Phone: ${form.phone}` : '',`Product: ${p?.name || form.product}`,`Location: ${form.city}, ${form.country}`,form.address ? `Venue: ${form.address}` : '',form.message ? `\nNotes: ${form.message}` : ''].filter(Boolean).join('\n') }
  const wa = () => { if (!validate()) return; window.open(buildWhatsAppUrl(social.phone, msg()), '_blank') }
  const em = () => { if (!validate()) return; window.open(buildMailtoUrl(social.email, 'Event Booking', msg()), '_blank') }
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button type="button" onClick={wa} className="flex-1 inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#20BD5A] hover:shadow-lg transition-all">WhatsApp</button>
      <button type="button" onClick={em} className="flex-1 btn-outline !py-4">Email</button>
    </div>
  )
}
