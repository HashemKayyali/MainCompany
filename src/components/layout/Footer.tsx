import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Sparkles } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { social, socialLinks } from '../../data/social'

export default function Footer() {
  const { products } = useProductsData()

  const pages = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/products', label: 'Products' },
      { to: '/customers', label: 'Customers' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
    []
  )

  const topProducts = useMemo(() => (products || []).slice(0, 5), [products])

  const subtle = 'text-violet-600/65'
  const linkClass = 'text-ink-700/85 hover:text-violet-700 transition-colors'

  return (
    <footer className="relative pb-6 pt-6 sm:pb-5 sm:pt-5" role="contentinfo" aria-label="Site footer">
      <div className="site-container">
        <div className="section-shell px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="relative grid gap-7 md:grid-cols-2 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]">
            {/* Brand */}
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-white/30 bg-[linear-gradient(145deg,#7c3aed_0%,#a855f7_48%,#c026d3_115%)] shadow-[0_12px_32px_-6px_rgba(124,58,237,0.55)]">
                  <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/30 blur-sm" />
                  <span className="relative text-[11px] font-black tracking-[0.12em] text-white">Ev</span>
                </div>
                <div className="leading-none">
                  <div className="font-display text-[14px] font-bold tracking-[-0.01em]" style={{ color: '#1a0b3d' }}>
                    Eventies
                  </div>
                  <div className={`mt-[3px] text-[9px] uppercase tracking-[0.18em] ${subtle}`}>
                    Marketplace
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-[1.7]" style={{ color: 'rgba(61, 35, 112, 0.78)' }}>
                A premium marketplace for discovering, comparing, and booking trusted event services
                — from first visit to final inquiry.
              </p>

              {/* Subtle accent */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/70 px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-violet-600" strokeWidth={2.4} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                  Trusted by 30+ vendors
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${subtle}`}>
                Navigate
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {pages.map((item) => (
                  <Link key={item.to} to={item.to} className={`text-[12.5px] font-medium ${linkClass}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${subtle}`}>
                Featured
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {topProducts.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/products/${item.slug}`}
                    className={`text-[12.5px] font-medium ${linkClass}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${subtle}`}>
                Connect
              </div>
              <div className="mt-4 space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-[10px] border border-violet-200/70 bg-violet-50/80">
                    <Mail className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase tracking-[0.16em] ${subtle}`}>Email</div>
                    <a href={`mailto:${social.email}`} className={`mt-0.5 block text-[12.5px] font-medium ${linkClass}`}>
                      {social.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-[10px] border border-violet-200/70 bg-violet-50/80">
                    <Phone className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase tracking-[0.16em] ${subtle}`}>Phone</div>
                    <a href={`tel:${social.phone}`} className={`mt-0.5 block text-[12.5px] font-medium ${linkClass}`}>
                      {social.phoneFormatted}
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {socialLinks.map((item) => (
                    <a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-violet-200/70 bg-white/80 px-3 py-1.5 text-[10.5px] font-semibold tracking-wide text-violet-700 transition-all hover:border-violet-400/85 hover:bg-violet-50/80 hover:text-violet-900 hover:shadow-[0_4px_12px_-4px_rgba(124,58,237,0.22)]"
                      aria-label={`Follow us on ${item.platform}`}
                    >
                      {item.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100/85 pt-5">
            <p className={`text-[10px] uppercase tracking-[0.16em] ${subtle}`}>
              &copy; {new Date().getFullYear()} Eventies &middot; Premium event services marketplace
            </p>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600/70">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
              Made in Jordan
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
