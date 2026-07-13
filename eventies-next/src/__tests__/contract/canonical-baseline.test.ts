import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260710000000_canonical_baseline.sql'),
  'utf8'
)

const lower = sql.toLowerCase()

describe('canonical pre-Next database baseline', () => {
  it('contains the complete captured application table set', () => {
    const tables = [
      'admin_logs',
      'categories',
      'chat_conversations',
      'chat_messages',
      'chat_quick_questions',
      'chat_read_states',
      'contact_rate_limit',
      'contact_submissions',
      'custom_build_categories',
      'custom_builds',
      'customers',
      'gallery_albums',
      'inventory_reservations',
      'notifications',
      'parts',
      'product_images',
      'products',
      'profiles',
      'purchase_quote_items',
      'purchase_quote_requests',
      'rental_request_items',
      'rental_requests',
      'request_status_history',
    ]

    for (const table of tables) {
      expect(lower).toContain(`create table "public"."${table}"`)
    }
  })

  it('leaves all seven Next-era schema changes to their dated migrations', () => {
    for (const table of [
      'app_events',
      'app_rate_limits',
      'public_form_dedup',
      'chat_message_rate_counters',
      'admin_media_operations',
      'admin_rpc_idempotency',
      'admin_upload_signing_windows',
    ]) {
      expect(lower).not.toContain(`create table "public"."${table}"`)
    }
  })

  it('contains no prohibited production data or credential material', () => {
    expect(sql).not.toMatch(/^copy\s+/im)
    expect(sql).not.toMatch(/insert\s+into\s+"?auth"?\."?users"?/i)
    expect(sql).not.toMatch(/insert\s+into\s+"?storage"?\."?objects"?/i)
    expect(sql).not.toMatch(/insert\s+into\s+"?supabase_migrations/i)
    expect(sql).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(sql).not.toMatch(/password\s+'/i)
    expect(sql).not.toMatch(/^\\(?:un)?restrict/m)
    expect(sql).not.toMatch(/^alter .* owner to /im)
  })

  it('reproduces captured auth, storage, and realtime configuration', () => {
    expect(lower).toContain('on_auth_user_created')
    expect(lower).toContain('on_auth_user_updated_profile_sync')
    expect(lower).toContain('insert into "storage"."buckets"')
    expect(lower).toContain("'product-images'")
    expect(lower).toContain("'product-videos'")
    expect(lower).toContain('admin write product-images')
    expect(lower).toContain('admin write product-videos')
    for (const table of ['profiles', 'chat_conversations', 'chat_messages', 'notifications']) {
      expect(lower).toContain(`alter publication "supabase_realtime" add table "public"."${table}"`)
    }
  })

  it('keeps direct table DELETE privileges unchanged before Group E', () => {
    expect(lower).not.toMatch(/revoke\s+delete\s+on/i)
  })

  it('preserves the frozen admin_update_user signature without removed avatar columns', () => {
    const start = lower.indexOf('create function "public"."admin_update_user"')
    const end = lower.indexOf('$$;', start)
    const adminUpdate = lower.slice(start, end)

    expect(adminUpdate).toContain('"new_avatar_url" "text"')
    expect(adminUpdate).toContain('update public.profiles p')
    expect(adminUpdate).toContain('admin_update_user.new_name')
    expect(adminUpdate).toContain('admin_update_user.new_phone')
    expect(adminUpdate).not.toContain('p.avatar_')
  })
})
