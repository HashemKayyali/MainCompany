import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProfileForm } from '@/features/account/ProfileForm'
import { getMyProfile } from '@/server/dal/personal'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const [t, profile] = await Promise.all([getTranslations('account'), getMyProfile()])
  if (!profile) notFound()
  return (
    <div className="site-container max-w-2xl py-12">
      <h1 className="text-4xl font-black">{t('profile')}</h1>
      <p className="mt-3 text-ink-600">{t('profileDescription')}</p>
      <ProfileForm profile={profile} />
    </div>
  )
}
