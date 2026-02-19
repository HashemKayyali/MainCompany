import { supabase } from '../lib/supabase'
import type { ContactSubmissionRow } from '../lib/database.types'

export interface ContactSubmission {
  id: string; name: string; email: string; phone: string
  productSlug: string; city: string; address: string; message: string
  status: string; createdAt: string
}

function dbToApp(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    productSlug: row.product_slug, city: row.city, address: row.address,
    message: row.message, status: row.status, createdAt: row.created_at,
  }
}

export async function getAll(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(submission: {
  name: string; email: string; phone: string
  productSlug: string; city: string; address: string; message: string
}): Promise<ContactSubmission> {
  const { data, error } = await supabase.from('contact_submissions').insert({
    name: submission.name, email: submission.email, phone: submission.phone,
    product_slug: submission.productSlug, city: submission.city,
    address: submission.address, message: submission.message,
  }).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function updateStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('contact_submissions').update({ status }).eq('id', id)
  if (error) throw error
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
  if (error) throw error
}
