import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260715000001_phase6_admin_assurance.sql'),
  'utf8'
).toLowerCase()

function body(name: string) {
  const start = sql.indexOf(`function public.${name}`)
  expect(start, `${name} exists`).toBeGreaterThan(-1)
  return sql.slice(start, sql.indexOf('$$;', start) + 3)
}

describe('DBMIG-010 assurance and BYPASS-01..09 static contract', () => {
  it('locks the private assurance helper to a trusted owner and API-role revocations', () => {
    const assurance = body('assert_admin_assurance')
    expect(assurance).toContain('security definer')
    expect(assurance).toContain('set search_path = pg_catalog')
    expect(assurance).toContain('auth.uid()')
    expect(assurance).toContain('auth.jwt()')
    expect(assurance).toContain('public.profiles')
    expect(assurance).toContain('auth.users')
    expect(assurance).toContain("!~ '^[0-9]+([.][0-9]+)?$'")
    expect(assurance).toContain('v_auth_time > v_now')
    expect(assurance).toContain('not pg_catalog.coalesce(v_active, false)')
    expect(sql).toContain(
      'alter function public.assert_admin_assurance(text, integer) owner to postgres'
    )
    expect(sql).toContain(
      'revoke all on function public.assert_admin_assurance(text, integer) from public, anon, authenticated'
    )
  })

  it.each([
    ['BYPASS-01', 'delete_admin_product'],
    ['BYPASS-02', 'delete_admin_category'],
    ['BYPASS-03', 'delete_admin_gallery_album'],
    ['BYPASS-04', 'delete_admin_custom_build'],
    ['BYPASS-06', 'set_admin_role'],
    ['BYPASS-07', 'remove_admin'],
    ['BYPASS-08', 'send_custom_notification'],
    ['BYPASS-09', 'bulk_delete_admin_entities'],
  ])('%s calls assurance before mutation and transactionally audits', (_id, name) => {
    const fn = body(name)
    const assurance = fn.indexOf('assert_admin_assurance')
    const mutation = Math.max(
      fn.indexOf('delete from'),
      fn.indexOf('update public.'),
      fn.indexOf('insert into public.notifications')
    )
    const audit = fn.indexOf('write_admin_audit')
    expect(assurance).toBeGreaterThan(-1)
    expect(mutation).toBeGreaterThan(assurance)
    expect(audit).toBeGreaterThan(mutation)
  })

  it('implements one bounded, duplicate-collapsing, all-or-nothing bulk RPC', () => {
    const bulk = body('bulk_delete_admin_entities')
    expect(bulk).toContain('cardinality(target_ids)>25')
    expect(bulk).toContain('array_agg(distinct')
    expect(bulk).toContain('if v_deleted <> cardinality(v_ids)')
    expect(bulk).not.toContain('execute ')
  })

  it('preserves direct DELETE privileges until Group E', () => {
    expect(sql).not.toMatch(/revoke\s+delete\s+on/)
  })

  it('rolls mutations back when same-transaction audit insertion fails', () => {
    expect(body('write_admin_audit')).toContain('insert into public.admin_logs')
    expect(sql).toMatch(/^begin;/m)
    expect(sql).toMatch(/^commit;/m)
    expect(sql).not.toContain('exception when others then return')
  })

  it('locks and preserves the final active superadmin', () => {
    for (const name of ['set_admin_role', 'remove_admin']) {
      const fn = body(name)
      expect(fn).toContain("pg_advisory_xact_lock(hashtext('eventies:superadmin-invariant'))")
      expect(fn).toContain('join auth.users')
      expect(fn).toContain('u.deleted_at is null')
      expect(fn).toContain('u.banned_until')
      expect(fn).toContain('v_remaining=0')
      expect(fn).toContain('final active superadmin')
    }
  })

  it('implements BYPASS-05 media idempotency and bounded targets', () => {
    const begin = body('begin_admin_media_delete')
    expect(begin).toContain('assert_admin_assurance')
    expect(begin).toContain('cardinality(p_public_ids)>25')
    expect(begin).toContain('array_agg(distinct')
    expect(begin).toContain('for update')
    expect(begin).toContain("v_status in ('failed','orphaned')")
    expect(begin).toContain('cloudinary_delete_started')
    expect(begin).toContain('cloudinary_delete_retry')
    expect(begin).toContain(
      'categories|customers|parts|gallery|custom-builds|products|general|uploads'
    )
    expect(sql).toContain('unique (actor_id, idempotency_key)')
    expect(body('complete_admin_media_delete')).toContain('write_admin_audit')
  })

  it('implements durable atomic signing quotas using only the authenticated actor', () => {
    const quota = body('consume_admin_upload_quota')
    expect(quota).toContain('assert_admin_assurance')
    expect(quota).not.toContain('p_actor_id')
    expect(quota).toContain('on conflict(actor_id,period,window_start) do update')
    expect(quota).toContain('write_admin_audit')
    expect(quota).toContain("'succeeded'")
  })
})
