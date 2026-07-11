'use client'

import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Sparkles, Store } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/**
 * CAT-002 — home hero, REARCHITECTED from the Vite Hero.tsx as a client island.
 * The WebGL badge is browser-only, loaded via next/dynamic ssr:false (never in
 * a server module or the shared bundle). Motion honours prefers-reduced-motion
 * (A11Y-007). Category chips are passed as props from the server home page
 * (the client never fetches catalog data — Constitution §2). The showcase
 * image is a plain <img loading="eager"> (LCP candidate, IMG-003) with the
 * shared fallback.
 */

const HeroShaderBadge = dynamic(() => import('./HeroShaderBadge'), { ssr: false })

const EASE = [0.4, 0, 0.2, 1] as const
const fadeUp = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }

export type HeroChip = { id: string; slug: string; name: string }

export function HeroClient({ chips, image = '/images/hero-bg-event.webp' }: { chips: HeroChip[]; image?: string }) {
  const t = useTranslations('catalog.hero')
  const reduce = useReducedMotion()
  const motionOn = !reduce
  const tr = (delay = 0) => ({ duration: 0.9, delay, ease: EASE })
  const float = (delay: number) =>
    motionOn
      ? { animate: { y: [0, -9, 0] }, transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const, delay } }
      : {}

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-ink-900 via-brand-900 to-ink-800 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="max-w-3xl">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 backdrop-blur-md"
            initial={motionOn ? fadeUp.hidden : false}
            animate={motionOn ? fadeUp.visible : undefined}
            transition={tr(0)}
          >
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.2} />
            <span className="text-xs font-semibold tracking-wide">{t('eyebrow')}</span>
          </motion.div>

          <motion.h1
            className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-bold tracking-tight"
            initial={motionOn ? fadeUp.hidden : false}
            animate={motionOn ? fadeUp.visible : undefined}
            transition={tr(0.06)}
          >
            {t('headline')}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/85"
            initial={motionOn ? fadeUp.hidden : false}
            animate={motionOn ? fadeUp.visible : undefined}
            transition={tr(0.14)}
          >
            {t('subhead')}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={motionOn ? fadeUp.hidden : false}
            animate={motionOn ? fadeUp.visible : undefined}
            transition={tr(0.22)}
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-violet-lg transition hover:-translate-y-0.5"
            >
              {t('exploreCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/30 bg-white/[0.07] px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5"
            >
              {t('quoteCta')}
            </Link>
          </motion.div>

          {chips.length > 0 ? (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-2"
              initial={motionOn ? fadeUp.hidden : false}
              animate={motionOn ? fadeUp.visible : undefined}
              transition={tr(0.3)}
            >
              <span className="me-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                {t('browse')}
              </span>
              {chips.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/15"
                >
                  {c.name}
                </Link>
              ))}
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="relative"
          initial={motionOn ? { opacity: 0, y: 40, scale: 0.985 } : false}
          animate={motionOn ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={tr(0.08)}
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 backdrop-blur-xl shadow-violet-xl">
            <div className="relative overflow-hidden rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- LCP hero showcase, eager, no Cloudinary transform */}
              <img
                src={image}
                alt={t('imageAlt')}
                width={960}
                height={720}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-[300px] w-full object-cover object-center sm:h-[360px] lg:h-[420px]"
                onError={(e) => {
                  const el = e.currentTarget
                  if (el.dataset.fb === '1') return
                  el.dataset.fb = '1'
                  el.src = '/images/image-fallback.svg'
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(8,3,26,0.28) 0%, transparent 30%, transparent 55%, rgba(8,3,26,0.7) 100%)',
                }}
              />
              <div className="absolute end-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">{t('trusted')}</span>
              </div>
              <motion.div className="absolute start-3.5 top-14 w-52" {...float(0)}>
                <div className="rounded-2xl border border-white/20 bg-white/[0.12] p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                      <CalendarCheck className="h-5 w-5 text-white" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[8.5px] font-bold uppercase tracking-widest text-fuchsia-100">{t('forClients')}</div>
                      <div className="text-xs font-bold text-white">{t('browseRequest')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div className="absolute bottom-16 end-3.5 w-52" {...float(1.2)}>
                <div className="rounded-2xl border border-white/20 bg-white/[0.12] p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700">
                      <Store className="h-5 w-5 text-white" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[8.5px] font-bold uppercase tracking-widest text-violet-100">{t('forProviders')}</div>
                      <div className="text-xs font-bold text-white">{t('growWithUs')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {motionOn ? (
                <div className="absolute bottom-3.5 start-3.5">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <HeroShaderBadge />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-black text-white">
                  E
                </span>
                <span className="font-display text-sm font-bold text-white">Eventies</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {['Games', 'VR', 'LED Screens', 'Booths', 'Production'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
