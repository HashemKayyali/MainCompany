import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
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
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
        {title}
      </div>
      <div className="mt-5 space-y-3 text-[12.5px] font-medium">{children}</div>
    </div>
  )
}

export default function Footer() {
  const { categories } = useCategoriesData()

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

  const linkClass = 'text-ink-700/72 transition-colors hover:text-violet-800'

  return (
    <footer className="relative z-10 mt-8 w-full pb-7 pt-12" role="contentinfo" aria-label="Site footer">
      <div className="site-container-wide">
        <div className="section-shell overflow-hidden px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_2fr] lg:gap-12">
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

              <p className="mt-5 max-w-sm text-[13.5px] leading-[1.75] text-ink-700/72">
                Eventies helps clients discover event services, compare trusted providers across Jordan,
                and submit clear requests from one organized marketplace.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200/75 bg-white/72 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.4} />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                  Trusted event services marketplace
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

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-5">
              <FooterColumn title="Categories">
                {categoryLinks.length > 0 ? (
                  categoryLinks.map(item => (
                    <Link key={item.to} to={item.to} className={`flex items-center justify-center gap-2 sm:justify-start ${linkClass}`}>
                      {item.icon ? (
                        <span className="max-w-[1.5rem] truncate text-[13px]" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500/70" aria-hidden="true" />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  ))
                ) : (
                  <Link to="/products" className={linkClass}>
                    Browse services
                  </Link>
                )}
              </FooterColumn>

              <FooterColumn title="Company">
                {companyLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title="Support">
                {supportLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title="Legal">
                {policyLinks.map(item => (
                  <Link key={item.to} to={item.to} className={`block ${linkClass}`}>
                    {item.label}
                  </Link>
                ))}
              </FooterColumn>

              <FooterColumn title="Contact">
                <a href={`tel:${social.phone}`} className={`flex items-center justify-center gap-2 sm:justify-start ${linkClass}`}>
                  <Phone className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                  <span>{social.phoneFormatted}</span>
                </a>
                <div className="flex items-start justify-center gap-2 sm:justify-start">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                  <address className="not-italic text-ink-700/72">Amman, Jordan</address>
                </div>
                {CONTACT_EMAILS.map(item => (
                  <a
                    key={item.address}
                    href={`mailto:${item.address}`}
                    className={`flex items-start justify-center gap-2 break-all sm:justify-start ${linkClass}`}
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                    <span>
                      <span className="block text-[9.5px] font-bold uppercase tracking-[0.15em] text-violet-500/80">
                        {item.label}
                      </span>
                      {item.address}
                    </span>
                  </a>
                ))}
              </FooterColumn>
            </div>
          </div>

          <div className="mt-10 border-t border-violet-100/90 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <p className="text-[11px] font-semibold text-ink-600/70">
                &copy; {new Date().getFullYear()} Eventies. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600/72">
                <Link to="/privacy-policy" className="transition hover:text-violet-900">
                  Privacy
                </Link>
                <Link to="/terms" className="transition hover:text-violet-900">
                  Terms
                </Link>
                <Link to="/cookie-policy" className="transition hover:text-violet-900">
                  Cookies
                </Link>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Made in Jordan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
