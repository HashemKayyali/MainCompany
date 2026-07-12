import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, CalendarCheck, ClipboardList, Sparkles, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { buildMetadata } from '@/server/metadata/builders'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { SectionHeading } from '@/features/catalog/home/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Link } from '@/i18n/navigation'

/** CAT-016 — /about (RSC). EventiesHero + mission, values, stats, and CTA. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/about',
    title: 'About Eventies | Jordan Event Services Marketplace',
    description:
      'Learn how Eventies helps clients, organizers, companies, and providers discover rentals, activations, production support, custom builds, and trusted event services across Jordan.',
  })
}

const VALUE_ICONS: LucideIcon[] = [Users, ClipboardList, CalendarCheck, Sparkles]

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.about')
  const values = t.raw('values') as { title: string; body: string }[]
  const stats = t.raw('stats') as { value: string; label: string }[]

  return (
    <div>
      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('browseServicesCta'), href: '/products' }}
        secondaryAction={{ label: t('contactCta'), href: '/contact' }}
      />

      <div className="bg-[#f8f3ff]">
        {/* Mission */}
        <section className="site-section">
          <div className="site-container">
            <Reveal y={24} className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2.5">
                <span
                  className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400"
                  aria-hidden="true"
                />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">
                  {t('missionEyebrow')}
                </span>
                <span
                  className="h-px w-7 bg-gradient-to-l from-transparent to-violet-400"
                  aria-hidden="true"
                />
              </div>
              <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-ink-900">
                {t('missionTitle')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-600">
                {t('missionBody')}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <SectionHeading
              eyebrow={t('missionEyebrow')}
              title={t('valuesTitle')}
              className="mb-12"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => {
                const Icon = VALUE_ICONS[i % VALUE_ICONS.length]!
                return (
                  <Reveal key={v.title} delay={Math.min(i * 0.06, 0.24)} y={24} className="h-full">
                    <div className="flex h-full flex-col rounded-[24px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04),0_18px_44px_-26px_rgba(89,23,196,0.22)]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-violet-200 bg-violet-50 text-violet-700">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <h3 className="mt-5 font-display text-[1.2rem] font-bold tracking-[-0.025em] text-ink-900">
                        {v.title}
                      </h3>
                      <p className="mt-2.5 text-[13px] leading-[1.65] text-ink-600">{v.body}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <Reveal y={24}>
              <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-violet-200/70 bg-white/93 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.07)] sm:grid-cols-3 sm:p-8">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="font-display text-[clamp(1.4rem,3vw,2.1rem)] font-black tracking-[-0.03em] text-violet-700">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[12.5px] font-semibold text-ink-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <Reveal y={26}>
              <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-12 text-center text-white">
                <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-extrabold tracking-[-0.03em]">
                  {t('ctaTitle')}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/90">{t('ctaBody')}</p>
                <Link
                  href="/products"
                  className="group mt-7 inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-white px-8 text-[13px] font-bold text-violet-700 transition-all hover:-translate-y-0.5"
                >
                  {t('browseServicesCta')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    strokeWidth={2.4}
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}
