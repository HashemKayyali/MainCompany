import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20260715000004_phase6_admin_audit_actions.sql'),
  'utf8'
)

const requiredActions = [
  'create',
  'update',
  'delete',
  'bulk_delete',
  'role_changed',
  'admin_removed',
  'cloudinary_delete_started',
  'cloudinary_delete_retry',
  'cloudinary_delete',
  'upload_quota',
  'notification_broadcast',
] as const

describe('Phase 6 admin audit action compatibility migration', () => {
  it('replaces the legacy constraint with a bounded action vocabulary', () => {
    expect(migration).toContain('drop constraint if exists admin_logs_action_check')
    expect(migration).toContain('add constraint admin_logs_action_check')
    expect(migration).toContain('check (')

    for (const action of requiredActions) {
      expect(migration).toContain(`'${action}'::text`)
    }
  })

  it('is an atomic forward migration and does not broaden table grants', () => {
    expect(migration).toMatch(/^begin;/m)
    expect(migration).toMatch(/^commit;/m)
    expect(migration).not.toMatch(/grant\s+/i)
    expect(migration).not.toMatch(/disable\s+row\s+level\s+security/i)
  })
})
