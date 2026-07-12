import { setRequestLocale } from 'next-intl/server'
import { AuthForm } from '@/features/auth/AuthForm'

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  return <AuthForm mode="register" />
}
