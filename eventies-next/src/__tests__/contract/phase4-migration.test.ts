import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260713000001_phase4_idempotency_and_checks.sql'),
  'utf8'
)

describe('REQ-003/004/005/014 Wave C contract', () => {
  it('preserves the public JSONB RPC signatures', () => {
    expect(sql).toContain('create or replace function public.create_rental_request(payload jsonb)')
    expect(sql).toContain(
      'create or replace function public.create_purchase_quote_request(payload jsonb)'
    )
  })
  it('adds per-profile idempotency and keeps frozen Vite null-compatible', () => {
    expect(sql).toContain('(profile_id, idempotency_key)')
    expect(sql).toContain('where idempotency_key is not null')
  })
  it('does not duplicate existing lower-bound/date checks', () => {
    expect(sql).not.toContain('rental_end_date >= rental_start_date')
    expect(sql).not.toContain('quantity > 0')
    expect(sql).toContain('quantity <= 100')
  })
})
