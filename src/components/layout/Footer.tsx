import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
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
import { BRAND_LOGO_HORIZONTAL, BRAND_LOGO_HORIZONTAL_PNG } from '../../config/brand'
import { useCategoriesData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/LanguageContext'
import { social, socialLinks } from '../../data/social'

const CONTACT_EMAILS = [
  { label: 'General', address: social.email },
  { label: 'Event Requests', address: 'booking@eventiesjo.com' },
  { label: 'Vendors', address: 'vendors@eventiesjo.com' },
  { label: 'Support', address: 'support@eventiesjo.com' },
] as const

const companyLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Eventies' },
  { to: '/custom-builds', label: 'Custom Builds' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

const supportLinks = [
  { to: '/products', label: 'Browse Services' },
  { to: '/contact', label: 'Request a Quote' },
  { to: '/my-requests', label: 'Track Requests' },
  { to: '/contact?type=provider', label: 'Become a Provider' },
  { to: '/help', label: 'Help Center' },
]

const policyLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/vendor-terms', label: 'Vendor Terms' },
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/cookie-policy', label: 'Cookie Policy' },
]

const socialIconMap: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
}

function SocialIcon({ platform }: { platform: string }) {
  const Icon = socialIconMap[platform.toLowerCase()] || Sparkles
  return <Icon className="h-4 w-4" strokeWidth={2.2} />
}

function FooterColumn({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`text-center sm:text-left ${className}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">{title}</div>
      <div className="mt-4 space-y-3 text-[12.5px] font-medium">{children}</div>
    </div>
  )
}

function MobileFooterAccordion({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <details className="group rounded-2xl border border-violet-100/90 bg-white/72 px-4 py-3 shadow-[0_14px_40px_-32px_rgba(89,23,196,0.35)]">
      <summary className="flex list-none items-center justify-between gap-3 cursor-pointer">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">{title}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition-transform group-open:rotate-180">
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </summary>
      <div className="mt-4 space-y-3 text-[13px] font-medium text-ink-700/85">{children}</div>
    </details>
  )
}

export default function Footer() {
  const { categories } = useCategoriesData()
  const { translateText, dir } = useI18n()

  const categoryLinks = useMemo(
    () =>
      categories
        .filter(category => category.slug.trim().length > 0)
        .slice(0, 8)
        .map(category => ({
          to: `/categories/${encodeURIComponent(category.slug)}`,
          label: category.name,
          icon: category.icon?.trim() || '',
        })),
    [categories]
  )

  const footerSocialLinks = useMemo(
    () => [
      ...socialLinks,
      { platform: 'WhatsApp', url: social.whatsapp, label: 'WhatsApp' },
    ],
    []
  )

  const linkClass = 'text-ink-700/78 transition-colors hover:text-violet-800'
  const footerSections = [
    {
      title: translateText('Categories'),
      content: categoryLinks.length > 0 ? (
        categoryLinks.map(item => (
          <Link key={item.to} to={item.to} className={`flex items-center justify-between gap-2 ${linkClass}`}>
            <span className="truncate">{translateText(item.label)}</span>
            {item.icon ? (
              <span className="max-w-[1.5rem] shrink-0 truncate text-[13px]" aria-hidden="true">
                {item.icon}
              </span>
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/70" aria-hidden="true" />
            )}
          </Link>
        ))
      ) : (
        <Link to="/products" className={linkClass}>
          {translateText('Browse Services')}
        </Link>
      ),
    },
    {
      title: translateText('Company'),
      content: companyLinks.map(item => (
        <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
          {translateText(item.label)}
        </Link>
      )),
    },
    {
      title: translateText('Support'),
      content: supportLinks.map(item => (
        <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
          {translateText(item.label)}
        </Link>
      )),
    },
    {
      title: translateText('Legal'),
      content: policyLinks.map(item => (
        <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
          {translateText(item.label)}
        </Link>
      )),
    },
  ]

  return (
    <footer className="relative z-10 mt-8 w-full pb-7 pt-12" role="contentinfo" aria-label="Site footer">
      <div className="site-container-wide">
        <div className="section-shell overflow-hidden px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 gap-5 sm:hidden">
            <div className="rounded-[30px] border border-violet-100/90 bg-white/88 px-5 py-6 shadow-[0_24px_60px_-36px_rgba(89,23,196,0.35)]">
              <div className="flex flex-col items-center text-center">
                <Link to="/" className="inline-flex h-11 w-[156px] items-center transition-opacity hover:opacity-85" aria-label="Eventies home">
                  <img
                    src={BRAND_LOGO_HORIZONTAL}
                    alt="Eventies"
                    width={190}
                    height={58}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-contain"
                    onError={event => {
                      const image = event.currentTarget
                      if (image.dataset.fallbackLogo === 'true') return
                      image.dataset.fallbackLogo = 'true'
                      image.src = BRAND_LOGO_HORIZONTAL_PNG
                    }}
                  />
                </Link>

                <p className="mt-4 max-w-sm text-[13px] leading-[1.9] text-ink-700/78">
                  {translateText(
                    'Eventies helps clients discover event services, compare trusted providers across Jordan, and submit clear requests from one organized marketplace.'
                  )}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-200/75 bg-white/72 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.4} />
                  <span className="text-[10px] font-bold tracking-[0.02em] text-violet-700">
                    {translateText('Trusted event services marketplace')}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                  {footerSocialLinks.map(item => (
                    <a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200/80 bg-white text-violet-700 shadow-[0_10px_22px_-18px_rgba(89,23,196,0.55)] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
                      aria-label={`Follow Eventies on ${item.platform}`}
                    >
                      <SocialIcon platform={item.platform} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {footerSections.map(section => (
                <MobileFooterAccordion key={section.title} title={section.title}>
                  {section.content}
                </MobileFooterAccordion>
              ))}

              <MobileFooterAccordion title={translateText('Contact')}>
                <a href={`tel:${social.phone}`} className={`flex items-center justify-between gap-3 ${linkClass}`} dir="ltr">
                  <span className="font-semibold">{social.phoneFormatted}</span>
                  <Phone className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                </a>
                <div className="flex items-center justify-between gap-3 text-ink-700/78">
                  <span>{translateText('Amman, Jordan')}</span>
                  <MapPin className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                </div>
                <div className="space-y-2 pt-1">
                  {CONTACT_EMAILS.map(item => (
                    <a
                      key={item.address}
                      href={`mailto:${item.address}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/55 px-3 py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50"
                    >
                      <div className="min-w-0 text-right">
                        <div className="text-[10px] font-bold tracking-[0.02em] text-violet-600">{translateText(item.label)}</div>
                        <div className="truncate text-[12px] font-semibold text-ink-800" dir="ltr">
                          {item.address}
                        </div>
                      </div>
                      <Mail className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    </a>
                  ))}
                </div>
              </MobileFooterAccordion>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_2.05fr] lg:gap-12">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <Link to="/" className="inline-flex h-12 w-[166px] items-center transition-opacity hover:opacity-85" aria-label="Eventies home">
                <img
                  src={BRAND_LOGO_HORIZONTAL}
                  alt="Eventies"
                  width={190}
                  height={58}
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full object-contain"
                  onError={event => {
                    const image = event.currentTarget
                    if (image.dataset.fallbackLogo === 'true') return
                    image.dataset.fallbackLogo = 'true'
                    image.src = BRAND_LOGO_HORIZONTAL_PNG
                  }}
                />
              </Link>

              <p className="mt-5 max-w-sm text-[13.5px] leading-[1.85] text-ink-700/72">
                {translateText(
                  'Eventies helps clients discover event services, compare trusted providers across Jordan, and submit clear requests from one organized marketplace.'
                )}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200/75 bg-white/72 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.4} />
                <span className="text-[10px] font-bold tracking-[0.02em] text-violet-700">
                  {translateText('Trusted event services marketplace')}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                {footerSocialLinks.map(item => (
                  <a
                    key={item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200/80 bg-white text-violet-700 shadow-[0_10px_22px_-18px_rgba(89,23,196,0.55)] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
                    aria-label={`Follow Eventies on ${item.platform}`}
                  >
                    <SocialIcon platform={item.platform} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 xl:grid-cols-[0.95fr_0.9fr_0.9fr_0.9fr_1.15fr]">
              <FooterColumn title={translateText('Categories')}>
                {categoryLinks.length > 0 ? (
                  categoryLinks.map(item => (
                    <Link key={item.to} to={item.to} className={`flex items-center gap-2 ${linkClass}`}>
                      {item.icon ? (
                        <span className="max-w-[1.5rem] truncate text-[13px]" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500/70" aria-hidden="true" />
                      )}
                      <span>{translateText(item.label)}</span>
                    </Link>
                  ))
                ) : (
                  <Link to="/products" className={linkClass}>
                    {translateText('Browse Services')}
                  </Link>
                )}
              </FooterColumn>

              <FooterColumn title={translateText('Company')}>
                {companyLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {translateText(item.label)}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title={translateText('Support')}>
                {supportLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {translateText(item.label)}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title={translateText('Legal')}>
                {policyLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {translateText(item.label)}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title={translateText('Contact')} className={dir === 'rtl' ? 'xl:text-right' : ''}>
                <div className="space-y-3.5">
                  <a href={`tel:${social.phone}`} className={`flex items-center gap-2 ${linkClass}`} dir="ltr">
                    <Phone className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    <span>{social.phoneFormatted}</span>
                  </a>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    <address className="not-italic text-ink-700/72">{translateText('Amman, Jordan')}</address>
                  </div>
                  <div className="space-y-2.5">
                    {CONTACT_EMAILS.map(item => (
                      <a
                        key={item.address}
                        href={`mailto:${item.address}`}
                        className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/72 px-3 py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                        <div className="min-w-0">
                          <span className="block text-[9.5px] font-bold uppercase tracking-[0.15em] text-violet-500/80">
                            {translateText(item.label)}
                          </span>
                          <span className="block truncate text-[12.5px] font-semibold text-ink-800" dir="ltr">
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

          <div className="mt-8 sm:mt-10 border-t border-violet-100/90 pt-5 sm:pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <p className="text-[11px] font-semibold text-ink-600/70">
                &copy; {new Date().getFullYear()} Eventies. {translateText('All rights reserved.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600/72">
                <Link to="/privacy-policy" className="transition hover:text-violet-900">
                  {translateText('Privacy')}
                </Link>
                <Link to="/terms" className="transition hover:text-violet-900">
                  {translateText('Terms')}
                </Link>
                <Link to="/cookie-policy" className="transition hover:text-violet-900">
                  {translateText('Cookies')}
                </Link>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {translateText('Made in Jordan')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
