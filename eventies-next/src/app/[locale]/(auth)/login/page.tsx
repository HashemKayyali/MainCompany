import { setRequestLocale } from 'next-intl/server'
import { AuthForm } from '@/features/auth/AuthForm'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  return <AuthForm mode="login" redirectTo={(await searchParams).redirect} />
}
