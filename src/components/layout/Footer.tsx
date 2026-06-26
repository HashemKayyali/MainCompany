import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { BRAND_LOGO_HORIZONTAL, BRAND_LOGO_HORIZONTAL_PNG } from '../../config/brand'
import { social, socialLinks } from '../../data/social'

const MARKETPLACE_LINKS = [
  { to: '/products', label: 'All Products' },
  { to: '/categories/eventies', label: 'Eventies' },
  { to: '/categories/terminal-vr', label: 'The Terminal VR' },
  { to: '/gallery', label: 'Gallery' },
]

const EVENT_TYPE_LINKS = [
  { to: '/products', label: 'Corporate Activations' },
  { to: '/products', label: 'Exhibitions & Booths' },
  { to: '/products', label: 'Private Parties' },
  { to: '/products', label: 'Gaming Zones' },
]

const CUSTOMER_LINKS = [
  { to: '/rental-cart', label: 'Rental Cart' },
  { to: '/purchase-quote', label: 'Quote Request' },
  { to: '/my-requests', label: 'My Requests' },
  { to: '/profile', label: 'My Account' },
]

const PROVIDER_LINKS = [
  { to: '/contact', label: 'Join as a Provider' },
  { to: '/about', label: 'Why Eventies' },
]

const COMPANY_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/customers', label: 'Customers' },
]

export default function Footer() {
  const linkClass =
    'text-[13px] text-slate-600 transition-colors hover:text-brand-700'

  return (
    <footer className="relative border-t border-slate-200 bg-white" role="contentinfo" aria-label="Site footer">
      <div className="site-container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex h-10 w-[132px] items-center">
              <img
                src={BRAND_LOGO_HORIZONTAL}
                alt="Eventies"
                width={170}
                height={52}
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
            <p className="mt-4 max-w-xs text-[13px] leading-[1.75] text-slate-500">
              A premium marketplace for discovering, comparing, and booking trusted event rentals and services in Jordan.
            </p>

            {/* Contact summary */}
            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${social.email}`}
                className="flex items-center gap-2.5 text-[13px] text-slate-600 transition-colors hover:text-brand-700"
              >
                <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                {social.email}
              </a>
              <a
                href={`tel:${social.phone}`}
                className="flex items-center gap-2.5 text-[13px] text-slate-600 transition-colors hover:text-brand-700"
              >
                <Phone className="h-4 w-4 text-slate-400" strokeWidth={2} />
                {social.phoneFormatted}
              </a>
              <div className="flex items-center gap-2.5 text-[13px] text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" strokeWidth={2} />
                Jordan
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900">
              Marketplace
            </div>
            <ul className="space-y-2.5">
              {MARKETPLACE_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Types */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900">
              Event Types
            </div>
            <ul className="space-y-2.5">
              {EVENT_TYPE_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Customers */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900">
              For Customers
            </div>
            <ul className="space-y-2.5">
              {CUSTOMER_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers + Company */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900">
              For Providers
            </div>
            <ul className="space-y-2.5">
              {PROVIDER_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mb-4 mt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-900">
              Company
            </div>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social + Copyright bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {socialLinks.map(item => (
              <a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-all hover:border-brand-300 hover:text-brand-700"
                aria-label={`Follow us on ${item.platform}`}
              >
                {item.platform}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} Eventies</span>
            <span className="hidden h-3 w-px bg-slate-300 sm:inline" />
            <span>Marketplace for event services in Jordan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
