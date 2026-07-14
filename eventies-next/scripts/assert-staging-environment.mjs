const STAGING_REF = 'ogfgaupebcabuoczoqcy'
const PRODUCTION_REF = 'dqizzlcsioqykfeldtsj'

const requiredVariables = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const missing = requiredVariables.filter((name) => !process.env[name]?.trim())
const invalid = new Set()

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
if (publicUrl && (!publicUrl.includes(STAGING_REF) || publicUrl.includes(PRODUCTION_REF))) {
  invalid.add('NEXT_PUBLIC_SUPABASE_URL')
}

for (const [name, value] of Object.entries(process.env)) {
  if (!value || !/SUPABASE.*URL/i.test(name) || name === 'NEXT_PUBLIC_SUPABASE_URL') continue
  if (value.includes(PRODUCTION_REF) || !value.includes(STAGING_REF)) invalid.add(name)
}

const rejectedVariables = [...new Set([...missing, ...invalid])].sort()
if (rejectedVariables.length > 0) {
  rejectedVariables.forEach((name) => console.log(name))
  process.exitCode = 1
} else {
  console.log('STAGING_ENV_CONFIRMED')
  console.log(STAGING_REF)
}
