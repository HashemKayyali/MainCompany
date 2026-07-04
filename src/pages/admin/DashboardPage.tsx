import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useUser } from '../../contexts/UserContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminBadge from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminSkeleton from '../../components/admin/primitives/AdminSkeleton'
import { cn } from '../../utils/cn'

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
  | 'check'

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
    case 'check':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function IconChip({ name, className }: { name: IconName; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]',
        className
      )}
    >
      <Icon name={name} className="h-6 w-6" />
    </div>
  )
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
  return (
    <section className={cn('admin-card p-3.5 md:p-4', className)}>
      <div className="mb-3">
        <h2 className="admin-section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] leading-5 text-[var(--admin-text-muted)]">{subtitle}</p>}
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
  return (
    <Link
      to={to}
      className="group flex min-h-[112px] flex-col gap-2.5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3.5 transition duration-200 hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface)]"
    >
      <div className="flex items-center justify-between">
        <IconChip name={icon} />
        <span className="text-[var(--admin-accent)] transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
          <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-[var(--admin-text)]">{title}</div>
        <div className="mt-0.5 text-[11px] leading-4 text-[var(--admin-text-muted)]">{hint}</div>
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
  const badgeTone = tone === 'good' ? 'success' : tone === 'watch' ? 'warning' : 'danger'
  const toneLabel = tone === 'good' ? 'Healthy' : tone === 'watch' ? 'Watch' : 'Needs action'

  return (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[13px] font-bold text-[var(--admin-text)]">{title}</div>
        <AdminBadge tone={badgeTone}>{toneLabel}</AdminBadge>
      </div>

      <div className="space-y-2">
        {metrics.map(metric => (
          <div
            key={metric.label}
            className="flex items-center justify-between gap-4 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5"
          >
            <span className="text-[11px] text-[var(--admin-text-muted)]">{metric.label}</span>
            <span className="text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">{metric.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-[var(--admin-accent)]">{footer}</div>
    </div>
  )
}

function AttentionRow({ title, count, to }: { title: string; count: number; to: string }) {
  const alert = count > 0

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5 transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface)]"
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
          alert
            ? 'bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)] text-[var(--admin-danger)]'
            : 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
        )}
      >
        <Icon name={alert ? 'warning' : 'spark'} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--admin-text)]">{title}</div>
        <div className="mt-0.5 text-[11px] text-[var(--admin-text-muted)]">
          {alert ? `${count} item${count !== 1 ? 's' : ''} need review` : 'Looks good'}
        </div>
      </div>

      <AdminBadge tone={alert ? 'danger' : 'success'} className="tabular-nums">
        {count}
      </AdminBadge>
      <Icon name="arrow" className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] rtl:rotate-180" />
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <AdminSkeleton className="h-7 w-48" />
        <AdminSkeleton className="h-10 w-32 rounded-[var(--admin-radius-sm)]" />
      </div>

      <div className="flex gap-3 overflow-hidden md:grid md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="admin-card min-w-[240px] shrink-0 p-4 md:min-w-0">
            <AdminSkeleton className="h-3.5 w-20" />
            <AdminSkeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-3.5 2xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-3.5">
          <div className="admin-card p-4">
            <AdminSkeleton className="h-5 w-32" />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminSkeleton key={index} className="h-28" />
              ))}
            </div>
          </div>
          <div className="admin-card p-4">
            <AdminSkeleton className="h-5 w-24" />
            <div className="mt-4 grid gap-2.5 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <AdminSkeleton key={index} className="h-40" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3.5">
          <div className="admin-card p-4">
            <AdminSkeleton className="h-5 w-32" />
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminSkeleton key={index} className="h-14" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { products, customers, galleryAlbums, parts, categories, loading, refreshAll } = useData()
  const { currentUser } = useUser()
  const { admins } = useAuth()
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
    { title: 'New Product', hint: 'Add a service to the catalog with media and pricing.', to: '/admin/products', icon: 'plus' as const },
    { title: 'View Requests', hint: 'Review rental and purchase quote activity.', to: '/admin/requests', icon: 'catalog' as const },
    { title: 'Categories', hint: 'Organise brands and category structure.', to: '/admin/categories', icon: 'gallery' as const },
    { title: 'Gallery', hint: 'Check albums, covers, and image framing.', to: '/admin/gallery', icon: 'media' as const },
  ]

  const catalogTone: 'good' | 'watch' | 'alert' =
    outOfStockParts > 0 ? 'alert' : hiddenPriceProducts > 0 ? 'watch' : 'good'
  const mediaTone: 'good' | 'watch' | 'alert' =
    emptyAlbums > 0 ? 'alert' : productsWithVideo < Math.ceil(products.length / 2) ? 'watch' : 'good'
  const accessTone: 'good' | 'watch' | 'alert' =
    admins.length === 0 || registeredUsersCount === 0 ? 'alert' : superAdmins === 1 ? 'watch' : 'good'

  const attentionItems = [
    { title: 'Products missing public price', count: hiddenPriceProducts, to: '/admin/products' },
    { title: 'Parts out of stock', count: outOfStockParts, to: '/admin/parts' },
    { title: 'Customers without category', count: uncategorizedCustomers, to: '/admin/customers' },
    { title: 'Gallery albums without photos', count: emptyAlbums, to: '/admin/gallery' },
  ]
  const totalAttention = attentionItems.reduce((sum, item) => sum + item.count, 0)

  const summaryItems = [
    { icon: 'catalog' as const, label: 'Catalog items', value: products.length + parts.length },
    { icon: 'media' as const, label: 'Media assets', value: totalPhotos + productsWithVideo },
    { icon: 'partners' as const, label: 'Customer records', value: customers.length },
    { icon: 'shield' as const, label: 'Access accounts', value: admins.length + registeredUsersCount },
  ]

  const initialLoading =
    loading && products.length === 0 && customers.length === 0 && categories.length === 0

  if (initialLoading) return <DashboardSkeleton />

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title={`Dashboard, ${firstName}`}
        actions={
          <AdminButton
            variant="outline"
            size="sm"
            loading={loading}
            onClick={() => refreshAll()}
          >
            {!loading && <Icon name="spark" className="h-4 w-4" />}
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </AdminButton>
        }
      />

      {/* Stat cards: horizontal snap strip on mobile, grid on md+ */}
      <div className="flex shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4">
        {statCards.map(card => (
          <Link key={card.label} to={card.to} className="block min-w-[240px] shrink-0 snap-start md:min-w-0">
            <AdminStatCard
              label={card.label}
              value={<span className="tabular-nums">{card.value}</span>}
              accent={<IconChip name={card.icon} />}
              className="h-full transition hover:-translate-y-[1px] hover:border-[var(--admin-accent)]"
            />
          </Link>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pe-0.5">
        <div className="grid gap-3.5 2xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <div className="space-y-3.5">
            <SectionCard
              title="Quick Actions"
              subtitle="Start from the most common admin tasks without hunting through the navigation."
            >
              <div className="grid grid-cols-2 gap-2.5">
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
              {totalAttention === 0 ? (
                <AdminEmptyState
                  icon={<Icon name="check" className="h-6 w-6" />}
                  title="All clear"
                  description="Nothing needs a manual pass right now."
                />
              ) : (
                <div className="space-y-2.5">
                  {attentionItems.map(item => (
                    <AttentionRow key={item.title} title={item.title} count={item.count} to={item.to} />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Workspace Summary"
              subtitle="A simple readout of what the admin workspace currently manages."
            >
              <div className="space-y-2.5">
                {summaryItems.map(item => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3.5 py-3"
                  >
                    <IconChip name={item.icon} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-[var(--admin-text-muted)]">{item.label}</div>
                      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">
                        {item.value}
                      </div>
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
