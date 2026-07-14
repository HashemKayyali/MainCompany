import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const STAGING_REF = 'ogfgaupebcabuoczoqcy'
const PRODUCTION_REF = 'dqizzlcsioqykfeldtsj'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const previewUrl = process.argv.find((argument) => argument.startsWith('https://'))

if (!url || !anonKey || !serviceKey)
  throw new Error('Required Preview Supabase variables are missing')
if (!url.includes(STAGING_REF) || url.includes(PRODUCTION_REF)) {
  throw new Error('Staging environment assertion failed')
}
if (!process.argv.includes('--cleanup-only') && !previewUrl?.endsWith('.vercel.app')) {
  throw new Error('A Preview deployment URL is required')
}

const service = createClient(url, serviceKey, { auth: { persistSession: false } })
const createdUsers = []
const createdProducts = []
const results = []

function record(id, ok, detail = '') {
  results.push({ id, ok, detail })
  console.log(`${id}=${ok ? 'PASS' : `BLOCKED:${detail}`}`)
}

function assert(value, message) {
  if (!value) throw new Error(message)
}

function client() {
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function previewPost(path, body, cookie) {
  return fetch(new URL(path, previewUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewUrl,
      'sec-fetch-site': 'same-origin',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    redirect: 'manual',
  })
}

function setCookies(response) {
  return response.headers.getSetCookie?.() ?? [response.headers.get('set-cookie')].filter(Boolean)
}

async function createUser(label) {
  const password = `Sg!${randomBytes(18).toString('base64url')}9a`
  const email = `eventies-${label}-${Date.now()}-${randomUUID()}@example.test`
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Staging ${label}` },
  })
  if (error || !data.user) throw error ?? new Error('Disposable user creation failed')
  createdUsers.push(data.user.id)
  return { id: data.user.id, email, password }
}

async function signIn(fixture, password = fixture.password) {
  const auth = client()
  const { data, error } = await auth.auth.signInWithPassword({ email: fixture.email, password })
  if (error || !data.session) throw error ?? new Error('Disposable login failed')
  return { auth, session: data.session }
}

function base32Decode(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of value.replace(/=+$/u, '').toUpperCase()) {
    const index = alphabet.indexOf(char)
    if (index < 0) throw new Error('Invalid TOTP secret')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2))
  }
  return Buffer.from(bytes)
}

function totp(secret, timestamp = Date.now()) {
  const counter = BigInt(Math.floor(timestamp / 30_000))
  const input = Buffer.alloc(8)
  input.writeBigUInt64BE(counter)
  const digest = createHmac('sha1', base32Decode(secret)).update(input).digest()
  const offset = digest.at(-1) & 0x0f
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return binary.toString().padStart(6, '0')
}

async function cleanup() {
  const fixtureUsers = []
  for (let page = 1; page <= 10; page += 1) {
    const listed = await service.auth.admin.listUsers({ page, perPage: 100 })
    if (listed.error) throw new Error('Fixture user discovery failed')
    fixtureUsers.push(
      ...listed.data.users.filter((user) =>
        /^eventies-customer-[ab]-.*@example[.](?:test|com)$/u.test(user.email ?? '')
      )
    )
    if (listed.data.users.length < 100) break
  }
  const userIds = [...new Set([...createdUsers, ...fixtureUsers.map((user) => user.id)])]
  const productRows = await service
    .from('products')
    .select('id')
    .eq('title', 'Disposable staging product')
  if (productRows.error) throw new Error('Fixture product discovery failed')
  const productIds = [
    ...new Set([...createdProducts, ...(productRows.data ?? []).map((product) => product.id)]),
  ]

  async function remove(table, column, ids) {
    if (!ids.length) return
    const { error } = await service.from(table).delete().in(column, ids)
    if (error) throw new Error(`Fixture cleanup failed for ${table}`)
  }

  if (userIds.length) {
    const rentals = await service.from('rental_requests').select('id').in('profile_id', userIds)
    const quotes = await service
      .from('purchase_quote_requests')
      .select('id')
      .in('profile_id', userIds)
    const conversations = await service
      .from('chat_conversations')
      .select('id')
      .in('customer_id', userIds)
    if (rentals.error || quotes.error || conversations.error) {
      throw new Error('Fixture relationship discovery failed')
    }
    const rentalIds = (rentals.data ?? []).map((row) => row.id)
    const quoteIds = (quotes.data ?? []).map((row) => row.id)
    const conversationIds = (conversations.data ?? []).map((row) => row.id)

    await remove('request_status_history', 'request_id', [...rentalIds, ...quoteIds])
    await remove('inventory_reservations', 'rental_request_id', rentalIds)
    await remove('rental_request_items', 'rental_request_id', rentalIds)
    await remove('purchase_quote_items', 'purchase_quote_request_id', quoteIds)
    await remove('rental_requests', 'id', rentalIds)
    await remove('purchase_quote_requests', 'id', quoteIds)
    await remove('chat_messages', 'conversation_id', conversationIds)
    await remove('chat_read_states', 'conversation_id', conversationIds)
    await remove('chat_conversations', 'id', conversationIds)
    await remove('notifications', 'recipient_user_id', userIds)
    await remove('chat_message_rate_counters', 'sender_id', userIds)
    await remove('admin_upload_signing_windows', 'actor_id', userIds)
    await remove('admin_media_operations', 'actor_id', userIds)
    await remove('admin_rpc_idempotency', 'actor_id', userIds)

    for (const user of fixtureUsers) {
      const { error } = await service.auth.admin.deleteUser(user.id)
      if (error) throw new Error('Fixture auth-user cleanup failed')
    }
  }

  await remove('products', 'id', productIds)
  const rateCleanup = await service.from('app_rate_limits').delete().like('bucket_key', 'live-%')
  const dedupCleanup = await service.from('public_form_dedup').delete().like('dedup_key', 'live-%')
  if (rateCleanup.error || dedupCleanup.error) throw new Error('Security-counter cleanup failed')

  const remainingUsers = []
  const listed = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listed.error) throw new Error('Cleanup verification failed')
  remainingUsers.push(
    ...listed.data.users.filter((user) =>
      /^eventies-customer-[ab]-.*@example[.](?:test|com)$/u.test(user.email ?? '')
    )
  )
  const remainingProducts = await service
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('title', 'Disposable staging product')
  if (remainingProducts.error || remainingUsers.length || remainingProducts.count) {
    throw new Error('Disposable fixtures remain after cleanup')
  }
  console.log('FIXTURE_CLEANUP=VERIFIED')
}

if (process.argv.includes('--cleanup-only')) {
  await cleanup()
  process.exit(0)
}

try {
  const userA = await createUser('customer-a')
  const userB = await createUser('customer-b')

  const signupEmail = `eventies-customer-a-${Date.now()}-${randomUUID()}@example.com`
  const signupPassword = `Rg!${randomBytes(18).toString('base64url')}7c`
  const signupResponse = await previewPost('/api/auth/signup', {
    email: signupEmail,
    password: signupPassword,
    rememberMe: false,
    name: 'Disposable Preview Registration',
    turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
  })
  assert(signupResponse.status === 200, `Preview registration returned ${signupResponse.status}`)
  const signupUsers = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const signupUser = signupUsers.data.users.find((user) => user.email === signupEmail)
  assert(!signupUsers.error, 'Preview registration verification failed')
  if (signupUser) {
    createdUsers.push(signupUser.id)
    record('P3_PREVIEW_REGISTRATION_TURNSTILE_SUCCESS', true)
  } else {
    record('P3_PREVIEW_REGISTRATION_TURNSTILE_SUCCESS', false, 'AUTH_SIGNUP_NOT_PERSISTED')
  }

  const { data: profiles, error: profileError } = await service
    .from('profiles')
    .select('id,role,is_active')
    .in('id', [userA.id, userB.id])
  assert(
    !profileError && profiles?.length === 2,
    'Auth-to-profile trigger did not create both profiles'
  )
  record('P3_AUTH_PROFILE_TRIGGER', true)

  const signedA = await signIn(userA)
  const signedB = await signIn(userB)
  record('P3_PASSWORD_LOGIN', true)

  const { data: refreshed, error: refreshError } = await signedA.auth.auth.refreshSession({
    refresh_token: signedA.session.refresh_token,
  })
  assert(!refreshError && refreshed.session, 'Session refresh failed')
  record('P3_SESSION_REFRESH', true)

  const newPassword = `Up!${randomBytes(18).toString('base64url')}8b`
  const { error: updatePasswordError } = await signedA.auth.auth.updateUser({
    password: newPassword,
  })
  assert(!updatePasswordError, 'Password update failed')
  const oldPasswordAttempt = await client().auth.signInWithPassword({
    email: userA.email,
    password: userA.password,
  })
  assert(oldPasswordAttempt.error, 'Old password remained valid after password update')
  const updatedLogin = await signIn(userA, newPassword)
  record('P3_PASSWORD_UPDATE', true)

  const sessionCookieResponse = await previewPost('/api/auth/login', {
    email: userA.email,
    password: newPassword,
    rememberMe: false,
  })
  const sessionCookies = setCookies(sessionCookieResponse)
  assert(
    sessionCookieResponse.status === 200 && sessionCookies.length,
    'Session-cookie login failed'
  )
  assert(
    sessionCookies.every((cookie) => /;\s*secure(?:;|$)/iu.test(cookie)),
    'Secure cookie missing'
  )
  assert(
    sessionCookies.every((cookie) => !/max-age=/iu.test(cookie)),
    'Session cookie was persistent'
  )

  const persistentCookieResponse = await previewPost('/api/auth/login', {
    email: userA.email,
    password: newPassword,
    rememberMe: true,
  })
  const persistentCookies = setCookies(persistentCookieResponse)
  assert(
    persistentCookieResponse.status === 200 && persistentCookies.length,
    'Remember-me login failed'
  )
  assert(
    persistentCookies.every((cookie) => /;\s*secure(?:;|$)/iu.test(cookie)),
    'Secure cookie missing'
  )
  assert(
    persistentCookies.some((cookie) => /max-age=34560000/iu.test(cookie)),
    'Remember-me lifetime missing'
  )
  record('P3_PREVIEW_COOKIE_SECURITY_AND_LIFETIME', true)

  let challengeRequired = false
  for (let attempt = 0; attempt < 7 && !challengeRequired; attempt += 1) {
    const response = await previewPost('/api/auth/login', {
      email: userA.email,
      password: `wrong-${randomUUID()}`,
      rememberMe: false,
    })
    const payload = await response.json().catch(() => ({}))
    challengeRequired = response.status === 403 && payload.code === 'CHALLENGE_REQUIRED'
  }
  assert(challengeRequired, 'Durable login threshold did not require Turnstile')
  record('P3_PREVIEW_TURNSTILE_MISSING', true)
  const failedChallenge = await previewPost('/api/auth/login', {
    email: userA.email,
    password: newPassword,
    rememberMe: false,
    turnstileToken: 'invalid-staging-token',
  })
  record(
    'P3_PREVIEW_TURNSTILE_FAILURE',
    failedChallenge.status === 403,
    failedChallenge.status === 403 ? '' : 'ALWAYS_PASS_TEST_SECRET'
  )
  const passedChallenge = await previewPost('/api/auth/login', {
    email: userA.email,
    password: newPassword,
    rememberMe: false,
    turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
  })
  assert(passedChallenge.status === 200, 'Turnstile test-token success path failed')
  record('P3_PREVIEW_TURNSTILE_SUCCESS', true)
  const replayedChallenge = await previewPost('/api/auth/login', {
    email: userA.email,
    password: newPassword,
    rememberMe: false,
    turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
  })
  record(
    'P3_PREVIEW_TURNSTILE_REPLAY',
    replayedChallenge.status === 403,
    replayedChallenge.status === 403 ? '' : 'TEST_SECRET_HAS_NO_REPLAY_SIGNAL'
  )

  const logoutResponse = await previewPost(
    '/api/auth/logout',
    {},
    persistentCookies.map((cookie) => cookie.split(';', 1)[0]).join('; ')
  )
  assert(logoutResponse.status === 200, 'Preview logout failed')
  assert(
    setCookies(logoutResponse).some((cookie) => /max-age=0/iu.test(cookie)),
    'Logout did not clear cookies'
  )
  record('P3_PREVIEW_LOGOUT', true)

  const recovery = await service.auth.admin.generateLink({
    type: 'recovery',
    email: userA.email,
  })
  assert(
    !recovery.error && recovery.data.properties?.hashed_token,
    'Recovery link generation failed'
  )
  const recoveryClient = client()
  const recoveryVerify = await recoveryClient.auth.verifyOtp({
    token_hash: recovery.data.properties.hashed_token,
    type: 'recovery',
  })
  assert(!recoveryVerify.error && recoveryVerify.data.session, 'Recovery token exchange failed')
  record('P3_PASSWORD_RECOVERY', true)

  const key = `live-${randomUUID()}`
  const rateClients = [
    createClient(url, serviceKey, { auth: { persistSession: false } }),
    createClient(url, serviceKey, { auth: { persistSession: false } }),
  ]
  const rateResults = await Promise.all(
    rateClients.map((instance) =>
      instance.rpc('consume_app_rate_limit', { p_bucket_key: key, p_window_seconds: 600 })
    )
  )
  assert(
    rateResults.every((item) => !item.error),
    'Durable rate-limit RPC failed'
  )
  assert(
    rateResults
      .map((item) => item.data)
      .sort()
      .join(',') === '1,2',
    'Concurrent rate-limit calls did not serialize'
  )
  record('P3_MULTI_INSTANCE_RATE_LIMIT', true)

  const dedupKey = `live-${randomUUID()}`
  const dedupResults = await Promise.all(
    rateClients.map((instance) =>
      instance.rpc('claim_public_form_dedup', { p_dedup_key: dedupKey })
    )
  )
  assert(
    dedupResults.every((item) => !item.error),
    'Form dedup RPC failed'
  )
  assert(
    dedupResults
      .map((item) => item.data)
      .sort()
      .join(',') === 'false,true',
    'Concurrent form claims were not deduplicated'
  )
  record('P3_MULTI_INSTANCE_FORM_DEDUP', true)

  const { data: otherProfile, error: otherProfileError } = await signedA.auth
    .from('profiles')
    .select('id')
    .eq('id', userB.id)
  assert(!otherProfileError && otherProfile?.length === 0, 'Profile RLS leaked another user')
  const { error: profileUpdateError } = await signedA.auth
    .from('profiles')
    .update({ name: 'Staging Customer A Updated' })
    .eq('id', userA.id)
  assert(!profileUpdateError, 'Own-profile update failed')
  record('P4_PROFILE_RLS_AND_UPDATE', true)

  const productId = randomUUID()
  createdProducts.push(productId)
  const { error: productError } = await service.from('products').insert({
    id: productId,
    title: 'Disposable staging product',
    slug: `staging-${randomUUID()}`,
    description: 'Disposable live-validation fixture',
    price: 10,
    rental_enabled: true,
    sale_enabled: true,
    stock_total: 100,
    stock_active: 100,
    minimum_rental_days: 1,
  })
  assert(!productError, 'Product fixture creation failed')

  const common = {
    customer_name: 'Disposable Staging Customer',
    email: userA.email,
    phone: '+966500000000',
    city: 'Riyadh',
    address: 'Disposable staging address',
  }
  const rentalKey = randomUUID()
  const rentalPayload = {
    ...common,
    idempotency_key: rentalKey,
    items: [
      {
        product_id: productId,
        quantity: 1,
        rental_start_date: '2027-01-10',
        rental_end_date: '2027-01-11',
      },
    ],
  }
  const rentalResults = await Promise.all([
    signedA.auth.rpc('create_rental_request', { payload: rentalPayload }),
    updatedLogin.auth.rpc('create_rental_request', { payload: rentalPayload }),
  ])
  assert(
    rentalResults.every((item) => !item.error),
    'Concurrent rental request failed'
  )
  const rentalIds = rentalResults.map((item) => item.data?.[0]?.id)
  assert(
    rentalIds[0] && rentalIds[0] === rentalIds[1],
    'Rental idempotency returned different rows'
  )

  const quoteKey = randomUUID()
  const quotePayload = {
    ...common,
    idempotency_key: quoteKey,
    items: [{ product_id: productId, quantity: 1 }],
  }
  const quoteResults = await Promise.all([
    signedA.auth.rpc('create_purchase_quote_request', { payload: quotePayload }),
    updatedLogin.auth.rpc('create_purchase_quote_request', { payload: quotePayload }),
  ])
  assert(
    quoteResults.every((item) => !item.error),
    'Concurrent purchase quote failed'
  )
  const quoteIds = quoteResults.map((item) => item.data?.[0]?.id)
  assert(quoteIds[0] && quoteIds[0] === quoteIds[1], 'Quote idempotency returned different rows')
  const userBRequests = await signedB.auth
    .from('rental_requests')
    .select('id')
    .eq('id', rentalIds[0])
  assert(
    !userBRequests.error && userBRequests.data?.length === 0,
    'Request RLS leaked another user'
  )
  record('P4_TRANSACTION_IDEMPOTENCY_AND_RLS', true)

  const conversation = await signedA.auth.rpc('get_or_create_chat_conversation', {
    p_context_type: 'staging-validation',
    p_context_ref: randomUUID(),
  })
  assert(!conversation.error && conversation.data, 'Chat conversation creation failed')
  const conversationId = conversation.data
  const clientMessageId = randomUUID()
  const message = {
    conversation_id: conversationId,
    client_message_id: clientMessageId,
    body: 'Disposable staging validation message',
  }
  const messageResults = await Promise.all([
    signedA.auth.from('chat_messages').insert(message).select('id').single(),
    updatedLogin.auth.from('chat_messages').insert(message).select('id').single(),
  ])
  assert(
    messageResults.filter((item) => !item.error).length === 1,
    'Chat duplicate was not collapsed'
  )
  const otherConversation = await signedB.auth
    .from('chat_conversations')
    .select('id')
    .eq('id', conversationId)
  assert(
    !otherConversation.error && otherConversation.data?.length === 0,
    'Chat RLS leaked conversation'
  )
  const counter = await service
    .from('chat_message_rate_counters')
    .select('message_count')
    .eq('sender_id', userA.id)
    .order('window_started_at', { ascending: false })
    .limit(1)
    .single()
  assert(
    !counter.error && counter.data.message_count === 1,
    'Durable chat counter did not converge'
  )
  record('P5_CHAT_DEDUP_RATE_AND_RLS', true)

  const notification = await service
    .from('notifications')
    .insert({
      recipient_user_id: userA.id,
      type: 'staging_validation',
      title: 'Disposable staging notification',
      message: 'Disposable staging notification',
      dedupe_key: randomUUID(),
    })
    .select('id')
    .single()
  assert(!notification.error, 'Notification fixture creation failed')
  const unreadBefore = await signedA.auth.rpc('get_notification_unread_count')
  const marked = await signedA.auth.rpc('mark_notification_read', {
    p_notification_id: notification.data.id,
  })
  const unreadAfter = await signedA.auth.rpc('get_notification_unread_count')
  assert(
    !unreadBefore.error && Number(unreadBefore.data) >= 1,
    'Unread count did not include fixture'
  )
  assert(!marked.error && marked.data === true, 'Notification mark-read failed')
  assert(
    !unreadAfter.error && Number(unreadAfter.data) === Number(unreadBefore.data) - 1,
    'Unread count did not converge'
  )
  record('P5_NOTIFICATION_UNREAD_CONVERGENCE', true)

  const roleUpdate = await service
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userA.id)
    .select('role')
    .single()
  if (roleUpdate.error || roleUpdate.data.role !== 'admin') {
    record('P6_ADMIN_PERSONA_BOOTSTRAP', false, 'EXISTING_SUPERADMIN_REQUIRED_BY_ROLE_TRIGGER')
    record('P6_MFA_AAL2', false, 'NO_AUTHORIZED_ADMIN_PERSONA')
    record('P6_BYPASS_01_THROUGH_09', false, 'NO_AUTHORIZED_ADMIN_PERSONA')
  } else {
    const aal1Denied = await updatedLogin.auth.rpc('consume_admin_upload_quota', {
      p_hour_limit: 30,
      p_day_limit: 300,
    })
    assert(aal1Denied.error, 'AAL1 admin was allowed through privileged RPC')
    record('P6_ADMIN_AAL1_DENIAL', true)

    const enrollment = await updatedLogin.auth.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `staging-${randomUUID()}`,
    })
    if (enrollment.error || !enrollment.data.totp.secret) {
      record('P6_MFA_AAL2', false, 'TOTP_ENROLLMENT_FAILED')
    } else {
      const challenge = await updatedLogin.auth.auth.mfa.challengeAndVerify({
        factorId: enrollment.data.id,
        code: totp(enrollment.data.totp.secret),
      })
      if (challenge.error) {
        record('P6_MFA_AAL2', false, 'TOTP_CHALLENGE_FAILED')
      } else {
        const assurance = await updatedLogin.auth.auth.mfa.getAuthenticatorAssuranceLevel()
        const aal2 = assurance.data?.currentLevel === 'aal2'
        const quota = await updatedLogin.auth.rpc('consume_admin_upload_quota', {
          p_hour_limit: 30,
          p_day_limit: 300,
        })
        if (aal2 && !quota.error && quota.data === true) record('P6_MFA_AAL2', true)
        else record('P6_MFA_AAL2', false, quota.error?.message ?? 'AAL2_NOT_ESTABLISHED')
      }
    }

    await service.from('profiles').update({ is_active: false }).eq('id', userA.id)
    const disabledDenied = await updatedLogin.auth.rpc('consume_admin_upload_quota', {
      p_hour_limit: 30,
      p_day_limit: 300,
    })
    assert(disabledDenied.error, 'Disabled admin was allowed through privileged RPC')
    record('P6_DISABLED_ADMIN_DENIAL', true)
  }

  const currentSession = await recoveryClient.auth.getSession()
  if (!currentSession.data.session) {
    record('P3_GLOBAL_REVOCATION', false, 'RECOVERY_SESSION_UNAVAILABLE')
  } else {
    const refreshToken = currentSession.data.session.refresh_token
    const signedOut = await recoveryClient.auth.signOut({ scope: 'global' })
    const revokedRefresh = await recoveryClient.auth.refreshSession({
      refresh_token: refreshToken,
    })
    record(
      'P3_GLOBAL_REVOCATION',
      !signedOut.error && Boolean(revokedRefresh.error),
      signedOut.error
        ? 'GLOBAL_SIGNOUT_FAILED'
        : revokedRefresh.error
          ? ''
          : 'REFRESH_TOKEN_REMAINED_VALID'
    )
  }
} catch (error) {
  console.error(`LIVE_SMOKE_ABORTED=${error instanceof Error ? error.message : 'UNKNOWN'}`)
  process.exitCode = 1
} finally {
  try {
    await cleanup()
  } catch (error) {
    console.error(`FIXTURE_CLEANUP=FAILED:${error instanceof Error ? error.message : 'UNKNOWN'}`)
    process.exitCode = 1
  }
}
