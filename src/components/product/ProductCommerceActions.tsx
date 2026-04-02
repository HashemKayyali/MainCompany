import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, FileText, MessageCircle } from 'lucide-react'
import type { Product } from '../../data/products/types'
import { usePurchaseQuote } from '../../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../../contexts/RentalCartContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import Modal from '../ui/Modal'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function ProductCommerceActions({
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
  const productAlreadyInDraft = purchaseQuote.items.some(item => item.productSlug === product.slug)

  const buttonClass = useMemo(
    () =>
      variant === 'detail'
        ? {
            primary: 'btn-primary !block !w-full !rounded-xl !text-center !text-[11.5px] sm:!text-[12px]',
            secondary: 'btn-outline !block !w-full !rounded-xl !text-center !text-[11.5px] sm:!text-[12px]',
          }
        : {
            primary: cn(
              'inline-flex min-h-[35px] items-center justify-center gap-1.25 rounded-[12px] px-2.75 py-1.75 text-[9.5px] font-semibold transition-all duration-300',
              isDark
                ? 'bg-[linear-gradient(135deg,#1cc4ff_0%,#4f5fff_26%,#8b5cf6_64%,#ec4899_100%)] text-white shadow-[0_14px_36px_rgba(76,29,149,0.34)] hover:brightness-105'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)] hover:brightness-105'
            ),
            secondary: cn(
              'inline-flex min-h-[35px] items-center justify-center gap-1.25 rounded-[12px] px-2.75 py-1.75 text-[9.5px] font-semibold transition-all duration-300',
              isDark
                ? 'border border-white/[0.10] bg-white/[0.05] text-slate-100/86 hover:border-cyan-300/24 hover:bg-white/[0.09]'
                : 'border border-white/80 bg-white/70 text-slate-700 hover:border-violet-300 hover:bg-white'
            ),
          },
    [isDark, variant]
  )

  const addToRentalCart = () => {
    rentalCart.addProduct(product, 1)
    toast(`${product.name} added to rental cart.`, 'success')
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

  return (
    <>
      <div className={cn('space-y-1.5', variant === 'card' && 'pt-0.25')}>
        <div
          className={cn(
            'grid gap-1.5',
            rentalEnabled && saleEnabled ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          )}
        >
          {rentalEnabled && (
            <button type="button" onClick={addToRentalCart} className={buttonClass.primary}>
              <ShoppingCart size={variant === 'detail' ? 15 : 12} />
              Add to Rental Cart
            </button>
          )}

          {saleEnabled && (
            <button type="button" onClick={() => setModalOpen(true)} className={buttonClass.secondary}>
              <FileText size={variant === 'detail' ? 15 : 12} />
              Request Purchase Quote
            </button>
          )}
        </div>

        {variant === 'detail' && (
          <div className={cn('rounded-xl px-3.5 py-2.5 text-[11px]', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-violet-50 text-gray-600')}>
            Rental requests are priced per day and reviewed by the team before confirmation. Purchase quotes stay separate and do not reserve rental stock.
          </div>
        )}

        {showContactLink && (
          <Link to={`/contact?product=${product.slug}`} className={buttonClass.secondary}>
            <MessageCircle size={variant === 'detail' ? 15 : 12} />
            General Inquiry
          </Link>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Purchase Quote for ${product.name}`} size="md">
        <div className="space-y-3.5">
          <div className={cn('rounded-[16px] border p-3', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50')}>
            <div className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{product.name}</div>
            <div className={cn('mt-1 text-[11px] leading-5', isDark ? 'text-purple-100/65' : 'text-gray-500')}>
              Add this item to your multi-product purchase quote draft. Drafts are saved locally on this device until you send them, then they appear in My Requests.
            </div>
          </div>

          {productAlreadyInDraft && (
            <div className={cn('rounded-[15px] px-3 py-2.25 text-[10.5px]', isDark ? 'bg-fuchsia-500/10 text-fuchsia-100/82' : 'bg-fuchsia-50 text-fuchsia-700')}>
              This product is already in your draft. Adding it again will increase the quantity and keep your latest note.
            </div>
          )}

          <div>
            <label className={cn('mb-1.25 block text-[11.5px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={event => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="form-field"
            />
          </div>

          <div>
            <label className={cn('mb-1.25 block text-[11.5px] font-medium', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
              Item Note
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder="Optional note for your sales team..."
              className="form-field resize-none"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-1.75">
            <Link
              to="/purchase-quote"
              className="btn-outline !rounded-xl !px-3.5 !py-1.75 !text-[11px]"
              onClick={addAndReviewDraft}
            >
              Add &amp; Review Draft
            </Link>
            <button type="button" onClick={addToPurchaseDraft} className="btn-primary !rounded-xl !px-3.5 !py-1.75 !text-[11px]">
              Save to Draft
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
