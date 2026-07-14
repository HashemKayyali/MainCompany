import { createClient } from '@supabase/supabase-js'

const STAGING_REF = 'ogfgaupebcabuoczoqcy'
const PRODUCTION_REF = 'dqizzlcsioqykfeldtsj'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.STAGING_SUPERADMIN_EMAIL
const password = process.env.STAGING_SUPERADMIN_PASSWORD

if (!url || !serviceKey || !email || !password) {
  throw new Error(
    'Required process-only variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STAGING_SUPERADMIN_EMAIL, STAGING_SUPERADMIN_PASSWORD'
  )
}
if (!url.includes(STAGING_REF) || url.includes(PRODUCTION_REF)) {
  throw new Error('Refusing to bootstrap outside the authorized Staging project')
}
if (password.length < 16)
  throw new Error('Staging superadmin password must be at least 16 characters')

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

let createdUserId
try {
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Eventies Staging Superadmin' },
  })
  if (created.error || !created.data.user) {
    throw created.error ?? new Error('Disposable superadmin user creation failed')
  }
  createdUserId = created.data.user.id

  const bootstrapped = await supabase.rpc('bootstrap_first_superadmin', {
    p_target_id: createdUserId,
  })
  if (bootstrapped.error || bootstrapped.data?.ok !== true) {
    throw bootstrapped.error ?? new Error('First-superadmin bootstrap failed')
  }

  const retired = await supabase.rpc('retire_first_superadmin_bootstrap')
  if (retired.error || retired.data !== true) {
    throw retired.error ?? new Error('Bootstrap retirement failed')
  }

  console.log('STAGING_SUPERADMIN_READY')
  console.log(`STAGING_SUPERADMIN_ID=${createdUserId}`)
  console.log('BOOTSTRAP_FUNCTION_RETIRED')
} catch (error) {
  if (createdUserId) {
    const profile = await supabase
      .from('profiles')
      .select('role')
      .eq('id', createdUserId)
      .maybeSingle()
    if (!profile.error && profile.data?.role !== 'superadmin') {
      await supabase.auth.admin.deleteUser(createdUserId)
    }
  }
  throw error
}
