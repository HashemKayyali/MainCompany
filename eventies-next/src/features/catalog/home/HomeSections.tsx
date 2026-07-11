import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'

/**
 * CAT-025/026 + how-it-works/events/FAQ/CTA — home marketing sections (RSC,
 * static content). Reveal wrappers are the only client parts. Faithful to the
 * Vite home structure; final visual match is the CAT-024 human pass.
 */

export async function HowItWorks({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const steps = [
    { title: t('how1Title'), body: t('how1Body') },
    { title: t('how2Title'), body: t('how2Body') },
    { title: t('how3Title'), body: t('how3Body') },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <Reveal>
        <h2 className="text-center text-2xl font-bold text-ink-900">{t('howHeading')}</h2>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-violet-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export async function EventTypes({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  // Localized (fixes the previously-hardcoded English list on /ar).
  const eventTypes = t.raw('eventTypes') as string[]
  return (
    <section className="bg-ink-50/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-ink-900">{t('eventsHeading')}</h2>
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {eventTypes.map((e, i) => (
            <Reveal key={e} delay={i * 0.04}>
              <span className="rounded-full border border-ink-200 bg-white px-5 py-2 text-sm font-medium text-ink-700">
                {e}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function HomeCTA({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <Reveal>
        <div className="rounded-3xl bg-gradient-brand px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">{t('ctaHeading')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">{t('ctaBody')}</p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-brand-700"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
