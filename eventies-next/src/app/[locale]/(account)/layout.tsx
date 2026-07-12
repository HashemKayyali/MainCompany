import type { Metadata } from 'next'
import { requireSession } from '@/server/auth/require-session'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireSession(locale, '/my-requests')
  return children
}
