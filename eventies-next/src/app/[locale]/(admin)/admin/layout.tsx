import type { Metadata } from 'next'
import { AdminShell } from '@/features/admin/AdminShell'
import { requireAdmin } from '@/server/auth/admin-guard'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { role } = await requireAdmin({ locale })
  return <AdminShell role={role}>{children}</AdminShell>
}
