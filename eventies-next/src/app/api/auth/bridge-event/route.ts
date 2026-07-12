import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isTrustedMutationRequest } from '@/server/security/request'
import { track } from '@/server/observability/track'

const schema = z.object({ status: z.enum(['adopted', 'failed']) })

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ ok: false }, { status: 403 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  await track(`auth.bridge_${parsed.data.status}`, {})
  return NextResponse.json({ ok: true })
}
