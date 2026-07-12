import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RequestDetailsView } from '@/features/account/RequestDetailsView'
import { getMyRequestDetails } from '@/server/dal/personal'

export default async function MyRequestDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; number: string }>
}) {
  const { locale, number } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const [t, details] = await Promise.all([getTranslations('account'), getMyRequestDetails(number)])
  if (!details) notFound()
  return (
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
  )
}
