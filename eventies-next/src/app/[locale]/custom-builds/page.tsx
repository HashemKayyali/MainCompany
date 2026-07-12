import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, Cpu, Gamepad2, PackageCheck, Wrench, type LucideIcon } from 'lucide-react'
import { getCustomBuilds } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { SectionHeading } from '@/features/catalog/home/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'

/**
 * CAT-012 — /custom-builds (RSC). Faithful port of the Vite CustomBuilds
 * experience: R&D EventiesHero, "what we build" capabilities, idea→floor
 * process pipeline, recent-builds gallery (real DAL data; intentionally empty
 * LAB/IN_PROGRESS states stay empty per project decision), and a closing CTA.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/custom-builds',
    title: 'Custom Event Builds & Interactive Experiences | Eventies',
    description:
      'Eventies designs and builds custom interactive experiences, branded activations, games, software, hardware, and event-ready setups for local and international projects.',
  })
}

const CAP_ICONS: LucideIcon[] = [Gamepad2, PackageCheck, Cpu, Wrench]

export default async function CustomBuildsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.customBuilds')
  const builds = (await getCustomBuilds()).filter((b) => b.is_active !== false)
  const capabilities = t.raw('capabilities') as { title: string; body: string }[]
  const process = t.raw('process') as { step: string; title: string; body: string }[]

  return (
    <div>
      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('startCta'), href: '/contact' }}
        secondaryAction={{ label: t('exploreServicesCta'), href: '/products' }}
      />

      <div className="bg-[#f8f3ff]">
        {/* What we build */}
        <section className="site-section">
          <div className="site-container-wide">
            <SectionHeading
              eyebrow={t('heroEyebrow')}
              title={t('capabilitiesTitle')}
              className="mb-12"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap, i) => {
                const Icon = CAP_ICONS[i % CAP_ICONS.length]!
                return (
                  <Reveal
                    key={cap.title}
                    delay={Math.min(i * 0.06, 0.24)}
                    y={24}
                    className="h-full"
                  >
                    <div className="flex h-full flex-col rounded-[24px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04),0_18px_44px_-26px_rgba(89,23,196,0.22)]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-violet-200 bg-violet-50 text-violet-700">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <h3 className="mt-5 font-display text-[1.25rem] font-bold tracking-[-0.025em] text-ink-900">
                        {cap.title}
                      </h3>
                      <p className="mt-2.5 text-[13px] leading-[1.65] text-ink-600">{cap.body}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Idea → event floor process */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <SectionHeading
              eyebrow={t('heroEyebrow')}
              title={t('processTitle')}
              className="mb-12"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {process.map((p, i) => (
                <Reveal key={p.step} delay={Math.min(i * 0.08, 0.3)} y={26} className="h-full">
                  <div
                    className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 p-6 text-white"
                    style={{
                      background: 'linear-gradient(150deg, #2a0a63 0%, #4912a0 52%, #7126e3 100%)',
                      boxShadow: '0 30px 64px -34px rgba(89,23,196,0.6)',
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full opacity-40 blur-3xl"
                      style={{ background: 'rgba(168,85,247,0.55)' }}
                      aria-hidden="true"
                    />
                    <span className="relative font-display text-[2rem] font-black text-white/30">
                      {p.step}
                    </span>
                    <h3 className="relative mt-2 font-display text-[1.2rem] font-bold tracking-[-0.025em] text-white">
                      {p.title}
                    </h3>
                    <p className="relative mt-2 text-[13px] leading-[1.65] text-white/75">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Recent builds gallery */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <SectionHeading eyebrow={t('heroEyebrow')} title={t('workTitle')} className="mb-12" />
            {builds.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-violet-200 bg-white/60 p-8 text-center text-ink-500">
                {t('empty')}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {builds.map((b) => (
                  <li
                    key={b.id}
                    className="overflow-hidden rounded-[22px] border border-violet-200/70 bg-white shadow-[0_1px_2px_rgba(20,8,50,0.04),0_18px_44px_-26px_rgba(89,23,196,0.22)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-violet-50">
                      <SmartImage
                        media={b.image_url || b.images?.[0] || ''}
                        alt={b.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-500 hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-[1.05rem] font-bold text-ink-900">
                        {b.title}
                      </h3>
                      {b.description ? (
                        <p className="mt-1.5 line-clamp-3 text-[13px] text-ink-600">
                          {b.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="site-section pt-0">
          <div className="site-container-wide">
            <Reveal y={26}>
              <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-[#160435] p-8 text-center shadow-[0_34px_90px_-42px_rgba(89,23,196,0.65)] sm:p-12">
                <div
                  className="pointer-events-none absolute inset-0 opacity-95"
                  style={{
                    background:
                      'radial-gradient(60% 64% at 78% 34%, rgba(217,70,239,0.34) 0%, transparent 62%),radial-gradient(50% 54% at 23% 20%, rgba(124,58,237,0.34) 0%, transparent 64%),linear-gradient(135deg, rgba(11,3,31,0.98) 0%, rgba(46,13,92,0.95) 48%, rgba(149,45,213,0.82) 100%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative mx-auto max-w-2xl">
                  <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
                    {t('ctaTitle')}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-[14px] leading-[1.7] text-violet-50/90">
                    {t('ctaBody')}
                  </p>
                  <Link
                    href="/contact"
                    className="group mt-8 inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-white px-8 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5"
                  >
                    {t('ctaButton')}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      strokeWidth={2.4}
                    />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}
