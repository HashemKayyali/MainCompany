import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/app/api/auth/signup/route.ts'), 'utf8')

describe('AUTH-002 signup response and observability contract', () => {
  it('keeps the public response enumeration-safe', () => {
    expect(source).toContain('UNIFORM_AUTH_MESSAGE')
    expect(source).toContain(
      'return NextResponse.json({ ok: true, message: UNIFORM_AUTH_MESSAGE })'
    )
  })

  it('records a scrub-safe Supabase error code instead of silently claiming persistence', () => {
    expect(source).toContain("track('auth.signup_failed'")
    expect(source).toContain("error?.code ?? 'user-not-returned'")
    expect(source).toContain("track('auth.signup_submitted'")
  })
})
