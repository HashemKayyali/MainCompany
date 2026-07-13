export const ADMIN_MUTATION_ENTITIES = [
  'product',
  'category',
  'part',
  'build',
  'customer',
  'gallery',
] as const
export type AdminMutationEntity = (typeof ADMIN_MUTATION_ENTITIES)[number]

export const ADMIN_SECTIONS = [
  'dashboard',
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
  'support-inquiries',
  'system-events',
] as const

export type AdminSection = (typeof ADMIN_SECTIONS)[number]

export type AdminGridRow = {
  id: string
  label: string
  secondary: string | null
  status: string
  createdAt: string | null
}

export type AdminSectionRead = {
  rows: AdminGridRow[]
  count: number
  page: number
  pageSize: number
}
