import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import {
  ChevronDown,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { social, socialLinks } from '@/shared/data/social'

/** Minimal category shape the footer needs (passed from the layout, which owns
 *  the server/ boundary — keeps components/ free of DAL imports). */
export type FooterCategory = { slug: string; name: string; icon?: string }

/**
 * CAT-024 footer — VERBATIM port of the Vite Footer (server component). Brand
 * block + trust badge + social row, Categories/Company/Support/Legal/Contact
 * columns on desktop, <details> accordions on mobile (no JS), and the bottom
 * bar. Contact emails from the audited registry. A11Y-001 landmark.
 */
const CONTACT_EMAILS = [
  { key: 'general', address: social.email },
  { key: 'eventRequests', address: 'booking@eventiesjo.com' },
  { key: 'vendors', address: 'vendors@eventiesjo.com' },
  { key: 'support', address: 'support@eventiesjo.com' },
] as const

const socialIconMap: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
}

function SocialIcon({ platform }: { platform: string }) {
  const Icon = socialIconMap[platform.toLowerCase()] || Sparkles
  return <Icon className="h-4 w-4" strokeWidth={2.2} />
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="text-center sm:text-start">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
        {title}
      </div>
      <div className="mt-4 space-y-3 text-[12.5px] font-medium">{children}</div>
    </div>
  )
}

function MobileAccordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-violet-100/90 bg-white/72 px-4 py-3 shadow-[0_14px_40px_-32px_rgba(89,23,196,0.35)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">
          {title}
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition-transform group-open:rotate-180">
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </summary>
      <div className="mt-4 space-y-3 text-[13px] font-medium text-ink-700/85">{children}</div>
    </details>
  )
}

const LINK = 'text-ink-700/78 transition-colors hover:text-violet-800'

export async function SiteFooter({
  locale,
  categories,
}: {
  locale: string
  categories: FooterCategory[]
}) {
  const loc = locale as 'en' | 'ar'
  const t = await getTranslations({ locale: loc, namespace: 'footer' })
  const year = 2026

  const categoryLinks = categories
    .filter((c) => c.slug.trim().length > 0)
    .slice(0, 8)
    .map((c) => ({ href: `/categories/${c.slug}`, label: c.name, icon: c.icon?.trim() || '' }))

  const companyLinks = [
    { href: '/', label: t('company.home') },
    { href: '/about', label: t('company.about') },
    { href: '/custom-builds', label: t('company.customBuilds') },
    { href: '/customers', label: t('company.customers') },
    { href: '/gallery', label: t('company.gallery') },
    { href: '/contact', label: t('company.contact') },
  ]
  const supportLinks = [
    { href: '/products', label: t('support.browse') },
    { href: '/contact', label: t('support.quote') },
    { href: '/my-requests', label: t('support.track') },
    { href: '/contact?type=provider', label: t('support.provider') },
    { href: '/help', label: t('support.help') },
  ]
  const policyLinks = [
    { href: '/privacy-policy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
    { href: '/vendor-terms', label: t('vendorTerms') },
    { href: '/refund-policy', label: t('refund') },
    { href: '/cookie-policy', label: t('cookies') },
  ]
  const footerSocial = [
    ...socialLinks,
    { platform: 'WhatsApp', url: social.whatsapp, label: 'WhatsApp' },
  ]

  const BrandBlock = (
    <>
      <Link
        href="/"
        className="inline-flex h-12 w-[166px] items-center transition-opacity hover:opacity-85"
        aria-label={t('company.home')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, fixed size */}
        <img
          src="/brand/eventies_logo_horizontal_800.webp"
          alt="Eventies"
          width={190}
          height={58}
          className="block h-full w-full object-contain"
        />
      </Link>
      <p className="mt-5 max-w-sm text-[13.5px] leading-[1.85] text-ink-700/72">
        {t('brandDescription')}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200/75 bg-white/72 px-3 py-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.4} />
        <span className="text-[10px] font-bold tracking-[0.02em] text-violet-700">
          {t('trustBadge')}
        </span>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
        {footerSocial.map((item) => (
          <a
            key={item.platform}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200/80 bg-white text-violet-700 shadow-[0_10px_22px_-18px_rgba(89,23,196,0.55)] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
            aria-label={t('followOn', { platform: item.platform })}
          >
            <SocialIcon platform={item.platform} />
          </a>
        ))}
      </div>
    </>
  )

  return (
    <footer
      className="relative z-10 mt-8 w-full pb-7 pt-12"
      role="contentinfo"
      aria-label={t('exploreHeading')}
    >
      <div className="site-container-wide">
        <div className="section-shell overflow-hidden px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {/* Mobile */}
          <div className="grid grid-cols-1 gap-5 sm:hidden">
            <div className="rounded-[30px] border border-violet-100/90 bg-white/88 px-5 py-6 shadow-[0_24px_60px_-36px_rgba(89,23,196,0.35)]">
              <div className="flex flex-col items-center text-center">{BrandBlock}</div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <MobileAccordion title={t('categoriesHeading')}>
                {categoryLinks.length > 0 ? (
                  categoryLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between gap-2 ${LINK}`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.icon ? (
                        <span
                          className="max-w-[1.5rem] shrink-0 truncate text-[13px]"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      ) : (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/70"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  ))
                ) : (
                  <Link href="/products" className={LINK}>
                    {t('browseServices')}
                  </Link>
                )}
              </MobileAccordion>
              <MobileAccordion title={t('companyHeading')}>
                {companyLinks.map((item, i) => (
                  <Link key={i} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </MobileAccordion>
              <MobileAccordion title={t('supportHeading')}>
                {supportLinks.map((item, i) => (
                  <Link key={i} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </MobileAccordion>
              <MobileAccordion title={t('legalHeading')}>
                {policyLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </MobileAccordion>
              <MobileAccordion title={t('contactHeading')}>
                <a
                  href={`tel:${social.phone}`}
                  className={`flex items-center justify-between gap-3 ${LINK}`}
                  dir="ltr"
                >
                  <span className="font-semibold">{social.phoneFormatted}</span>
                  <Phone className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                </a>
                <div className="flex items-center justify-between gap-3 text-ink-700/78">
                  <span>{t('amman')}</span>
                  <MapPin className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                </div>
                <div className="space-y-2 pt-1">
                  {CONTACT_EMAILS.map((item) => (
                    <a
                      key={item.address}
                      href={`mailto:${item.address}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/55 px-3 py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50"
                    >
                      <div className="min-w-0 text-start">
                        <div className="text-[10px] font-bold tracking-[0.02em] text-violet-600">
                          {t(`contactEmails.${item.key}`)}
                        </div>
                        <div className="truncate text-[12px] font-semibold text-ink-800" dir="ltr">
                          {item.address}
                        </div>
                      </div>
                      <Mail className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    </a>
                  ))}
                </div>
              </MobileAccordion>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden gap-10 sm:grid sm:grid-cols-1 lg:grid-cols-[0.95fr_2.05fr] lg:gap-12">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
              {BrandBlock}
            </div>
            <div className="grid grid-cols-2 gap-8 xl:grid-cols-[0.95fr_0.9fr_0.9fr_0.9fr_1.15fr]">
              <FooterColumn title={t('categoriesHeading')}>
                {categoryLinks.length > 0 ? (
                  categoryLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 ${LINK}`}
                    >
                      {item.icon ? (
                        <span className="max-w-[1.5rem] truncate text-[13px]" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-violet-500/70"
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  ))
                ) : (
                  <Link href="/products" className={LINK}>
                    {t('browseServices')}
                  </Link>
                )}
              </FooterColumn>
              <FooterColumn title={t('companyHeading')}>
                {companyLinks.map((item, i) => (
                  <Link key={i} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>
              <FooterColumn title={t('supportHeading')}>
                {supportLinks.map((item, i) => (
                  <Link key={i} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>
              <FooterColumn title={t('legalHeading')}>
                {policyLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={`block ${LINK}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>
              <FooterColumn title={t('contactHeading')}>
                <div className="space-y-3.5">
                  <a
                    href={`tel:${social.phone}`}
                    className={`flex items-center gap-2 ${LINK}`}
                    dir="ltr"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    <span>{social.phoneFormatted}</span>
                  </a>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    <address className="not-italic text-ink-700/72">{t('amman')}</address>
                  </div>
                  <div className="space-y-2.5">
                    {CONTACT_EMAILS.map((item) => (
                      <a
                        key={item.address}
                        href={`mailto:${item.address}`}
                        className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/72 px-3 py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                        <div className="min-w-0">
                          <span className="block text-[9.5px] font-bold uppercase tracking-[0.15em] text-violet-500/80">
                            {t(`contactEmails.${item.key}`)}
                          </span>
                          <span
                            className="block truncate text-[12.5px] font-semibold text-ink-800"
                            dir="ltr"
                          >
                            {item.address}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </FooterColumn>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 border-t border-violet-100/90 pt-5 sm:mt-10 sm:pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
              <p className="text-[11px] font-semibold text-ink-600/70">
                &copy; {year} Eventies. {t('rights')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600/72">
                <Link href="/privacy-policy" className="transition hover:text-violet-900">
                  {t('privacyShort')}
                </Link>
                <Link href="/terms" className="transition hover:text-violet-900">
                  {t('termsShort')}
                </Link>
                <Link href="/cookie-policy" className="transition hover:text-violet-900">
                  {t('cookiesShort')}
                </Link>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {t('madeInJordan')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
