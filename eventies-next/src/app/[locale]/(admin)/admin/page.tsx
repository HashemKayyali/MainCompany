import { AdminInterior } from '@/features/admin/AdminInterior'
import { readAdminSection } from '@/server/admin/read-model'

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await readAdminSection(locale, 'dashboard')
  return <AdminInterior section="dashboard" {...data} />
}
