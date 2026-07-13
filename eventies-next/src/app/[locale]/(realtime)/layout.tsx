import type { Metadata } from 'next'
import { requireSession } from '@/server/auth/require-session'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function RealtimeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireSession(locale, '/notifications')
  return children
}
