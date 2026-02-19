import { supabase } from '../lib/supabase'
import type { CustomerRow } from '../lib/database.types'
import type { Customer } from '../data/customers'

// DB uses: logo_url
// App uses: logo
function dbToApp(row: CustomerRow): Customer {
  return {
    slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
    name: row.name,
    logo: row.logo_url || '',           // DB "logo_url" → App "logo"
    category: row.category || '',
  }
}

export async function getAll(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert({
    name: customer.name,
    slug: customer.slug || customer.name.toLowerCase().replace(/\s+/g, '-'),
    logo_url: customer.logo || '',      // App "logo" → DB "logo_url"
    category: customer.category || '',
  }).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, customer: Partial<Customer>): Promise<Customer> {
  const dbData: any = {}
  if (customer.name !== undefined) dbData.name = customer.name
  if (customer.slug !== undefined) dbData.slug = customer.slug
  if (customer.logo !== undefined) dbData.logo_url = customer.logo   // logo → logo_url
  if (customer.category !== undefined) dbData.category = customer.category

  const { data, error } = await supabase.from('customers').update(dbData).eq('slug', slug).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('slug', slug)
  if (error) throw error
}
