import { setRequestLocale } from 'next-intl/server'
import { UpdatePasswordForm } from '@/features/auth/UpdatePasswordForm'

export default async function UpdatePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  return <UpdatePasswordForm />
}
