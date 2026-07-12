import { Bidi } from '@/components/Bidi'
import type { CustomerRequestDetails } from '@/shared/types/requests'
import { StatusBadge } from './StatusBadge'

export function RequestDetailsView({
  details,
  labels,
}: {
  details: CustomerRequestDetails
  labels: {
    rental: string
    quote: string
    items: string
    journey: string
    status: (value: string) => string
  }
}) {
  const request = details.request
  return (
    <div className="site-container max-w-5xl py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label">
            {details.type === 'rental' ? labels.rental : labels.quote}
          </p>
          <h1 className="mt-2 text-3xl font-black text-ink-900">{request.request_number}</h1>
        </div>
        <StatusBadge status={request.status} label={labels.status(request.status)} />
      </div>
      <section className="premium-card mt-8 p-6">
        <h2 className="text-xl font-black">{labels.items}</h2>
        <ul className="mt-4 divide-y">
          {details.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <Bidi>{item.product_title_snapshot}</Bidi>
              <span className="font-bold">× {item.quantity}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="premium-card mt-6 p-6">
        <h2 className="text-xl font-black">{labels.journey}</h2>
        <ol className="mt-4 space-y-4">
          {details.history.map((entry) => (
            <li key={entry.id} className="border-s-2 border-violet-300 ps-4">
              <StatusBadge status={entry.new_status} label={labels.status(entry.new_status)} />
              <p className="mt-1 text-sm text-ink-500">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(entry.created_at))}
              </p>
              {entry.note && <Bidi className="mt-1 text-sm text-ink-700">{entry.note}</Bidi>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
