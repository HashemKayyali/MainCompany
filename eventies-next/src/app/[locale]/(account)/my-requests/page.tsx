import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getMyPurchaseQuotes, getMyRentalRequests } from '@/server/dal/personal'
import { StatusBadge } from '@/features/account/StatusBadge'

export default async function MyRequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('account')
  const [rentals, quotes] = await Promise.all([getMyRentalRequests(), getMyPurchaseQuotes()])
  const rows = [
    ...rentals.map((request) => ({ ...request, type: 'rental' as const })),
    ...quotes.map((request) => ({ ...request, type: 'quote' as const })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const status = (value: string) => t(`status.${value}` as Parameters<typeof t>[0])
  return (
    <div className="site-container max-w-5xl py-12">
      <h1 className="text-4xl font-black text-ink-900">{t('myRequests')}</h1>
      <p className="mt-3 text-ink-600">{t('requestsDescription')}</p>
      {rows.length === 0 ? (
        <div className="premium-card mt-8 p-10 text-center">
          <h2 className="text-2xl font-black">{t('emptyTitle')}</h2>
          <p className="mt-2 text-ink-600">{t('emptyBody')}</p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-full bg-violet-700 px-5 py-3 font-bold text-white"
          >
            {t('browse')}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/my-requests/${row.request_number}`}
                className="premium-card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                    {row.type === 'rental' ? t('rental') : t('quote')}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{row.request_number}</h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {t('created')}:{' '}
                    {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                      new Date(row.created_at)
                    )}
                  </p>
                </div>
                <StatusBadge status={row.status} label={status(row.status)} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
