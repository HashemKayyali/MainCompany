import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { isTrustedMutationRequest } from '@/server/security/request'

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ ok: false }, { status: 403 })
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut({ scope: 'local' })
  return NextResponse.json({ ok: true })
}
