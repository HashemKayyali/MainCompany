import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, FileText, MessageCircle, X, ArrowRight } from 'lucide-react'
import type { Product } from '../../data/products/types'
import { usePurchaseQuote } from '../../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../../contexts/RentalCartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useI18n } from '../../contexts/LanguageContext'
import Modal from '../ui/Modal'
import { cn } from '../../utils/cn'

const ProductCommerceActions = memo(function ProductCommerceActions({
  product,
  variant = 'card',
  showContactLink = false,
  compact = false,
}: {
  product: Product
  variant?: 'card' | 'detail'
  showContactLink?: boolean
  compact?: boolean
}) {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const { t, dir, translateText } = useI18n()
  const rentalCart = useRentalCart()
  const purchaseQuote = usePurchaseQuote()
  const [modalOpen, setModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  const rentalEnabled = product.rentalEnabled !== false
  const saleEnabled = product.saleEnabled !== false
  const isInRentalCart = useMemo(
    () => rentalCart.items.some(item => item.productSlug === product.slug),
    [rentalCart.items, product.slug]
  )
  const productAlreadyInDraft = useMemo(
    () => purchaseQuote.items.some(item => item.productSlug === product.slug),
    [purchaseQuote.items, product.slug]
  )

  // ── Detail variant button classes ──────────────────────────────────────────
  const detailClass = {
    primary:
      'btn-primary !inline-flex !min-h-[44px] !w-full !min-w-0 !items-center !justify-center !gap-2 !whitespace-normal !rounded-[13px] !px-4 !py-2.5 !text-center !text-[12px] !font-bold !leading-snug !tracking-normal',
    secondary:
      'btn-outline !inline-flex !min-h-[44px] !w-full !min-w-0 !items-center !justify-center !gap-2 !whitespace-normal !rounded-[13px] !px-4 !py-2.5 !text-center !text-[12px] !font-bold !leading-snug !tracking-normal',
    remove: cn(
      'inline-flex min-h-[44px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-[13px] px-4 py-2.5 text-center text-[12px] font-bold leading-snug transition-all duration-300',
      isDark
        ? 'border border-red-500/25 bg-red-500/[0.08] text-red-300 hover:border-red-500/40 hover:bg-red-500/[0.15]'
        : 'border border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100'
    ),
  }

  // ── Request draft actions ──────────────────────────────────────────────────
  const addToRentalCart = () => {
    rentalCart.addProduct(product, 1)
    toast(t('{service} added to your rental request draft.', { service: product.name }), 'success')
  }

  const removeFromRentalCart = () => {
    rentalCart.removeItem(product.slug)
    toast(t('{service} removed from your rental request draft.', { service: product.name }), 'success')
  }

  const resetDraftModal = () => {
    setModalOpen(false)
    setQuantity(1)
    setNote('')
  }

  const addToPurchaseDraft = () => {
    purchaseQuote.addProduct(product, quantity, note)
    toast(t('{service} saved to your purchase quote request draft.', { service: product.name }), 'success')
    resetDraftModal()
  }

  const addAndReviewDraft = () => {
    purchaseQuote.addProduct(product, quantity, note)
    toast(t('{service} saved. Opening your purchase quote request draft.', { service: product.name }), 'success')
    resetDraftModal()
  }

  if (!rentalEnabled && !saleEnabled && !showContactLink) return null

  // ── DETAIL VARIANT (unchanged layout, just kept as-is) ────────────────────
  if (variant === 'detail') {
    return (
      <>
        <div className="space-y-2">
          {rentalEnabled && (
            isInRentalCart ? (
              <button type="button" onClick={removeFromRentalCart} className={detailClass.remove}>
                <X size={13} strokeWidth={2.5} className="shrink-0" />
                <span className="min-w-0">{translateText('Remove from Rental Request')}</span>
              </button>
            ) : (
              <button type="button" onClick={addToRentalCart} className={detailClass.primary}>
                <ShoppingCart size={13} className="shrink-0" />
                <span className="min-w-0">{translateText('Add to Rental Request')}</span>
              </button>
            )
          )}
          {saleEnabled && (
            <button type="button" onClick={() => setModalOpen(true)} className={detailClass.secondary}>
              <FileText size={13} className="shrink-0" />
              <span className="min-w-0">{translateText('Request a Purchase Quote')}</span>
            </button>
          )}

          {showContactLink && (
            <Link to={`/contact?product=${product.slug}`} className={detailClass.secondary}>
              <MessageCircle size={13} className="shrink-0" />
              <span className="min-w-0">{translateText('Ask About This Service')}</span>
            </Link>
          )}
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={dir === 'rtl' ? `${translateText('Purchase Quote Request')} — ⁦${product.name}⁩` : `Purchase Quote Request for ${product.name}`} size="md">
          <PurchaseQuoteModalBody
            product={product}
            isDark={isDark}
            productAlreadyInDraft={productAlreadyInDraft}
            quantity={quantity}
            setQuantity={setQuantity}
            note={note}
            setNote={setNote}
            addToPurchaseDraft={addToPurchaseDraft}
            addAndReviewDraft={addAndReviewDraft}
            onClose={() => setModalOpen(false)}
            translateText={translateText}
          />
        </Modal>
      </>
    )
  }

  // ── CARD VARIANT (redesigned) ─────────────────────────────────────────────
  const cardStackClass = compact ? 'space-y-1' : 'space-y-1.5'
  const cardGridGapClass = compact ? 'gap-1' : 'gap-1.5'
  const cardPrimaryButtonClass = compact
    ? 'inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[11px] px-2.5 py-1.5 text-[9.75px] font-bold transition-all duration-300'
    : 'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[13px] px-3 py-2 text-[10.75px] font-bold transition-all duration-300'
  const cardSecondaryButtonClass = compact
    ? 'inline-flex min-h-[31px] items-center justify-center gap-1.5 rounded-[10px] px-2.5 py-1 text-[9.75px] font-semibold transition-all duration-300'
    : 'inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] px-3 py-1.5 text-[10.5px] font-semibold transition-all duration-300'
  const primaryIconSize = compact ? 11 : 12
  const secondaryIconSize = compact ? 10 : 11

  return (
    <>
      <div className={cardStackClass}>

        {/* ── Row 1: Rental request draft toggle ── */}
        {rentalEnabled && (
          isInRentalCart ? (
            <button
              type="button"
              onClick={removeFromRentalCart}
              className={cn(
                'w-full',
                cardPrimaryButtonClass,
                isDark
                  ? 'border border-red-500/22 bg-red-500/8 text-red-400 hover:border-red-500/38 hover:bg-red-500/14'
                  : 'border border-red-300/60 bg-red-50 text-red-600 hover:bg-red-100'
              )}
            >
              <X size={primaryIconSize} strokeWidth={2.5} />
              {translateText('Remove from Rental Request')}
            </button>
          ) : (
            <button
              type="button"
              onClick={addToRentalCart}
              className={cn(
                'w-full',
                cardPrimaryButtonClass,
                isDark
                  ? 'bg-[linear-gradient(135deg,#1cc4ff_0%,#4f5fff_26%,#8b5cf6_64%,#ec4899_100%)] text-white shadow-[0_12px_32px_-10px_rgba(76,29,149,0.38)] hover:shadow-[0_16px_38px_-10px_rgba(76,29,149,0.48)] hover:brightness-105'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_10px_26px_-8px_rgba(124,58,237,0.3)] hover:brightness-105'
              )}
            >
              <ShoppingCart size={primaryIconSize} />
              {translateText('Add to Rental Request')}
            </button>
          )
        )}

        {/* ── Row 2: Details + optional Quote ── */}
        <div className={cn(
          'grid',
          cardGridGapClass,
          saleEnabled ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          <Link
            to={`/products/${product.slug}`}
            className={cn(
              cardSecondaryButtonClass,
              isDark
                ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-violet-400/22 hover:bg-white/[0.08] hover:text-white/90'
                : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60 hover:bg-violet-50/60 hover:text-violet-700'
            )}
          >
            {translateText('Service Details')}
            <ArrowRight size={secondaryIconSize} />
          </Link>

          {saleEnabled && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={cn(
                cardSecondaryButtonClass,
                isDark
                  ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-cyan-400/22 hover:bg-white/[0.08] hover:text-white/90'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60 hover:bg-violet-50/60 hover:text-violet-700'
              )}
            >
              <FileText size={secondaryIconSize} />
              {translateText('Request a Purchase Quote')}
            </button>
          )}
        </div>

        {showContactLink && (
          <Link
            to={`/contact?product=${product.slug}`}
            className={cn(
              'w-full',
              cardSecondaryButtonClass,
              isDark
                ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-violet-400/22 hover:bg-white/[0.08]'
                : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60'
            )}
          >
            <MessageCircle size={secondaryIconSize} />
            {translateText('Ask')}
          </Link>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={dir === 'rtl' ? `${translateText('Purchase Quote Request')} — ⁦${product.name}⁩` : `Purchase Quote Request for ${product.name}`} size="md">
        <PurchaseQuoteModalBody
          product={product}
          isDark={isDark}
          productAlreadyInDraft={productAlreadyInDraft}
          quantity={quantity}
          setQuantity={setQuantity}
          note={note}
          setNote={setNote}
          addToPurchaseDraft={addToPurchaseDraft}
          addAndReviewDraft={addAndReviewDraft}
          onClose={() => setModalOpen(false)}
          translateText={translateText}
        />
      </Modal>
    </>
  )
})

export default ProductCommerceActions

// ── Extracted modal body to avoid duplication ────────────────────────────────
function PurchaseQuoteModalBody({
  product,
  isDark,
  productAlreadyInDraft,
  quantity,
  setQuantity,
  note,
  setNote,
  addToPurchaseDraft,
  addAndReviewDraft,
  onClose,
  translateText,
}: {
  product: Product
  isDark: boolean
  productAlreadyInDraft: boolean
  quantity: number
  setQuantity: (n: number) => void
  note: string
  setNote: (s: string) => void
  addToPurchaseDraft: () => void
  addAndReviewDraft: () => void
  onClose: () => void
  translateText: (value: string) => string
}) {
  return (
    <div className="space-y-4">
      <div className={cn('rounded-[18px] border p-3.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50')}>
        <div dir="ltr" lang="en" className={cn('product-data-ltr text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{product.name}</div>
        <div className={cn('mt-1.5 text-[12px] leading-5', isDark ? 'text-purple-100/65' : 'text-gray-500')}>
          {translateText('Add this service to your purchase quote request draft. Drafts are saved locally on this device until you submit them, then they appear in My Requests.')}
        </div>
      </div>

      {productAlreadyInDraft && (
        <div className={cn('rounded-[15px] px-3.5 py-2.5 text-[11.5px] leading-5', isDark ? 'bg-fuchsia-500/10 text-fuchsia-100/82' : 'bg-fuchsia-50 text-fuchsia-700')}>
          {translateText('This service is already in your draft. Adding it again will increase the quantity and keep your latest note.')}
        </div>
      )}

      <div>
        <label className={cn('mb-1.5 block text-[13px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
          {translateText('Quantity')}
        </label>
        <input
          type="number"
          min={1}
          max={999}
          value={quantity}
          onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="form-field"
        />
      </div>

      <div>
        <label className={cn('mb-1.5 block text-[13px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
          {translateText('Service Note')}
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={translateText('Optional note for the Eventies team...')}
          className="form-field resize-none"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          to="/purchase-quote"
          className="btn-outline !w-full !rounded-[14px] !px-4 !py-2 !text-[11.5px] sm:!w-auto"
          onClick={addAndReviewDraft}
        >
          {translateText('Review Purchase Quote Request')}
        </Link>
        <button type="button" onClick={addToPurchaseDraft} className="btn-primary !w-full !rounded-[14px] !px-4 !py-2 !text-[11.5px] sm:!w-auto">
          {translateText('Save to Purchase Quote Draft')}
        </button>
      </div>
    </div>
  )
}
