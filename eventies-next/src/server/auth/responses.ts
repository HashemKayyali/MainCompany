import 'server-only'

import { NextResponse } from 'next/server'

export const UNIFORM_AUTH_MESSAGE = 'If an account exists, the next step will be available.'

export function authFailure(status = 400) {
  return NextResponse.json(
    { ok: false, code: 'AUTH_FAILED', message: UNIFORM_AUTH_MESSAGE },
    { status }
  )
}
