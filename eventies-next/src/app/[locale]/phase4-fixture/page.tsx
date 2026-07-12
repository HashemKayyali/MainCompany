import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { RequestDetailsView } from '@/features/account/RequestDetailsView'
import { StatusBadge } from '@/features/account/StatusBadge'
import { CommerceProviders } from '@/features/commerce/CommerceProviders'
import { RentalDraftView } from '@/features/commerce/DraftList'
import type { CustomerRequestDetails } from '@/shared/types/requests'

const details: CustomerRequestDetails = {
  type: 'rental',
  request: {
    id: '00000000-0000-4000-8000-000000000001',
    request_number: 'RR-FIXTURE',
    profile_id: '00000000-0000-4000-8000-000000000002',
    customer_name: 'Fixture User',
    email: 'fixture@example.invalid',
    phone: '+9620000000',
    company_name: null,
    city: 'Amman',
    address: 'Fixture venue',
    event_name: null,
    notes: null,
    admin_internal_notes: null,
    subtotal: 10,
    extra_fees: 0,
    grand_total: 10,
    status: 'pending_review',
    created_at: '2026-07-13T00:00:00Z',
    updated_at: '2026-07-13T00:00:00Z',
    idempotency_key: null,
  },
  items: [
    {
      id: '00000000-0000-4000-8000-000000000003',
      rental_request_id: '00000000-0000-4000-8000-000000000001',
      product_id: '00000000-0000-4000-8000-000000000004',
      product_slug: 'fixture',
      product_title_snapshot: 'Fixture Service',
      quantity: 1,
      rental_start_date: '2026-08-01',
      rental_end_date: '2026-08-02',
      rental_days: 2,
      unit_price: 5,
      line_total: 10,
      created_at: '2026-07-13T00:00:00Z',
    },
  ],
  history: [
    {
      id: '00000000-0000-4000-8000-000000000005',
      request_type: 'rental',
      request_id: '00000000-0000-4000-8000-000000000001',
      old_status: null,
      new_status: 'pending_review',
      note: 'Fixture status',
      changed_by_profile_id: null,
      created_at: '2026-07-13T00:00:00Z',
    },
  ],
}

export default async function Phase4Fixture({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ state?: string }>
}) {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('account')
  const state = (await searchParams).state
  if (state === 'draft')
    return (
      <CommerceProviders>
        <RentalDraftView />
      </CommerceProviders>
    )
  if (state === 'error')
    return (
      <div className="site-container py-12 text-center">
        <h1 className="text-3xl font-black">Fixture timeout</h1>
        <button className="mt-5 rounded-full bg-violet-700 px-5 py-3 font-bold text-white">
          {t('retry')}
        </button>
      </div>
    )
  if (state === 'empty')
    return (
      <div className="site-container py-12 text-center">
        <h1 className="text-3xl font-black">{t('emptyTitle')}</h1>
        <p>{t('emptyBody')}</p>
        <Link href="/products">{t('browse')}</Link>
      </div>
    )
  return (
    <>
      <div className="site-container pt-10">
        <StatusBadge status="pending_review" label={t('status.pending_review')} />
      </div>
      <RequestDetailsView
        details={details}
        labels={{
          rental: t('rental'),
          quote: t('quote'),
          items: t('items'),
          journey: t('journey'),
          status: (value) => t(`status.${value}` as Parameters<typeof t>[0]),
        }}
      />
    </>
  )
}
