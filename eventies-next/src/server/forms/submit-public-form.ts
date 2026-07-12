import 'server-only'

import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { fieldErrorKeys, publicFormSchema } from '@/shared/schemas/contact'
import type { PublicFormKind, PublicFormResponse } from '@/shared/contracts/public-forms'
import { getAnonServerClient } from '@/server/dal/anon-client'
import { track } from '@/server/observability/track'
import { consume, registerRateLimitStore } from '@/server/security/rate-limit'
import { isTrustedMutationRequest, requestIp } from '@/server/security/request'
import {
  pseudonymousBucket,
  supabaseRateLimitStore,
} from '@/server/security/supabase-rate-limit-store'
import { verifyTurnstileToken } from '@/server/security/turnstile'

registerRateLimitStore(supabaseRateLimitStore)

function response(body: PublicFormResponse, status: number) {
  return NextResponse.json(body, { status })
}

export async function submitPublicForm(request: NextRequest, kind: PublicFormKind) {
  if (!isTrustedMutationRequest(request)) return response({ ok: false, code: 'ORIGIN' }, 403)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return response({ ok: false, code: 'INVALID' }, 400)
  }

  const parsed = publicFormSchema.safeParse(body)
  if (!parsed.success) {
    return response({ ok: false, code: 'INVALID', fieldErrors: fieldErrorKeys(parsed.error) }, 400)
  }

  const ip = requestIp(request)
  const challenge = await verifyTurnstileToken(parsed.data.turnstileToken, ip)
  if (!challenge.ok) return response({ ok: false, code: 'CHALLENGE' }, 403)

  const identifier = parsed.data.email.trim().toLowerCase()
  const bucket = pseudonymousBucket(kind, identifier, ip)
  const limit = await consume('publicFormSubmissions', bucket)
  if (!limit.allowed) {
    await track('ratelimit.tripped', { surface: kind, dimension: 'identifier_or_ip' })
    return response({ ok: false, code: 'RATE_LIMITED' }, 429)
  }

  const messageHash = createHash('sha256').update(parsed.data.message.trim()).digest('hex')
  const dedupKey = pseudonymousBucket('form-dedup', kind, identifier, messageHash)
  const supabase = getAnonServerClient()
  const { data: claimed, error: claimError } = await supabase.rpc('claim_public_form_dedup', {
    p_dedup_key: dedupKey,
  })
  if (claimError) {
    await track('public_form.failed', { kind, stage: 'dedup' })
    return response({ ok: false, code: 'UNAVAILABLE' }, 503)
  }
  if (!claimed) return response({ ok: false, code: 'DUPLICATE' }, 409)

  const prefix = kind === 'contact' ? '' : `[${kind}] ${parsed.data.subject}\n`
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({
      name: parsed.data.name,
      email: identifier,
      phone: parsed.data.phone || '',
      product_slug: parsed.data.productSlug || null,
      city: parsed.data.city,
      address: parsed.data.address,
      message: `${prefix}${parsed.data.message}`.slice(0, 2000),
    })
    .select('id')
    .single()

  if (error || !data) {
    await track('public_form.failed', { kind, stage: 'insert' })
    return response({ ok: false, code: 'UNAVAILABLE' }, 503)
  }
  await track('public_form.submitted', { kind })
  return response({ ok: true, submissionId: data.id }, 201)
}
