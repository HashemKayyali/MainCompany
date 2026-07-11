import {
  ArrowRight,
  Cpu,
  Gamepad2,
  Lightbulb,
  PackageCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * CAT-026 — Custom Builds preview (RSC). VERBATIM port of the Vite
 * CustomBuildPreview: R&D studio dark panel, randd.webp backdrop, 4 build
 * signals with gradient chips, event-ready pipeline strip, dual CTAs.
 */
const SIGNAL_META: { icon: LucideIcon; tone: string }[] = [
  { icon: Lightbulb, tone: 'from-amber-300 to-orange-400' },
  { icon: Wrench, tone: 'from-fuchsia-400 to-violet-500' },
  { icon: Cpu, tone: 'from-cyan-300 to-violet-400' },
  { icon: PackageCheck, tone: 'from-emerald-300 to-teal-400' },
]

export async function CustomBuildPreview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const capabilities = t.raw('customBuild.capabilities') as string[]
  const signals = (t.raw('customBuild.signals') as string[]).map((label, i) => ({
    label,
    ...(SIGNAL_META[i % SIGNAL_META.length] as (typeof SIGNAL_META)[number]),
  }))

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('customBuild.eyebrow')}
          title={t('customBuild.title')}
          description={t('customBuild.description')}
          className="mb-10"
        />

        <Reveal y={26}>
          <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-[#160435] p-5 shadow-[0_34px_90px_-42px_rgba(89,23,196,0.65)] sm:p-7 lg:p-9">
            <div
              className="pointer-events-none absolute inset-0 opacity-95"
              style={{
                background:
                  'radial-gradient(60% 64% at 78% 34%, rgba(217,70,239,0.34) 0%, transparent 62%),radial-gradient(50% 54% at 23% 20%, rgba(124,58,237,0.34) 0%, transparent 64%),linear-gradient(135deg, rgba(11,3,31,0.98) 0%, rgba(46,13,92,0.95) 48%, rgba(149,45,213,0.82) 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-50"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 45%, transparent 100%)',
                maskImage: 'linear-gradient(to top, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
              }}
              aria-hidden="true"
            />

            <div className="relative grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.4} />
                  {t('customBuild.badge')}
                </span>
                <h3 className="mt-5 max-w-lg font-display text-[clamp(1.9rem,3.4vw,3.15rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
                  {t('customBuild.panelTitle')}
                </h3>
                <p className="mt-4 max-w-xl text-[14px] font-semibold leading-[1.75] text-violet-50/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {t('customBuild.panelBody')}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {capabilities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/14 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-bold text-white/85"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/custom-builds"
                    className="group inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-white px-7 text-[12px] font-bold text-violet-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-16px_rgba(0,0,0,0.55)]"
                  >
                    {t('customBuild.exploreCta')}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      strokeWidth={2.4}
                    />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-[50px] items-center rounded-full border border-white/20 bg-white/[0.07] px-7 text-[12px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-200/55 hover:bg-white/12"
                  >
                    {t('customBuild.startCta')}
                  </Link>
                </div>
              </div>

              <div
                className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/16 bg-[#12042d] bg-cover bg-center p-5 backdrop-blur-xl sm:min-h-[410px] sm:p-7"
                style={{ backgroundImage: "url('/images/randd.webp')" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,4,48,0.78)_0%,rgba(57,18,112,0.46)_45%,rgba(127,33,184,0.30)_100%),linear-gradient(0deg,rgba(9,2,28,0.66)_0%,rgba(9,2,28,0.20)_52%,rgba(9,2,28,0.48)_100%)]"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.09]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                  aria-hidden="true"
                />
                <div className="relative mx-auto min-h-[310px] max-w-3xl sm:min-h-[356px]">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[68%] w-[88%] -translate-y-1/2 rounded-[34px] border border-white/12 bg-gradient-to-b from-white/[0.05] to-white/[0.015] shadow-[0_30px_70px_-42px_rgba(0,0,0,0.85)] backdrop-blur-[2px]"
                    aria-hidden="true"
                  />
                  <div className="relative flex min-h-[310px] items-center justify-center sm:min-h-[356px]">
                    <div className="grid w-full max-w-[26rem] grid-cols-4 gap-2 px-2 sm:max-w-[34rem] sm:gap-3 sm:px-4">
                      {signals.map((item) => {
                        const Icon = item.icon
                        return (
                          <div
                            key={item.label}
                            className="relative flex min-w-0 flex-col items-center text-center"
                          >
                            <div
                              className="absolute top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10 blur-2xl sm:h-24 sm:w-24"
                              aria-hidden="true"
                            />
                            <div
                              className={`relative flex h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-gradient-to-br ${item.tone} text-white shadow-[0_22px_44px_-24px_rgba(0,0,0,0.75)] sm:h-[82px] sm:w-[82px] sm:rounded-[26px]`}
                            >
                              <Icon className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.35} />
                            </div>
                            <div className="mt-3 min-w-0 text-center">
                              <div className="text-[10px] font-black leading-tight text-white sm:text-[13px]">
                                {item.label}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="relative -mt-8 rounded-[22px] border border-white/14 bg-[#12042d]/72 p-4 shadow-[0_24px_54px_-34px_rgba(0,0,0,0.8)]">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                      <Gamepad2 className="h-4 w-4 text-fuchsia-200" strokeWidth={2.4} />
                      {t('customBuild.pipeline')}
                    </div>
                    <span className="rounded-full bg-emerald-300/16 px-3 py-1 text-[10px] font-black text-emerald-100">
                      {t('customBuild.fieldTested')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {signals.map((item) => (
                      <span
                        key={`${item.label}-bar`}
                        className={`h-2 rounded-full bg-gradient-to-r ${item.tone}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
