import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), '..', 'supabase/functions/cloudinary-assets/index.ts'),
  'utf8'
)

describe('ADMIN-015/016 Edge Function hardening contract', () => {
  it('keeps staged upload MFA while making delete assurance unconditional', () => {
    expect(source).toMatch(/ADMIN_MFA_ENFORCEMENT['"]\) === ['"]1['"]/)
    expect(source).toMatch(/aal !== ['"]aal2['"]/)
    expect(source).toContain('ageSeconds > 900')
    expect(source).toContain('hasRecentAal2(auth.claims)')
    expect(source).toMatch(/\.select\(['"]role,is_active['"]\)/)
  })
  it('bounds, validates, deduplicates, and audits Cloudinary deletion', () => {
    expect(source).toContain('const MAX_DELETE_BATCH = 25')
    expect(source).toContain('isOwnedCloudinaryAsset(cloudName, publicId, config.cloudName)')
    expect(source).toContain('cloudName === configuredCloudName')
    expect(source).toContain('isAllowedDeleteFolder(publicId)')
    expect(source).toContain('begin_admin_media_delete')
    expect(source).toContain('complete_admin_media_delete')
    expect(source).toContain('idempotencyKey')
    expect(source.indexOf('begin_admin_media_delete')).toBeLessThan(source.indexOf('destroyImage('))
  })
  it('chooses the signed preset and fixed durable quotas server-side', () => {
    expect(source).toContain('CLOUDINARY_ADMIN_UPLOAD_PRESET')
    expect(source).toContain('consume_admin_upload_quota')
    expect(source).toContain('p_hour_limit: 30')
    expect(source).toContain('p_day_limit: 300')
    expect(source).not.toContain('p_actor_id: auth.actorId')
    expect(source).not.toContain('body.uploadPreset')
  })

  it('accepts legacy and canonical upload folder forms', () => {
    expect(source).toContain('const rootPrefix = ${ROOT_FOLDER}/')
    expect(source).toContain('normalized.startsWith(rootPrefix)')
    expect(source).toContain('normalized.slice(rootPrefix.length)')
  })
})
