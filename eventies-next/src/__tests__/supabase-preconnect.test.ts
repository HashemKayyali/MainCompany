import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'src/app/[locale]/layout.tsx'), 'utf8')

describe('ENV-002 Supabase connection hint isolation', () => {
  it('derives the connection origin from the guarded environment', () => {
    expect(source).toContain('process.env.NEXT_PUBLIC_SUPABASE_URL')
    expect(source).toContain('href={configuredSupabaseOrigin}')
  })

  it('does not hard-code the Production project ref', () => {
    expect(source).not.toContain('dqizzlcsioqykfeldtsj')
  })
})
