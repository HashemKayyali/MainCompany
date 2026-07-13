import 'server-only'

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/server/auth/admin-guard'
import { assertAdminPermission, type AdminPermission } from './permissions'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { adminListFilterSchema } from '@/shared/schemas/admin'
import {
  ADMIN_SECTIONS,
  type AdminGridRow,
  type AdminSection,
  type AdminSectionRead,
} from '@/shared/contracts/admin'
import type { Database } from '@/shared/types/database.types'

export { ADMIN_SECTIONS }
export type { AdminGridRow, AdminSection, AdminSectionRead }

const SECTION_PERMISSION: Record<AdminSection, AdminPermission> = {
  dashboard: 'dashboard.read',
  products: 'catalog.read',
  categories: 'catalog.read',
  parts: 'catalog.read',
  requests: 'requests.read',
  quotes: 'requests.read',
  customers: 'people.read',
  providers: 'people.read',
  'custom-builds': 'catalog.read',
  gallery: 'catalog.read',
  chats: 'chat.read',
  notifications: 'notifications.read',
  admins: 'roles.write',
  users: 'roles.write',
  logs: 'audit.read',
  'contact-submissions': 'people.read',
  'support-inquiries': 'people.read',
  'system-events': 'audit.read',
}

const SUPERADMIN_SECTIONS = new Set<AdminSection>([
  'admins',
  'users',
  'logs',
  'system-events',
  'notifications',
])

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function rawRows(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

function gridRows(
  data: unknown,
  fields: { label: string; secondary?: string; status?: string; createdAt?: string }
): AdminGridRow[] {
  return rawRows(data).map((row) => ({
    id: text(row.id),
    label: text(row[fields.label]) || text(row.id),
    secondary: fields.secondary ? nullableText(row[fields.secondary]) : null,
    status: fields.status ? text(row[fields.status]) || 'active' : 'active',
    createdAt: fields.createdAt ? nullableText(row[fields.createdAt]) : null,
  }))
}

function assertQuery(error: PostgrestError | null): void {
  if (error) throw new Error(`Admin read failed (${error.code})`)
}

export async function readAdminSection(
  locale: string,
  section: AdminSection,
  input: unknown = {},
  injectedClient?: SupabaseClient<Database>
): Promise<AdminSectionRead> {
  const filters = adminListFilterSchema.parse(input)
  const gate = await requireAdmin({
    locale,
    superadminOnly: SUPERADMIN_SECTIONS.has(section),
  })
  assertAdminPermission(gate.role, SECTION_PERMISSION[section])
  const client = injectedClient ?? (await createSupabaseServerClient())
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1
  let data: unknown = []
  let count: number | null = 0
  let error: PostgrestError | null = null
  let fields: Parameters<typeof gridRows>[1] = { label: 'id' }

  switch (section) {
    case 'dashboard': {
      const results = await Promise.all([
        client.from('products').select('id', { count: 'exact', head: true }),
        client.from('rental_requests').select('id', { count: 'exact', head: true }),
        client.from('purchase_quote_requests').select('id', { count: 'exact', head: true }),
        client.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      results.forEach((result) => assertQuery(result.error))
      const labels = ['products', 'requests', 'quotes', 'users']
      data = results.map((result, index) => ({
        id: labels[index],
        label: labels[index],
        status: String(result.count ?? 0),
      }))
      count = results.length
      fields = { label: 'label', status: 'status' }
      break
    }
    case 'products': {
      const result = await client
        .from('products')
        .select('id,title,slug,is_active,created_at', { count: 'exact' })
        .ilike('title', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'title', secondary: 'slug', status: 'is_active', createdAt: 'created_at' }
      break
    }
    case 'categories': {
      const result = await client
        .from('categories')
        .select('id,name,slug,created_at', { count: 'exact' })
        .ilike('name', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'name', secondary: 'slug', createdAt: 'created_at' }
      break
    }
    case 'parts': {
      const result = await client
        .from('parts')
        .select('id,title,slug,is_active,created_at', { count: 'exact' })
        .ilike('title', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'title', secondary: 'slug', status: 'is_active', createdAt: 'created_at' }
      break
    }
    case 'requests': {
      let query = client
        .from('rental_requests')
        .select('id,request_number,customer_name,status,created_at', { count: 'exact' })
        .ilike('request_number', `%${filters.search}%`)
      if (filters.status) query = query.eq('status', filters.status)
      const result = await query.order('created_at', { ascending: false }).range(from, to)
      ;({ data, count, error } = result)
      fields = {
        label: 'request_number',
        secondary: 'customer_name',
        status: 'status',
        createdAt: 'created_at',
      }
      break
    }
    case 'quotes': {
      let query = client
        .from('purchase_quote_requests')
        .select('id,request_number,customer_name,status,created_at', { count: 'exact' })
        .ilike('request_number', `%${filters.search}%`)
      if (filters.status) query = query.eq('status', filters.status)
      const result = await query.order('created_at', { ascending: false }).range(from, to)
      ;({ data, count, error } = result)
      fields = {
        label: 'request_number',
        secondary: 'customer_name',
        status: 'status',
        createdAt: 'created_at',
      }
      break
    }
    case 'customers': {
      const result = await client
        .from('customers')
        .select('id,name,category,created_at', { count: 'exact' })
        .ilike('name', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'name', secondary: 'category', createdAt: 'created_at' }
      break
    }
    case 'providers': {
      const result = await client
        .from('profiles')
        .select('id,name,role,created_at', { count: 'exact' })
        .eq('role', 'provider')
        .ilike('name', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'name', status: 'role', createdAt: 'created_at' }
      break
    }
    case 'custom-builds': {
      const result = await client
        .from('custom_builds')
        .select('id,title,category,is_active,created_at', { count: 'exact' })
        .ilike('title', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = {
        label: 'title',
        secondary: 'category',
        status: 'is_active',
        createdAt: 'created_at',
      }
      break
    }
    case 'gallery': {
      const result = await client
        .from('gallery_albums')
        .select('id,title,slug,category,created_at', { count: 'exact' })
        .ilike('title', `%${filters.search}%`)
        .order('sort_order')
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'title', secondary: 'category', status: 'slug', createdAt: 'created_at' }
      break
    }
    case 'chats': {
      const result = await client.rpc('get_superadmin_chat_inbox', {
        p_status: filters.status,
        p_search: filters.search,
      })
      data = result.data
      error = result.error
      count = rawRows(data).length
      fields = {
        label: 'customer_name',
        secondary: 'context_label',
        status: 'status',
        createdAt: 'last_message_at',
      }
      break
    }
    case 'notifications': {
      const result = await client
        .from('notifications')
        .select('id,title,type,priority,created_at', { count: 'exact' })
        .ilike('title', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = { label: 'title', secondary: 'type', status: 'priority', createdAt: 'created_at' }
      break
    }
    case 'admins':
    case 'users': {
      const result = await client.rpc(section === 'admins' ? 'get_all_admins' : 'get_all_users')
      data = result.data
      error = result.error
      count = rawRows(data).length
      fields = { label: 'name', secondary: 'email', status: 'role', createdAt: 'created_at' }
      break
    }
    case 'logs':
    case 'system-events': {
      const result = await client
        .from('admin_logs')
        .select('id,action,entity_type,entity_name,created_at', { count: 'exact' })
        .ilike('action', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = {
        label: 'action',
        secondary: 'entity_name',
        status: 'entity_type',
        createdAt: 'created_at',
      }
      break
    }
    case 'contact-submissions':
    case 'support-inquiries': {
      let query = client
        .from('contact_submissions')
        .select('id,name,product_slug,status,created_at,message', { count: 'exact' })
      query =
        section === 'support-inquiries'
          ? query.ilike('message', '[support]%')
          : query.not('message', 'ilike', '[support]%')
      const result = await query
        .ilike('name', `%${filters.search}%`)
        .order('created_at', { ascending: false })
        .range(from, to)
      ;({ data, count, error } = result)
      fields = {
        label: 'name',
        secondary: 'product_slug',
        status: 'status',
        createdAt: 'created_at',
      }
      break
    }
  }

  assertQuery(error)
  return {
    rows: gridRows(data, fields),
    count: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}

export async function readAdminRequestDetail(
  locale: string,
  kind: 'requests' | 'quotes',
  id: string,
  injectedClient?: SupabaseClient<Database>
): Promise<AdminGridRow | null> {
  const gate = await requireAdmin({ locale })
  assertAdminPermission(gate.role, 'requests.read')
  const client = injectedClient ?? (await createSupabaseServerClient())
  const result =
    kind === 'requests'
      ? await client
          .from('rental_requests')
          .select('id,request_number,customer_name,status,created_at')
          .eq('id', id)
          .maybeSingle()
      : await client
          .from('purchase_quote_requests')
          .select('id,request_number,customer_name,status,created_at')
          .eq('id', id)
          .maybeSingle()
  assertQuery(result.error)
  if (!result.data) return null
  return (
    gridRows([result.data], {
      label: 'request_number',
      secondary: 'customer_name',
      status: 'status',
      createdAt: 'created_at',
    })[0] ?? null
  )
}
