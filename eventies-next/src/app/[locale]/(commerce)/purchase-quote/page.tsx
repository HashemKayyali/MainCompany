import { notFound } from 'next/navigation'
import { getMyProfile } from '@/server/dal/personal'
import { PurchaseQuoteForm } from '@/features/commerce/TransactionForm'

export default async function PurchaseQuotePage() {
  const profile = await getMyProfile()
  if (!profile) notFound()
  return <PurchaseQuoteForm profile={profile} />
}
