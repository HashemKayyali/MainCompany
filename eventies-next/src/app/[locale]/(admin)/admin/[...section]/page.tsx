import { notFound } from 'next/navigation'
import { AdminInterior, type AdminSection } from '@/features/admin/AdminInterior'
import { requireAdmin } from '@/server/auth/admin-guard'

const SECTIONS = new Set<AdminSection>([
  'products',
  'categories',
  'parts',
  'requests',
  'quotes',
  'customers',
  'providers',
  'custom-builds',
  'gallery',
  'chats',
  'notifications',
  'admins',
  'users',
  'logs',
  'contact-submissions',
])
const SUPERADMIN = new Set<AdminSection>(['admins', 'users', 'logs'])

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string[] }>
}) {
  const { locale, section } = await params
  const name = section[0] as AdminSection
  if (section.length !== 1 || !SECTIONS.has(name)) notFound()
  if (SUPERADMIN.has(name)) await requireAdmin({ locale, superadminOnly: true })
  return <AdminInterior section={name} />
}
