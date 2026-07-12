import { notFound } from 'next/navigation'
import { getMyProfile } from '@/server/dal/personal'
import { RentalCheckoutForm } from '@/features/commerce/TransactionForm'

export default async function CheckoutPage() {
  const profile = await getMyProfile()
  if (!profile) notFound()
  return <RentalCheckoutForm profile={profile} />
}
