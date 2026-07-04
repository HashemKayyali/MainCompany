import { Eye, Repeat, ShoppingBag, Star } from 'lucide-react'
import type { Product } from '../../../data/products/types'
import FramedImage from '../../../components/ui/FramedImage'
import AdminBadge from '../../../components/admin/primitives/AdminBadge'
import AdminButton from '../../../components/admin/primitives/AdminButton'
import AdminKebabMenu, { type AdminKebabItem } from '../../../components/admin/AdminKebabMenu'
import BidiText from '../../../components/admin/BidiText'
import { cn } from '../../../utils/cn'

type ProductAdminCardProps = {
  product: Product
  categoryName: string
  onDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

function Flag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      title={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
    >
      {icon}
    </span>
  )
}

/**
 * Compact, admin-oriented product card. Proportional 4:3 image, clamped copy,
 * clear status/price, and secondary actions tucked into a kebab menu so the
 * grid stays dense on desktop while remaining tappable on mobile.
 */
export default function ProductAdminCard({
  product,
  categoryName,
  onDetails,
  onEdit,
  onDelete,
}: ProductAdminCardProps) {
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceLabel = showRentalPrice ? 'Per Day' : 'Reviewed'
  const priceValue = showRentalPrice ? `${product.rentalPricePerDay} ${product.currency}` : 'On request'

  const kebabItems: AdminKebabItem[] = [
    { label: 'Edit', onSelect: onEdit },
    { label: 'Delete', onSelect: onDelete, tone: 'danger' as const },
  ]

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition hover:border-[var(--admin-accent)] hover:shadow-[0_16px_36px_-20px_rgba(89,23,196,0.28)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--admin-surface-2)]">
        {product.heroImage ? (
          <FramedImage
            media={product.heroImage}
            alt={product.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
            fallbackTransform={{ fit: 'cover' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--admin-text-muted)]">
            No image
          </div>
        )}

        {product.featured && (
          <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-[8px] bg-[var(--admin-accent)] px-2 py-1 text-[9.5px] font-bold text-white shadow-sm">
            <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            Featured
          </span>
        )}
        {product.badge && (
          <span className="absolute end-2 top-2 max-w-[60%] truncate rounded-[8px] bg-black/55 px-2 py-1 text-[9.5px] font-semibold text-white backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminBadge tone="accent">{categoryName}</AdminBadge>
          {product.showPrice === false && <AdminBadge tone="warning">Price hidden</AdminBadge>}
        </div>

        <div>
          <h3 className="line-clamp-1 text-start font-sans text-[0.98rem] font-bold leading-tight tracking-[-0.01em] text-[var(--admin-text)]">
            <BidiText>{product.name}</BidiText>
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.4em] text-start text-[11.5px] leading-[1.5] text-[var(--admin-text-muted)]">
            {product.shortDescription ? <BidiText>{product.shortDescription}</BidiText> : 'No short description yet.'}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-[var(--admin-border)] pt-2.5">
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
              {priceLabel}
            </div>
            <div className={cn('mt-0.5 truncate font-sans text-[1.02rem] font-black tracking-[-0.03em] text-[var(--admin-text)]', !showRentalPrice && 'text-[0.9rem]')}>
              {priceValue}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {product.rentalEnabled !== false && <Flag icon={<Repeat className="h-3.5 w-3.5" strokeWidth={2.2} />} label="Available for rental" />}
            {product.saleEnabled !== false && <Flag icon={<ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.2} />} label="Available for purchase quote" />}
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <AdminButton size="sm" onClick={onDetails} className="flex-1">
            <Eye className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
            Details
          </AdminButton>
          <AdminButton size="sm" variant="outline" onClick={onEdit} className="hidden flex-1 sm:inline-flex">
            Edit
          </AdminButton>
          <AdminKebabMenu items={kebabItems} label="More product actions" />
        </div>
      </div>
    </div>
  )
}
