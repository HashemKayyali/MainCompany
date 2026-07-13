import { notFound } from 'next/navigation'
import { AdminInterior } from '@/features/admin/AdminInterior'
import { ADMIN_SECTIONS, type AdminSection } from '@/shared/contracts/admin'
import { readAdminRequestDetail, readAdminSection } from '@/server/admin/read-model'
import { requireAdmin } from '@/server/auth/admin-guard'

const SECTIONS = new Set<AdminSection>(ADMIN_SECTIONS.filter((section) => section !== 'dashboard'))
const SUPERADMIN = new Set<AdminSection>([
  'admins',
  'users',
  'logs',
  'system-events',
  'notifications',
])

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; section: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale, section } = await params
  const name = section[0] as AdminSection
  if (!SECTIONS.has(name)) notFound()
  if (SUPERADMIN.has(name)) await requireAdmin({ locale, superadminOnly: true })

  if (section.length === 2 && (name === 'requests' || name === 'quotes')) {
    const id = section[1]
    if (!id) notFound()
    const row = await readAdminRequestDetail(locale, name, id)
    if (!row) notFound()
    return <AdminInterior section={name} rows={[row]} count={1} />
  }
  if (section.length !== 1) notFound()

  const query = await searchParams
  const data = await readAdminSection(locale, name, {
    search: typeof query.search === 'string' ? query.search : '',
    status: typeof query.status === 'string' ? query.status : undefined,
    page: typeof query.page === 'string' ? query.page : 1,
  })
  return <AdminInterior section={name} {...data} />
}
