import { Fragment } from 'react'
import { ChevronRight, Compass, ListChecks, SendHorizontal, type LucideIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * CAT-026 — How Eventies works (RSC). VERBATIM port of the Vite HowItWorks:
 * 3 step cards (last one dark/gradient), chevron connectors between them.
 */
type Step = {
  num: string
  title: string
  body: string
  tags: string[]
  icon: LucideIcon
  dark?: boolean
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon
  const dark = step.dark
  return (
    <div
      className={[
        'relative flex h-full w-full flex-col overflow-hidden rounded-[24px] p-6 sm:p-7',
        dark ? 'border border-white/10 text-white' : 'border border-violet-200/70 bg-white',
      ].join(' ')}
      style={
        dark
          ? {
              background: 'linear-gradient(150deg, #2a0a63 0%, #4912a0 52%, #7126e3 100%)',
              boxShadow: '0 30px 64px -34px rgba(89,23,196,0.6)',
            }
          : { boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 18px 44px -26px rgba(89,23,196,0.22)' }
      }
    >
      {dark && (
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full opacity-40 blur-3xl"
          style={{ background: 'rgba(168,85,247,0.55)' }}
          aria-hidden="true"
        />
      )}
      <div className="relative mb-5 flex items-center justify-between">
        <span
          className={[
            'flex h-12 w-12 items-center justify-center rounded-[15px]',
            dark
              ? 'border border-white/20 bg-white/10 text-white backdrop-blur-sm'
              : 'border border-violet-200 bg-violet-50 text-violet-700',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <h3
        className={[
          'relative font-display text-[1.4rem] font-bold tracking-[-0.025em]',
          dark ? 'text-white' : 'text-ink-900',
        ].join(' ')}
      >
        {step.title}
      </h3>
      <p
        className={[
          'relative mt-2.5 flex-1 text-[13px] leading-[1.65]',
          dark ? 'text-white/75' : 'text-ink-600',
        ].join(' ')}
      >
        {step.body}
      </p>
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {step.tags.map((tag) => (
          <span
            key={tag}
            className={[
              'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold',
              dark
                ? 'border border-white/20 bg-white/10 text-white/85'
                : 'border border-violet-200/70 bg-violet-50/70 text-violet-700',
            ].join(' ')}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="z-10 flex shrink-0 items-center justify-center self-center" aria-hidden="true">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-500 shadow-[0_8px_20px_-10px_rgba(89,23,196,0.4)]">
        <ChevronRight
          className="h-4 w-4 rotate-90 md:rotate-0 rtl:md:rotate-180"
          strokeWidth={2.6}
        />
      </span>
    </div>
  )
}

export async function HowItWorks({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const steps: Step[] = [
    {
      num: '01',
      title: t('howItWorks.step1Title'),
      body: t('howItWorks.step1Body'),
      tags: t.raw('howItWorks.step1Tags') as string[],
      icon: Compass,
    },
    {
      num: '02',
      title: t('howItWorks.step2Title'),
      body: t('howItWorks.step2Body'),
      tags: t.raw('howItWorks.step2Tags') as string[],
      icon: ListChecks,
    },
    {
      num: '03',
      title: t('howItWorks.step3Title'),
      body: t('howItWorks.step3Body'),
      tags: t.raw('howItWorks.step3Tags') as string[],
      icon: SendHorizontal,
      dark: true,
    },
  ]

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('howItWorks.eyebrow')}
          title={t('howItWorks.title')}
          description={t('howItWorks.description')}
          className="mb-12"
        />
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:gap-2">
          {steps.map((step, index) => (
            <Fragment key={step.num}>
              <Reveal delay={Math.min(index * 0.12, 0.3)} y={26} className="w-full md:flex-1">
                <StepCard step={step} />
              </Reveal>
              {index < steps.length - 1 && <Connector />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
