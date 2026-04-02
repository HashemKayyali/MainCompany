import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type IconName =
  | 'catalog'
  | 'media'
  | 'partners'
  | 'access'
  | 'plus'
  | 'gallery'
  | 'users'
  | 'logs'
  | 'spark'
  | 'warning'
  | 'shield'
  | 'arrow'

function Icon({ name, className }: { name: IconName; className?: string }) {
  const cls = `h-5 w-5 ${className || ''}`

  switch (name) {
    case 'catalog':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 7.5h14M5 12h14M5 16.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4.5 5.5h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    case 'media':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" fill="currentColor" />
          <path d="m20 15.5-4.6-4.6a1.4 1.4 0 0 0-2 0L8 16.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'partners':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 20c0-3-2-5-4-5s-4 2-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 13a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 12 13Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19.5 19c0-2.3-1.3-3.9-3.1-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'access':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3.5 19 6.8v6.4c0 4.1-2.9 7.5-7 8.8-4.1-1.3-7-4.7-7-8.8V6.8L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.5 12.2 11.4 14l3.4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'gallery':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'users':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 21c0-3.8-3.6-6.8-8-6.8S4 17.2 4 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'logs':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'spark':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'warning':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4 20 18H4L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 9v4.5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3.5 19 6.8v6.4c0 4.1-2.9 7.5-7 8.8-4.1-1.3-7-4.7-7-8.8V6.8L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'arrow':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 12h12M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  const { isDark } = useTheme()

  return (
    <section
      className={cn(
        'rounded-[20px] p-3.5 md:p-4',
        isDark
          ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
          : 'bg-white ring-1 ring-inset ring-gray-200',
        className
      )}
    >
      <div className="mb-3">
        <h2 className={cn('font-display text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>{title}</h2>
        {subtitle && <p className={cn('mt-1 text-[13px] leading-5', isDark ? 'text-purple-100/64' : 'text-gray-500')}>{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function QuickActionCard({
  to,
  title,
  hint,
  icon,
}: {
  to: string
  title: string
  hint: string
  icon: IconName
}) {
  const { isDark } = useTheme()

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-3 rounded-[18px] px-3.5 py-3.5 transition duration-200',
        isDark
          ? 'bg-[#0d1430]/88 ring-1 ring-inset ring-cyan-400/10 hover:bg-[#111a39] hover:ring-cyan-300/16'
          : 'bg-gray-50/80 ring-1 ring-inset ring-gray-200 hover:bg-white'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]',
          isDark
            ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.18))] text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
            : 'bg-violet-50 text-violet-700'
        )}
      >
        <Icon name={icon} className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn('text-[13px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{title}</div>
        <div className={cn('mt-0.5 text-[11px] leading-5', isDark ? 'text-purple-100/60' : 'text-gray-500')}>{hint}</div>
      </div>

      <div className={cn('shrink-0 transition group-hover:translate-x-0.5', isDark ? 'text-cyan-200/80' : 'text-violet-600')}>
        <Icon name="arrow" className="h-4 w-4" />
      </div>
    </Link>
  )
}

function ReportCard({
  title,
  tone,
  metrics,
  footer,
}: {
  title: string
  tone: 'good' | 'watch' | 'alert'
  metrics: Array<{ label: string; value: React.ReactNode }>
  footer: string
}) {
  const { isDark } = useTheme()

  const toneClass =
    tone === 'good'
      ? isDark
        ? 'bg-cyan-400/10 text-cyan-200 ring-cyan-400/18'
        : 'bg-cyan-50 text-cyan-700 ring-cyan-200'
      : tone === 'watch'
        ? isDark
          ? 'bg-amber-400/10 text-amber-200 ring-amber-400/18'
          : 'bg-amber-50 text-amber-700 ring-amber-200'
        : isDark
          ? 'bg-red-400/10 text-red-200 ring-red-400/18'
          : 'bg-red-50 text-red-700 ring-red-200'

  const toneLabel = tone === 'good' ? 'Healthy' : tone === 'watch' ? 'Watch' : 'Needs action'

  return (
    <div
      className={cn(
        'rounded-[18px] p-3.5',
        isDark
          ? 'bg-[#0d1430]/88 ring-1 ring-inset ring-cyan-400/10'
          : 'bg-gray-50/80 ring-1 ring-inset ring-gray-200'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={cn('text-[13px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{title}</div>
        <span className={cn('rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] ring-1 ring-inset', toneClass)}>
          {toneLabel}
        </span>
      </div>

      <div className="space-y-2">
        {metrics.map(metric => (
          <div
            key={metric.label}
            className={cn(
              'flex items-center justify-between gap-4 rounded-[16px] px-3 py-2.5',
              isDark ? 'bg-black/15 ring-1 ring-inset ring-white/5' : 'bg-white ring-1 ring-inset ring-gray-200'
            )}
          >
            <span className={cn('text-[11px]', isDark ? 'text-purple-100/70' : 'text-gray-500')}>{metric.label}</span>
            <span className={cn('text-[13px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{metric.value}</span>
          </div>
        ))}
      </div>

      <div className={cn('mt-3 text-[11px]', isDark ? 'text-cyan-100/58' : 'text-violet-700')}>{footer}</div>
    </div>
  )
}

function AttentionRow({
  title,
  count,
  to,
}: {
  title: string
  count: number
  to: string
}) {
  const { isDark } = useTheme()

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-[16px] px-3 py-2.5 transition',
        isDark
          ? 'bg-[#0d1430]/88 ring-1 ring-inset ring-cyan-400/10 hover:bg-[#111a39]'
          : 'bg-gray-50/80 ring-1 ring-inset ring-gray-200 hover:bg-white'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px]',
          count > 0
            ? isDark
              ? 'bg-red-400/10 text-red-200'
              : 'bg-red-50 text-red-700'
            : isDark
              ? 'bg-cyan-400/10 text-cyan-200'
              : 'bg-cyan-50 text-cyan-700'
        )}
      >
        {count > 0 ? <Icon name="warning" /> : <Icon name="spark" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn('text-[13px] font-medium', isDark ? 'text-white' : 'text-gray-900')}>{title}</div>
        <div className={cn('mt-0.5 text-[11px]', isDark ? 'text-purple-100/58' : 'text-gray-500')}>
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''} need review` : 'Looks good'}
        </div>
      </div>

      <div
        className={cn(
          'rounded-full px-2.5 py-1 text-[11px] font-semibold',
          count > 0
            ? isDark
              ? 'bg-red-400/10 text-red-200'
              : 'bg-red-50 text-red-700'
            : isDark
              ? 'bg-cyan-400/10 text-cyan-200'
              : 'bg-cyan-50 text-cyan-700'
        )}
      >
        {count}
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { products, customers, galleryAlbums, parts, categories, loading, refreshAll } = useData()
  const { currentUser } = useUser()
  const { admins } = useAuth()
  const { isDark } = useTheme()
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0)

  useEffect(() => {
    async function fetchUserCount() {
      if (!isSupabaseConfigured()) return
      try {
        const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
        if (!error && count !== null) setRegisteredUsersCount(count)
      } catch {
        // ignore
      }
    }
    fetchUserCount()
  }, [])

  const firstName = useMemo(() => {
    const name = (currentUser?.name || 'Admin').trim()
    return name.split(' ')[0] || 'Admin'
  }, [currentUser?.name])

  const totalPhotos = useMemo(() => galleryAlbums.reduce((sum, album) => sum + album.images.length, 0), [galleryAlbums])
  const featuredProducts = useMemo(() => products.filter(product => product.featured).length, [products])
  const productsWithVideo = useMemo(() => products.filter(product => !!product.videoUrl).length, [products])
  const hiddenPriceProducts = useMemo(() => products.filter(product => product.showPrice === false).length, [products])
  const outOfStockParts = useMemo(() => parts.filter(part => !part.inStock).length, [parts])
  const customersWithLogo = useMemo(() => customers.filter(customer => !!customer.logo).length, [customers])
  const uncategorizedCustomers = useMemo(() => customers.filter(customer => !(customer.category || '').trim()).length, [customers])
  const categoriesWithImage = useMemo(() => categories.filter(category => !!category.image).length, [categories])
  const emptyAlbums = useMemo(() => galleryAlbums.filter(album => album.images.length === 0).length, [galleryAlbums])
  const superAdmins = useMemo(() => admins.filter(admin => admin.role === 'superadmin').length, [admins])

  const statCards = [
    { label: 'Products', value: products.length, to: '/admin/products', icon: 'catalog' as const },
    { label: 'Photos', value: totalPhotos, to: '/admin/gallery', icon: 'media' as const },
    { label: 'Customers', value: customers.length, to: '/admin/customers', icon: 'partners' as const },
    { label: 'Users', value: registeredUsersCount, to: '/admin/users', icon: 'access' as const },
  ]

  const quickActions = [
    { title: 'Manage Products', hint: 'Edit catalog, prices, media, and homepage order.', to: '/admin/products', icon: 'catalog' as const },
    { title: 'Review Gallery', hint: 'Check albums, covers, and image framing quickly.', to: '/admin/gallery', icon: 'gallery' as const },
    { title: 'Check Users', hint: 'Inspect accounts, roles, and contact details.', to: '/admin/users', icon: 'users' as const },
    { title: 'Open Logs', hint: 'Follow updates, deletes, and admin activity.', to: '/admin/logs', icon: 'logs' as const },
  ]

  const catalogTone: 'good' | 'watch' | 'alert' =
    outOfStockParts > 0 ? 'alert' : hiddenPriceProducts > 0 ? 'watch' : 'good'
  const mediaTone: 'good' | 'watch' | 'alert' =
    emptyAlbums > 0 ? 'alert' : productsWithVideo < Math.ceil(products.length / 2) ? 'watch' : 'good'
  const accessTone: 'good' | 'watch' | 'alert' =
    admins.length === 0 || registeredUsersCount === 0 ? 'alert' : superAdmins === 1 ? 'watch' : 'good'

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title={`Dashboard, ${firstName}`}
        actions={
          <button
            onClick={() => refreshAll()}
            disabled={loading}
            className={cn(
              'inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition active:translate-y-[1px]',
              loading ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-[1px]',
              isDark
                ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)] hover:brightness-110'
                : 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 shadow-[0_10px_24px_-18px_rgba(34,211,238,0.2)] hover:bg-cyan-100'
            )}
          >
            <Icon name="spark" className="h-4 w-4" />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <Link key={card.label} to={card.to} className="block">
            <AdminStatCard
              label={card.label}
              value={card.value}
              accent={
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl',
                    isDark
                      ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(168,85,247,0.18))] text-cyan-200'
                      : 'bg-violet-50 text-violet-700'
                  )}
                >
                  <Icon name={card.icon} />
                </div>
              }
              className="transition hover:-translate-y-[1px]"
            />
          </Link>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        <div className="grid gap-3.5 2xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <div className="space-y-3.5">
            <SectionCard
              title="Quick Actions"
              subtitle="Start from the most common admin tasks without hunting through the navigation."
            >
              <div className="grid gap-2.5 md:grid-cols-2">
                {quickActions.map(action => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Reports"
              subtitle="Short operational reports so you can see what is healthy and what needs cleanup."
            >
              <div className="grid gap-2.5 xl:grid-cols-3">
                <ReportCard
                  title="Catalog Report"
                  tone={catalogTone}
                  metrics={[
                    { label: 'Products live', value: products.length },
                    { label: 'Featured products', value: featuredProducts },
                    { label: 'Hidden prices', value: hiddenPriceProducts },
                    { label: 'Out of stock parts', value: outOfStockParts },
                  ]}
                  footer={outOfStockParts > 0 ? 'Parts inventory needs review.' : 'Catalog structure looks stable.'}
                />

                <ReportCard
                  title="Media Report"
                  tone={mediaTone}
                  metrics={[
                    { label: 'Photos in gallery', value: totalPhotos },
                    { label: 'Products with video', value: `${productsWithVideo}/${products.length || 0}` },
                    { label: 'Customers with logo', value: `${customersWithLogo}/${customers.length || 0}` },
                    { label: 'Empty albums', value: emptyAlbums },
                  ]}
                  footer={emptyAlbums > 0 ? 'Some albums still need images.' : 'Media coverage is in good shape.'}
                />

                <ReportCard
                  title="Access Report"
                  tone={accessTone}
                  metrics={[
                    { label: 'Registered users', value: registeredUsersCount },
                    { label: 'Admins', value: admins.length },
                    { label: 'Super admins', value: superAdmins },
                    { label: 'Categories with image', value: `${categoriesWithImage}/${categories.length || 0}` },
                  ]}
                  footer={superAdmins <= 1 ? 'Access is working, but the admin layer is still thin.' : 'Access layer looks balanced.'}
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-3.5">
            <SectionCard
              title="Needs Attention"
              subtitle="These are the items most likely to require a manual pass next."
            >
              <div className="space-y-2.5">
                <AttentionRow title="Products missing public price" count={hiddenPriceProducts} to="/admin/products" />
                <AttentionRow title="Parts out of stock" count={outOfStockParts} to="/admin/parts" />
                <AttentionRow title="Customers without category" count={uncategorizedCustomers} to="/admin/customers" />
                <AttentionRow title="Gallery albums without photos" count={emptyAlbums} to="/admin/gallery" />
              </div>
            </SectionCard>

            <SectionCard
              title="Workspace Summary"
              subtitle="A simple readout of what the admin workspace currently manages."
            >
              <div className="space-y-2.5">
                {[
                  { icon: 'catalog' as const, label: 'Catalog items', value: products.length + parts.length },
                  { icon: 'media' as const, label: 'Media assets', value: totalPhotos + productsWithVideo },
                  { icon: 'partners' as const, label: 'Customer records', value: customers.length },
                  { icon: 'shield' as const, label: 'Access accounts', value: admins.length + registeredUsersCount },
                ].map(item => (
                  <div
                    key={item.label}
                    className={cn(
                      'flex items-center gap-3 rounded-[18px] px-3.5 py-3',
                      isDark ? 'bg-[#0d1430]/88 ring-1 ring-inset ring-cyan-400/10' : 'bg-gray-50/80 ring-1 ring-inset ring-gray-200'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        isDark ? 'bg-cyan-400/10 text-cyan-200' : 'bg-violet-50 text-violet-700'
                      )}
                    >
                      <Icon name={item.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                    <div className={cn('text-[11px]', isDark ? 'text-purple-100/64' : 'text-gray-500')}>{item.label}</div>
                    <div className={cn('mt-0.5 text-[13px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
