import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260706_notification_system.sql'),
  'utf8'
)

function expectSql(pattern: RegExp) {
  expect(sql).toMatch(pattern)
}

describe('notification migration security and recipient semantics', () => {
  it('stores one notification row per recipient', () => {
    expectSql(/recipient_user_id uuid NOT NULL REFERENCES public\.profiles\(id\)/)
  })

  it('allows recipients to select only their own rows', () => {
    expectSql(/CREATE POLICY notifications_select_own[\s\S]*recipient_user_id = \(select auth\.uid\(\)\)/)
  })

  it('has no authenticated direct write grant', () => {
    expectSql(/REVOKE INSERT, UPDATE, DELETE ON public\.notifications FROM anon, authenticated/)
  })

  it('marks a single row only when owned by the caller', () => {
    expectSql(/mark_notification_read[\s\S]*id = p_notification_id[\s\S]*recipient_user_id = auth\.uid\(\)/)
  })

  it('mark-all is scoped to the current recipient', () => {
    expectSql(/mark_all_notifications_read[\s\S]*recipient_user_id = auth\.uid\(\)[\s\S]*read_at IS NULL/)
  })

  it('unread count is scoped to the current recipient', () => {
    expectSql(/get_notification_unread_count[\s\S]*recipient_user_id = auth\.uid\(\)[\s\S]*read_at IS NULL/)
  })

  it('prevents duplicate automatic rows using recipient plus dedupe key', () => {
    expectSql(/CREATE UNIQUE INDEX[\s\S]*notifications_recipient_dedupe_idx[\s\S]*recipient_user_id, dedupe_key/)
  })

  it('uses conflict handling for retry idempotency', () => {
    expectSql(/ON CONFLICT \(recipient_user_id, dedupe_key\)[\s\S]*DO UPDATE SET/)
  })
})

describe('automatic event notification contracts', () => {
  it('new rental requests notify the submitting client', () => {
    expectSql(/notification_rental_created[\s\S]*'rental_submitted'[\s\S]*NEW\.profile_id/)
  })

  it('new rental requests target admins and superadmins', () => {
    expectSql(/notification_rental_created[\s\S]*p\.role IN \('admin', 'superadmin'\)/)
  })

  it('new purchase quotes notify the client and operational staff', () => {
    expectSql(/notification_purchase_quote_created[\s\S]*'quote_submitted'[\s\S]*p\.role IN \('admin', 'superadmin'\)/)
  })

  it('contact submissions notify all admin roles', () => {
    expectSql(/notification_contact_submitted[\s\S]*p\.role IN \('admin', 'superadmin'\)/)
  })

  it('authenticated contact ownership is captured from auth.uid instead of client input', () => {
    expectSql(/notification_capture_contact_submitter[\s\S]*NEW\.submitter_profile_id := auth\.uid\(\)/)
  })

  it('rental status trigger fires only when status actually changes', () => {
    expectSql(/notification_rental_status_changed_after_update[\s\S]*WHEN \(OLD\.status IS DISTINCT FROM NEW\.status\)/)
  })

  it('purchase quote status trigger fires only when status actually changes', () => {
    expectSql(/notification_purchase_quote_status_changed_after_update[\s\S]*WHEN \(OLD\.status IS DISTINCT FROM NEW\.status\)/)
  })

  it('uses the exact required quoted message', () => {
    expect(sql).toContain('Your request has been quoted. Our team will contact you.')
  })

  it('does not reference rental internal admin notes in notification generation', () => {
    expect(sql).not.toContain('admin_internal_notes')
  })
})

describe('live chat notification contracts', () => {
  it('customer messages target superadmins only', () => {
    expectSql(/IF NEW\.sender_type = 'customer'[\s\S]*WHERE p\.role = 'superadmin'/)
  })

  it('normal admins are not part of the chat recipient query', () => {
    const chatBlock = sql.split('CREATE OR REPLACE FUNCTION public.notification_chat_message_created()')[1]
      .split('DROP TRIGGER IF EXISTS notification_chat_message_created_after_insert')[0]
    expect(chatBlock).not.toMatch(/p\.role\s*=\s*'admin'/)
    expect(chatBlock).not.toMatch(/p\.role\s+IN\s*\([^)]*'admin'/)
  })

  it('superadmin replies target the exact conversation owner', () => {
    expectSql(/ELSIF NEW\.sender_type = 'superadmin'[\s\S]*v_conversation\.customer_id/)
  })

  it('admin chat deep link points to the exact conversation', () => {
    expect(sql).toContain("'/admin/chats?conversation=' || NEW.conversation_id::text")
  })

  it('client chat deep link points to the exact conversation', () => {
    expect(sql).toContain("'/?supportChat=' || NEW.conversation_id::text")
  })

  it('aggregates chat notifications by conversation direction instead of one row per message', () => {
    expect(sql).toContain("':customer-to-super'")
    expect(sql).toContain("':super-to-customer'")
    expectSql(/notification_chat_message_created[\s\S]*true[\s\S]*RETURN NEW/)
  })
})

describe('custom broadcast contracts', () => {
  it('rejects non-superadmins at the database boundary', () => {
    expectSql(/send_custom_notification[\s\S]*NOT public\.is_superadmin\(\)[\s\S]*Super Admin access required/)
  })

  it('supports client-only selection', () => {
    expectSql(/p_clients AND COALESCE\(p\.role, 'user'\) NOT IN \('admin', 'superadmin'\)/)
  })

  it('supports regular-admin-only selection', () => {
    expectSql(/p_admins AND p\.role = 'admin'/)
  })

  it('supports superadmin-only selection', () => {
    expectSql(/p_superadmins AND p\.role = 'superadmin'/)
  })

  it('uses one OR-filtered profile query so combined audiences do not duplicate recipients', () => {
    expectSql(/FROM public\.profiles p[\s\S]*WHERE \(p_clients AND[\s\S]*OR \(p_admins AND[\s\S]*OR \(p_superadmins AND/)
  })

  it('rejects an empty audience', () => {
    expect(sql).toContain('Select at least one audience')
  })

  it('validates custom targets as internal paths', () => {
    expectSql(/notification_target_is_safe[\s\S]*left\(p_target_url, 1\) = '\/'[\s\S]*left\(p_target_url, 2\) <> '\/\/'[\s\S]*position\(chr\(10\) in p_target_url\) = 0/)
  })

  it('records the broadcast in structured admin logs', () => {
    expectSql(/INSERT INTO public\.admin_logs[\s\S]*'notification_broadcast'/)
  })
})
