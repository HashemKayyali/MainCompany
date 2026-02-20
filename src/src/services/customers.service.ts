import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { CustomerRow, Database } from '../lib/database.types'
import type { Customer } from '../data/customers'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function slugify(input: string) {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// DB uses: logo_url
// App uses: logo
function dbToApp(row: CustomerRow): Customer {
  return {
    slug: row.slug || slugify(row.name) || `customer-${Date.now()}`,
    name: row.name,
    logo: row.logo_url ?? '',
    category: row.category ?? '',
  }
}

export async function getAll(): Promise<Customer[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })
    .returns<CustomerRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(customer: Customer): Promise<Customer> {
  ensureSupabase()

  const payload: CustomerInsert = {
    name: customer.name,
    slug: customer.slug?.trim() ? customer.slug : slugify(customer.name) || `customer-${Date.now()}`,
    logo_url: customer.logo || '',
    category: customer.category || '',
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select('*')
    .single()
    .returns<CustomerRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, customer: Partial<Customer>): Promise<Customer> {
  ensureSupabase()

  const dbData: CustomerUpdate = {}
  if (customer.name !== undefined) dbData.name = customer.name
  if (customer.slug !== undefined) dbData.slug = customer.slug
  if (customer.logo !== undefined) dbData.logo_url = customer.logo
  if (customer.category !== undefined) dbData.category = customer.category

  const { data, error } = await supabase
    .from('customers')
    .update(dbData)
    .eq('slug', slug)
    .select('*')
    .single()
    .returns<CustomerRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('customers').delete().eq('slug', slug)
  if (error) throw error
}