import { createClient } from 'npm:@supabase/supabase-js@2.97.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_FOLDERS = new Set([
  'categories',
  'customers',
  'parts',
  'gallery',
  'custom-builds',
  'products',
  'general',
  'uploads',
])

const ROOT_FOLDER = 'eventies'
const MAX_DELETE_BATCH = 25

type RequestBody =
  | { action: 'sign-upload'; folder?: unknown }
  | {
      action: 'delete'
      assets?: Array<{
        cloudName?: unknown
        publicId?: unknown
        resourceType?: unknown
      }>
      idempotencyKey?: unknown
    }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const auth = await requireAdmin(req)
    if (!auth.ok) return json({ error: auth.error }, auth.status)

    const config = getCloudinaryConfig()
    if (!config.ok) return json({ error: config.error }, 500)

    const body = (await req.json().catch(() => null)) as RequestBody | null
    if (!body || typeof body !== 'object' || !('action' in body)) {
      return json({ error: 'Invalid request body' }, 400)
    }

    if (body.action === 'sign-upload') {
      return await handleSignUpload(body.folder, config.value, auth)
    }

    if (body.action === 'delete') {
      if (Deno.env.get('ADMIN_DESTRUCTIVE_ENABLED') !== '1') {
        return json({ error: 'Destructive rollout is disabled' }, 503)
      }
      return await handleDelete(
        body.assets,
        body.idempotencyKey,
        config.value,
        auth
      )
    }

    return json({ error: 'Unsupported action' }, 400)
  } catch (error) {
    console.error('[cloudinary-assets] unexpected error', error)
    return json({ error: toErrorMessage(error) }, 500)
  }
})

async function requireAdmin(req: Request): Promise<
  | {
      ok: true
      actorId: string
      role: 'admin' | 'superadmin'
      claims: Record<string, unknown>
      client: ReturnType<typeof createClient>
    }
  | { ok: false; status: number; error: string }
> {
  const authorization = req.headers.get('authorization') ?? ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()
  if (!token) return { ok: false, status: 401, error: 'Missing access token' }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: 500,
      error: 'Supabase function environment is incomplete',
    }
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userError } = await client.auth.getUser(token)
  if (userError || !userData.user) {
    return { ok: false, status: 401, error: 'Invalid or expired access token' }
  }

  const { data: profile, error: adminError } = await client
    .from('profiles')
    .select('role,is_active')
    .eq('id', userData.user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (adminError) {
    console.error('[cloudinary-assets] admin check failed', adminError)
    return { ok: false, status: 500, error: 'Could not verify admin access' }
  }

  const role = profile?.role
  if (
    (role !== 'admin' && role !== 'superadmin') ||
    profile?.is_active === false
  ) {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  const claims = decodeJwtPayload(token)
  if (Deno.env.get('ADMIN_MFA_ENFORCEMENT') === '1') {
    const aal = typeof claims?.aal === 'string' ? claims.aal : ''
    const authTime =
      typeof claims?.auth_time === 'number' ? claims.auth_time : 0
    const ageSeconds = Math.floor(Date.now() / 1000) - authTime
    if (aal !== 'aal2' || ageSeconds < 0 || ageSeconds > 900) {
      return {
        ok: false,
        status: 403,
        error: 'AAL2 and recent authentication required',
      }
    }
  }

  return {
    ok: true,
    actorId: userData.user.id,
    role,
    claims: claims ?? {},
    client,
  }
}

async function handleSignUpload(
  folderInput: unknown,
  config: CloudinaryConfig,
  auth: { actorId: string; client: ReturnType<typeof createClient> }
) {
  const folder = normalizeFolder(folderInput)
  if (!folder || !ALLOWED_FOLDERS.has(folder)) {
    return json({ error: 'Unsupported upload folder' }, 400)
  }

  const timestamp = unixTimestamp()
  const signedFolder = `${ROOT_FOLDER}/${folder}`
  const hardeningEnabled =
    Deno.env.get('ADMIN_UPLOAD_HARDENING_ENABLED') === '1'
  const uploadPreset =
    Deno.env.get('CLOUDINARY_ADMIN_UPLOAD_PRESET')?.trim() ||
    'eventies_admin_signed'
  if (hardeningEnabled) {
    const { data: allowed, error } = await auth.client.rpc(
      'consume_admin_upload_quota',
      {
        p_hour_limit: 30,
        p_day_limit: 300,
      }
    )
    if (error || allowed !== true) {
      console.warn(
        '[app_event]',
        JSON.stringify({ event: 'upload.quota_denied', actor: auth.actorId })
      )
      return json({ error: 'Upload signing quota exceeded' }, 429)
    }
  }
  const signedParams = hardeningEnabled
    ? { folder: signedFolder, timestamp, upload_preset: uploadPreset }
    : { folder: signedFolder, timestamp }
  const signature = signCloudinaryParams(signedParams, config.apiSecret)

  return json({
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder: signedFolder,
    ...(hardeningEnabled ? { uploadPreset } : {}),
  })
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const encoded = token.split('.')[1]
    if (!encoded) return null
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    )
  } catch {
    return null
  }
}

async function handleDelete(
  assetsInput: unknown,
  idempotencyInput: unknown,
  config: CloudinaryConfig,
  auth: {
    actorId: string
    role: 'admin' | 'superadmin'
    claims: Record<string, unknown>
    client: ReturnType<typeof createClient>
  }
) {
  if (!hasRecentAal2(auth.claims)) {
    return json({ error: 'AAL2 and recent authentication required' }, 403)
  }
  const idempotencyKey = stringValue(idempotencyInput)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idempotencyKey
    )
  ) {
    return json({ error: 'Valid idempotency key required' }, 400)
  }
  const assets = Array.isArray(assetsInput) ? assetsInput : []
  if (assets.length === 0) return json({ results: [] })
  if (assets.length > MAX_DELETE_BATCH) {
    return json(
      { error: `Delete batch cannot exceed ${MAX_DELETE_BATCH} assets` },
      400
    )
  }

  const normalized: Array<{ publicId: string }> = []
  for (const item of assets) {
    if (!item || typeof item !== 'object') {
      return json({ error: 'Invalid delete asset descriptor' }, 400)
    }

    const cloudName = stringValue((item as Record<string, unknown>).cloudName)
    const publicId = stringValue((item as Record<string, unknown>).publicId)
    const resourceType = stringValue(
      (item as Record<string, unknown>).resourceType
    )

    if (resourceType !== 'image') {
      return json({ error: 'Only image deletion is supported' }, 400)
    }
    if (!isOwnedCloudinaryAsset(cloudName, publicId, config.cloudName)) {
      return json(
        { error: 'Asset is outside the owned Cloudinary namespace' },
        400
      )
    }

    normalized.push({ publicId })
  }

  const publicIds = [...new Set(normalized.map((asset) => asset.publicId))]
  const { data: begun, error: beginError } = await auth.client.rpc(
    'begin_admin_media_delete',
    {
      p_idempotency_key: idempotencyKey,
      p_public_ids: publicIds,
    }
  )
  const operation = Array.isArray(begun) ? begun[0] : null
  if (beginError || !operation) {
    console.warn(
      '[app_event]',
      JSON.stringify({ event: 'upload.delete_denied', actor: auth.actorId })
    )
    return json({ error: 'Could not authorize media deletion' }, 403)
  }
  if (!operation.should_execute)
    return json({ replayed: true, results: operation.prior_result })

  const results = await mapWithConcurrency(publicIds, 5, async (publicId) => {
    try {
      const result = await destroyImage(publicId, config)
      return { publicId, ...result }
    } catch (error) {
      return {
        publicId,
        result: 'error' as const,
        error: toErrorMessage(error),
      }
    }
  })

  const status = results.every(
    (result) => result.result === 'ok' || result.result === 'not found'
  )
    ? 'succeeded'
    : 'failed'
  const { error: completeError } = await auth.client.rpc(
    'complete_admin_media_delete',
    {
      p_operation_id: operation.operation_id,
      p_status: status,
      p_result: { results },
    }
  )
  if (completeError) {
    console.error(
      '[app_event]',
      JSON.stringify({
        event: 'upload.delete_orphaned_audit',
        operationId: operation.operation_id,
      })
    )
    return json(
      {
        error: 'Deletion completed but audit persistence failed',
        operationId: operation.operation_id,
      },
      500
    )
  }

  return json({
    operationId: operation.operation_id,
    replayed: false,
    results,
  })
}

async function destroyImage(
  publicId: string,
  config: CloudinaryConfig
): Promise<{ result: 'ok' | 'not found' | 'error'; error?: string }> {
  const timestamp = unixTimestamp()
  const params = {
    invalidate: true,
    public_id: publicId,
    timestamp,
  }
  const signature = signCloudinaryParams(params, config.apiSecret)

  const body = new URLSearchParams()
  body.set('public_id', publicId)
  body.set('timestamp', String(timestamp))
  body.set('invalidate', 'true')
  body.set('api_key', config.apiKey)
  body.set('signature', signature)

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })

  const payload = (await response.json().catch(() => ({}))) as {
    result?: string
    error?: { message?: string }
  }

  if (!response.ok || payload.error?.message) {
    return {
      result: 'error',
      error:
        payload.error?.message ||
        `Cloudinary destroy failed with HTTP ${response.status}`,
    }
  }

  if (payload.result === 'ok') return { result: 'ok' }
  if (payload.result === 'not found') return { result: 'not found' }
  return {
    result: 'error',
    error: `Unexpected Cloudinary result: ${String(payload.result)}`,
  }
}

interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

function getCloudinaryConfig():
  { ok: true; value: CloudinaryConfig } | { ok: false; error: string } {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')?.trim() ?? ''
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY')?.trim() ?? ''
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')?.trim() ?? ''

  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: 'Cloudinary secrets are not configured' }
  }

  return { ok: true, value: { cloudName, apiKey, apiSecret } }
}

function signCloudinaryParams(
  params: Record<string, string | number | boolean>,
  apiSecret: string
): string {
  const canonical = Object.entries(params)
    .filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&')

  return sha1Hex(`${canonical}${apiSecret}`)
}

function sha1Hex(value: string): string {
  // This function is replaced by the async Web Crypto implementation below at
  // call sites through a synchronous SHA-1 implementation to keep signature
  // construction deterministic in the Edge runtime without external packages.
  return sha1(value)
}

// Minimal SHA-1 implementation for Cloudinary API request signing.
function sha1(message: string): string {
  const bytes = new TextEncoder().encode(message)
  const bitLength = bytes.length * 8
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64
  const padded = new Uint8Array(paddedLength)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(paddedLength - 4, bitLength >>> 0, false)
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false)

  let h0 = 0x67452301
  let h1 = 0xefcdab89
  let h2 = 0x98badcfe
  let h3 = 0x10325476
  let h4 = 0xc3d2e1f0
  const w = new Uint32Array(80)

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false)
    for (let i = 16; i < 80; i += 1)
      w[i] = rol(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1)

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4

    for (let i = 0; i < 80; i += 1) {
      let f: number
      let k: number
      if (i < 20) {
        f = (b & c) | (~b & d)
        k = 0x5a827999
      } else if (i < 40) {
        f = b ^ c ^ d
        k = 0x6ed9eba1
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8f1bbcdc
      } else {
        f = b ^ c ^ d
        k = 0xca62c1d6
      }
      const temp = (rol(a, 5) + f + e + k + w[i]) >>> 0
      e = d
      d = c
      c = rol(b, 30)
      b = a
      a = temp
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
  }

  return [h0, h1, h2, h3, h4]
    .map((value) => value.toString(16).padStart(8, '0'))
    .join('')
}

function rol(value: number, bits: number) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0
}

function normalizeFolder(value: unknown) {
  return stringValue(value).replace(/^\/+|\/+$/g, '')
}

function isSafePublicId(value: string) {
  return (
    value.length > 0 &&
    value.length <= 500 &&
    !value.includes('..') &&
    !/[\u0000-\u001f]/.test(value)
  )
}

function isAllowedDeleteFolder(value: string) {
  const [root, folder] = value.split('/')
  return root === ROOT_FOLDER && Boolean(folder && ALLOWED_FOLDERS.has(folder))
}

function isOwnedCloudinaryAsset(
  cloudName: string,
  publicId: string,
  configuredCloudName: string
) {
  return (
    cloudName === configuredCloudName &&
    isSafePublicId(publicId) &&
    isAllowedDeleteFolder(publicId)
  )
}

function hasRecentAal2(claims: Record<string, unknown>) {
  if (claims.aal !== 'aal2') return false
  const authTime =
    typeof claims.auth_time === 'number' ? claims.auth_time : Number.NaN
  const age = Math.floor(Date.now() / 1000) - authTime
  return Number.isFinite(authTime) && age >= 0 && age <= 900
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function unixTimestamp() {
  return Math.floor(Date.now() / 1000)
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length)
  let cursor = 0

  const worker = async () => {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= values.length) return
      results[index] = await mapper(values[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker())
  )
  return results
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function toErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
