import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), 'supabase/migrations', name), 'utf8').toLowerCase()

describe('DBMIG-008/009 static security contracts', () => {
  it('keeps client IDs nullable and uniquely scoped to sender', () => {
    const sql = migration('20260714000001_phase5_chat_client_message_id.sql')
    expect(sql).toContain('add column if not exists client_message_id uuid')
    expect(sql).toContain('(sender_id, client_message_id)')
    expect(sql).toContain('where client_message_id is not null')
    expect(sql).not.toContain('client_message_id uuid not null')
  })

  it('makes rate counters private, durable, and enforced at insert', () => {
    const sql = migration('20260714000002_phase5_chat_message_rate_limit.sql')
    expect(sql).toContain('enable row level security')
    expect(sql).toContain('revoke all on table public.chat_message_rate_counters')
    expect(sql).toContain('before insert on public.chat_messages')
    expect(sql).toContain('statement_timestamp()')
  })
})
