import type { Metadata } from 'next'
import { CommerceProviders } from '@/features/commerce/CommerceProviders'
import { requireSession } from '@/server/auth/require-session'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export default async function CommerceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireSession(locale, '/rental-cart')
  return <CommerceProviders>{children}</CommerceProviders>
}
