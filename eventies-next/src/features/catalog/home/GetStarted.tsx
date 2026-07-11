import { ArrowRight, Check, Sparkles, Wrench } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * CAT-026 — Get Started (RSC). VERBATIM port of the Vite HomeCTA: 3 blocks —
 * provider (dark), custom build (light), final CTA (light).
 */
export async function GetStarted({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const providerPoints = t.raw('getStarted.providerPoints') as string[]
  const buildPoints = t.raw('getStarted.buildPoints') as string[]

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('getStarted.eyebrow')}
          title={t('getStarted.title')}
          description={t('getStarted.description')}
          className="mb-10"
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Provider — dark */}
          <Reveal className="h-full" y={26}>
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 p-7 sm:p-9"
              style={{
                background: 'linear-gradient(150deg, #190453 0%, #4912a0 50%, #7126e3 100%)',
                boxShadow: '0 40px 80px -40px rgba(89,23,196,0.6)',
              }}
            >
              <div
                className="pointer-events-none absolute -end-20 -top-20 h-56 w-56 rounded-full opacity-45 blur-3xl"
                style={{ background: 'rgba(168,85,247,0.6)' }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
                aria-hidden="true"
              />
              <span className="relative inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-violet-100">
                {t('getStarted.providerBadge')}
              </span>
              <h3 className="relative mt-4 max-w-md font-display text-[1.7rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.1rem]">
                {t('getStarted.providerTitle')}
              </h3>
              <div className="relative mt-6 space-y-2.5">
                {providerPoints.map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                    <span className="text-[13px] font-medium text-white/85">{point}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-auto pt-8">
                <Link
                  href="/contact"
                  className="group inline-flex min-h-[50px] items-center gap-2 rounded-full bg-white px-7 text-[12px] font-bold text-violet-800 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)]"
                >
                  {t('getStarted.joinCta')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    strokeWidth={2.2}
                  />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Custom build — light */}
          <Reveal className="h-full" y={26} delay={0.06}>
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-violet-200/80 bg-white p-7 sm:p-9"
              style={{
                boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 30px 64px -34px rgba(168,85,247,0.42)',
              }}
            >
              <div
                className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full opacity-70 blur-3xl"
                style={{ background: 'rgba(217,70,239,0.18)' }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 start-4 h-64 w-64 rounded-full opacity-70 blur-3xl"
                style={{ background: 'rgba(124,58,237,0.16)' }}
                aria-hidden="true"
              />
              <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                {t('getStarted.buildBadge')}
              </span>
              <div className="relative mt-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_18px_34px_-20px_rgba(168,85,247,0.75)]">
                <Wrench className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <h3 className="relative mt-5 max-w-md font-display text-[1.55rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-ink-900 sm:text-[1.9rem]">
                {t('getStarted.buildTitle')}
              </h3>
              <p className="relative mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
                {t('getStarted.buildBody')}
              </p>
              <div className="relative mt-6 space-y-2.5">
                {buildPoints.map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                    <span className="text-[13px] font-medium text-ink-700">{point}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-auto pt-8">
                <Link
                  href="/custom-builds"
                  className="group inline-flex min-h-[50px] items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(168,85,247,0.75)]"
                >
                  {t('getStarted.startBuildCta')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    strokeWidth={2.2}
                  />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Final CTA — light */}
          <Reveal className="h-full" y={26} delay={0.12}>
            <div
              className="relative flex h-full flex-col justify-center overflow-hidden rounded-[26px] border border-violet-200/70 bg-white p-7 sm:p-9"
              style={{
                boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 30px 64px -34px rgba(89,23,196,0.28)',
              }}
            >
              <div
                className="pointer-events-none absolute -bottom-20 -start-20 h-56 w-56 rounded-full opacity-50 blur-3xl"
                style={{ background: 'rgba(168,85,247,0.16)' }}
                aria-hidden="true"
              />
              <span className="relative inline-flex w-fit items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">
                <span
                  className="h-px w-6 bg-gradient-to-r from-transparent to-violet-400"
                  aria-hidden="true"
                />
                {t('getStarted.readyBadge')}
              </span>
              <h3 className="relative mt-4 max-w-md font-display text-[1.7rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-[2.1rem]">
                {t('getStarted.readyTitle')}
              </h3>
              <p className="relative mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
                {t('getStarted.readyBody')}
              </p>
              <div className="relative mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="group inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-ink-900 px-7 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-800 hover:shadow-[0_18px_40px_-16px_rgba(20,8,50,0.7)]"
                >
                  {t('getStarted.exploreCta')}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3 w-3 rtl:rotate-180" strokeWidth={2.4} />
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-violet-200 bg-white px-7 text-[12px] font-bold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
                >
                  {t('getStarted.quoteCta')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
