import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database, ContactSubmissionRow } from '../lib/database.types'

type ContactInsert = Database['public']['Tables']['contact_submissions']['Insert']
type ContactUpdate = Database['public']['Tables']['contact_submissions']['Update']

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  productId: string | null
  productSlug: string | null
  city: string
  address: string
  message: string
  status: string
  createdAt: string
}

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

async function resolveProductIdBySlug(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return (data as { id: string }).id
}

function dbToApp(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    productId: row.product_id ?? null,
    productSlug: row.product_slug,
    city: row.city,
    address: row.address,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function getAll(): Promise<ContactSubmission[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<ContactSubmissionRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(submission: {
  name: string
  email: string
  phone: string
  productSlug?: string | null
  city: string
  address: string
  message: string
}): Promise<ContactSubmission> {
  ensureSupabase()

  const productId = await resolveProductIdBySlug(submission.productSlug)

  const payload: ContactInsert = {
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    product_id: productId,
    product_slug: submission.productSlug || null,
    city: submission.city,
    address: submission.address,
    message: submission.message,
  }

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(payload)
    .select('*')
    .single()
    .returns<ContactSubmissionRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function updateStatus(id: string, status: string): Promise<void> {
  ensureSupabase()

  const payload: ContactUpdate = { status }

  const { error } = await supabase.from('contact_submissions').update(payload).eq('id', id)
  if (error) throw error
}

export async function remove(id: string): Promise<void> {
  ensureSupabase()

  const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
  if (error) throw error
}
