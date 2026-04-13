import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useProductsData } from '../../contexts/DataContext'
import { social, socialLinks } from '../../data/social'

export default function Footer() {
  const { isDark } = useTheme()
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

  const subtle = isDark ? 'text-purple-100/50' : 'text-gray-400'
  const linkClass = isDark
    ? 'text-purple-100/70 hover:text-white transition-colors'
    : 'text-gray-600 hover:text-gray-900 transition-colors'

  return (
    <footer className="relative pb-5 pt-5 sm:pb-4 sm:pt-4" role="contentinfo" aria-label="Site footer">
      <div className="site-container">
        <div className="section-shell px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]">
            {/* Brand */}
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[14px] border border-white/14 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_115%)] shadow-md">
                  <div className="absolute inset-x-2 top-1.5 h-2.5 rounded-full bg-white/18 blur-sm" />
                  <span className="relative text-[10.5px] font-black tracking-[0.12em] text-white">Ev</span>
                </div>
                <div className="leading-none">
                  <div className={`font-display text-[13px] font-bold tracking-[-0.01em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Eventies
                  </div>
                  <div className={`mt-[3px] text-[9px] uppercase tracking-[0.18em] ${subtle}`}>
                    Marketplace
                  </div>
                </div>
              </div>
              <p className={`mt-3 text-[12.5px] leading-6 ${isDark ? 'text-purple-100/60' : 'text-gray-500'}`}>
                A premium marketplace for discovering, comparing, and booking trusted
                event services — from first visit to final inquiry.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${subtle}`}>
                Navigate
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {pages.map((item) => (
                  <Link key={item.to} to={item.to} className={`text-[12.5px] font-medium ${linkClass}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${subtle}`}>
                Featured
              </div>
              <div className="mt-3 flex flex-col gap-2">
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
              <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${subtle}`}>
                Connect
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className={`text-[10px] uppercase tracking-[0.16em] ${subtle}`}>Email</div>
                  <a href={`mailto:${social.email}`} className={`mt-1 block text-[13px] font-medium ${linkClass}`}>
                    {social.email}
                  </a>
                </div>
                <div>
                  <div className={`text-[10px] uppercase tracking-[0.16em] ${subtle}`}>Phone</div>
                  <a href={`tel:${social.phone}`} className={`mt-1 block text-[13px] font-medium ${linkClass}`}>
                    {social.phoneFormatted}
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        isDark
                          ? 'border-white/8 text-purple-100/60 hover:border-white/16 hover:text-white'
                          : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-gray-900'
                      }`}
                      aria-label={`Follow us on ${item.platform}`}
                    >
                      {item.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`relative mt-6 border-t pt-4 ${isDark ? 'border-white/8' : 'border-violet-200/60'}`}>
            <p className={`text-[10px] uppercase tracking-[0.14em] ${subtle}`}>
              &copy; {new Date().getFullYear()} Eventies &middot; Premium event services marketplace
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
