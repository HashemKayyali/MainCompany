import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), '..', 'supabase/functions/cloudinary-assets/index.ts'),
  'utf8'
)

describe('ADMIN-015/016 Edge Function hardening contract', () => {
  it('stages AAL2 and recent-auth enforcement without changing the legacy default', () => {
    expect(source).toContain("ADMIN_MFA_ENFORCEMENT') === '1'")
    expect(source).toContain("aal !== 'aal2'")
    expect(source).toContain('ageSeconds > 900')
  })
  it('chooses the signed preset and fixed durable quotas server-side', () => {
    expect(source).toContain('CLOUDINARY_ADMIN_UPLOAD_PRESET')
    expect(source).toContain('consume_admin_upload_quota')
    expect(source).toContain('p_hour_limit: 30')
    expect(source).toContain('p_day_limit: 300')
    expect(source).not.toContain('body.uploadPreset')
  })
})
