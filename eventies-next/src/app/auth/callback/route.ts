import { NextResponse, type NextRequest } from 'next/server'
import { getFriendlyCallbackError, getPostAuthRedirect, localizedPath } from '@/lib/auth-routing'
import { createSupabaseServerClient } from '@/server/supabase/server-client'
import { track } from '@/server/observability/track'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const locale = params.get('locale') === 'ar' ? 'ar' : 'en'
  const fallback = localizedPath(locale, '/')
  const destination = getPostAuthRedirect(params.get('redirect'), fallback)
  const errorDescription = params.get('error_description') || params.get('error')

  if (errorDescription) {
    const login = new URL(localizedPath(locale, '/login'), request.url)
    login.searchParams.set('authError', getFriendlyCallbackError(errorDescription))
    login.searchParams.set('redirect', destination)
    return NextResponse.redirect(login, 303)
  }

  const code = params.get('code')
  if (!code) {
    const login = new URL(localizedPath(locale, '/login'), request.url)
    login.searchParams.set('authError', 'auth.callback.invalid')
    return NextResponse.redirect(login, 303)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const lower = error.message.toLowerCase()
    if (lower.includes('already been used') || lower.includes('invalid')) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) return NextResponse.redirect(new URL(destination, request.url), 303)
    }
    await track('auth.callback_failed', { reason: getFriendlyCallbackError(error.message) })
    const login = new URL(localizedPath(locale, '/login'), request.url)
    login.searchParams.set('authError', getFriendlyCallbackError(error.message))
    login.searchParams.set('redirect', destination)
    return NextResponse.redirect(login, 303)
  }

  await track('auth.login_succeeded', { provider: 'oauth' })
  return NextResponse.redirect(new URL(destination, request.url), 303)
}
