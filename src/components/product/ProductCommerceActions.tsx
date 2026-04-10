import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, FileText, MessageCircle, Check, X, ArrowRight } from 'lucide-react'
import type { Product } from '../../data/products/types'
import { usePurchaseQuote } from '../../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../../contexts/RentalCartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import Modal from '../ui/Modal'
import { cn } from '../../utils/cn'

const ProductCommerceActions = memo(function ProductCommerceActions({
  product,
  variant = 'card',
  showContactLink = false,
}: {
  product: Product
  variant?: 'card' | 'detail'
  showContactLink?: boolean
}) {
  const { isDark } = useTheme()
  const { toast } = useToast()
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

  // ── Detail variant button classes (unchanged) ──────────────────────────────
  const detailClass = {
    primary: 'btn-primary !block !w-full !rounded-[14px] !text-center !text-[12px] sm:!text-[12.5px]',
    secondary: 'btn-outline !block !w-full !rounded-[14px] !text-center !text-[12px] sm:!text-[12.5px]',
  }

  // ── Cart actions ────────────────────────────────────────────────────────────
  const addToRentalCart = () => {
    rentalCart.addProduct(product, 1)
    toast(`${product.name} added to rental cart.`, 'success')
  }

  const removeFromRentalCart = () => {
    rentalCart.removeItem(product.slug)
    toast(`${product.name} removed from rental cart.`, 'success')
  }

  const resetDraftModal = () => {
    setModalOpen(false)
    setQuantity(1)
    setNote('')
  }

  const addToPurchaseDraft = () => {
    purchaseQuote.addProduct(product, quantity, note)
    toast(`${product.name} saved to your purchase quote draft on this device.`, 'success')
    resetDraftModal()
  }

  const addAndReviewDraft = () => {
    purchaseQuote.addProduct(product, quantity, note)
    toast(`${product.name} saved. Opening your purchase quote draft.`, 'success')
    resetDraftModal()
  }

  if (!rentalEnabled && !saleEnabled && !showContactLink) return null

  // ── DETAIL VARIANT (unchanged layout, just kept as-is) ────────────────────
  if (variant === 'detail') {
    return (
      <>
        <div className="space-y-1.5">
          <div className={cn(
            'grid gap-2',
            rentalEnabled && saleEnabled ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          )}>
            {rentalEnabled && (
              <button type="button" onClick={addToRentalCart} className={detailClass.primary}>
                <ShoppingCart size={15} className="inline mr-1.5" />
                Add to Rental Cart
              </button>
            )}
            {saleEnabled && (
              <button type="button" onClick={() => setModalOpen(true)} className={detailClass.secondary}>
                <FileText size={15} className="inline mr-1.5" />
                Request Purchase Quote
              </button>
            )}
          </div>

          <div className={cn(
            'rounded-[14px] px-4 py-3 text-[11.5px] leading-5',
            isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-violet-50 text-gray-600'
          )}>
            Rental requests are priced per day and reviewed by the team before confirmation. Purchase quotes stay separate and do not reserve rental stock.
          </div>

          {showContactLink && (
            <Link to={`/contact?product=${product.slug}`} className={detailClass.secondary}>
              <MessageCircle size={15} className="inline mr-1.5" />
              General Inquiry
            </Link>
          )}
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Purchase Quote for ${product.name}`} size="md">
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
          />
        </Modal>
      </>
    )
  }

  // ── CARD VARIANT (redesigned) ─────────────────────────────────────────────
  return (
    <>
      <div className="space-y-1.5">

        {/* ── Row 1: Rental cart action ── */}
        {rentalEnabled && (
          <div className={cn('grid gap-1.5', isInRentalCart ? 'grid-cols-2' : 'grid-cols-1')}>
            {isInRentalCart ? (
              <>
                {/* Added state */}
                <button
                  type="button"
                  disabled
                  className={cn(
                    'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[13px] px-3 py-2 text-[10.5px] font-bold transition-all duration-300',
                    isDark
                      ? 'border border-emerald-500/30 bg-emerald-500/12 text-emerald-400'
                      : 'border border-emerald-400/40 bg-emerald-50 text-emerald-700'
                  )}
                >
                  <Check size={12} strokeWidth={2.5} />
                  Added
                </button>

                {/* Remove state */}
                <button
                  type="button"
                  onClick={removeFromRentalCart}
                  className={cn(
                    'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[13px] px-3 py-2 text-[10.5px] font-bold transition-all duration-300',
                    isDark
                      ? 'border border-red-500/22 bg-red-500/8 text-red-400 hover:border-red-500/38 hover:bg-red-500/14'
                      : 'border border-red-300/60 bg-red-50 text-red-600 hover:bg-red-100'
                  )}
                >
                  <X size={12} strokeWidth={2.5} />
                  Remove
                </button>
              </>
            ) : (
              /* Add to Cart */
              <button
                type="button"
                onClick={addToRentalCart}
                className={cn(
                  'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[13px] px-3 py-2 text-[10.75px] font-bold transition-all duration-300',
                  isDark
                    ? 'bg-[linear-gradient(135deg,#1cc4ff_0%,#4f5fff_26%,#8b5cf6_64%,#ec4899_100%)] text-white shadow-[0_12px_32px_-10px_rgba(76,29,149,0.38)] hover:shadow-[0_16px_38px_-10px_rgba(76,29,149,0.48)] hover:brightness-105'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_10px_26px_-8px_rgba(124,58,237,0.3)] hover:brightness-105'
                )}
              >
                <ShoppingCart size={12} />
                Add to Cart
              </button>
            )}
          </div>
        )}

        {/* ── Row 2: Details + optional Quote ── */}
        <div className={cn(
          'grid gap-1.5',
          saleEnabled ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          <Link
            to={`/products/${product.slug}`}
            className={cn(
              'inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] px-3 py-1.5 text-[10.5px] font-semibold transition-all duration-300',
              isDark
                ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-violet-400/22 hover:bg-white/[0.08] hover:text-white/90'
                : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60 hover:bg-violet-50/60 hover:text-violet-700'
            )}
          >
            Details
            <ArrowRight size={11} />
          </Link>

          {saleEnabled && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={cn(
                'inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] px-3 py-1.5 text-[10.5px] font-semibold transition-all duration-300',
                isDark
                  ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-cyan-400/22 hover:bg-white/[0.08] hover:text-white/90'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60 hover:bg-violet-50/60 hover:text-violet-700'
              )}
            >
              <FileText size={11} />
              Quote
            </button>
          )}
        </div>

        {showContactLink && (
          <Link
            to={`/contact?product=${product.slug}`}
            className={cn(
              'inline-flex w-full min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] px-3 py-1.5 text-[10.5px] font-semibold transition-all duration-300',
              isDark
                ? 'border border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-violet-400/22 hover:bg-white/[0.08]'
                : 'border border-slate-200/80 bg-white text-slate-600 hover:border-violet-300/60'
            )}
          >
            <MessageCircle size={11} />
            Inquiry
          </Link>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Purchase Quote for ${product.name}`} size="md">
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
}) {
  return (
    <div className="space-y-4">
      <div className={cn('rounded-[18px] border p-3.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50')}>
        <div className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{product.name}</div>
        <div className={cn('mt-1.5 text-[12px] leading-5', isDark ? 'text-purple-100/65' : 'text-gray-500')}>
          Add this item to your multi-product purchase quote draft. Drafts are saved locally on this device until you send them, then they appear in My Requests.
        </div>
      </div>

      {productAlreadyInDraft && (
        <div className={cn('rounded-[15px] px-3.5 py-2.5 text-[11.5px] leading-5', isDark ? 'bg-fuchsia-500/10 text-fuchsia-100/82' : 'bg-fuchsia-50 text-fuchsia-700')}>
          This product is already in your draft. Adding it again will increase the quantity and keep your latest note.
        </div>
      )}

      <div>
        <label className={cn('mb-1.5 block text-[13px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
          Quantity
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
          Item Note
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note for your sales team..."
          className="form-field resize-none"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          to="/purchase-quote"
          className="btn-outline !w-full !rounded-[14px] !px-4 !py-2 !text-[11.5px] sm:!w-auto"
          onClick={addAndReviewDraft}
        >
          Add &amp; Review Draft
        </Link>
        <button type="button" onClick={addToPurchaseDraft} className="btn-primary !w-full !rounded-[14px] !px-4 !py-2 !text-[11.5px] sm:!w-auto">
          Save to Draft
        </button>
      </div>
    </div>
  )
}
