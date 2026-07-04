import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BidiTextProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  /**
   * 'auto'  — natural-language user/database content (product names,
   *           descriptions, notes): direction follows the content itself.
   * 'ltr'   — technical values (emails, slugs, URLs, SKUs, phone numbers,
   *           request numbers): always LTR regardless of UI language.
   */
  dir?: 'auto' | 'ltr'
}

/**
 * Shared bidi primitive for dynamic (user/database) content, used by both
 * the public site and the admin panel:
 * - `<bdi>` isolates the text so mixed Arabic/English never destabilises
 *   surrounding layout or punctuation order.
 * - `dir` keeps English content LTR inside RTL pages (and vice versa).
 * - `data-i18n-skip` opts the subtree out of the DOM translation bridge so
 *   database content is NEVER machine-translated as if it were UI copy.
 */
export default function BidiText({ children, dir = 'auto', className, ...props }: BidiTextProps) {
  return (
    <bdi dir={dir} data-i18n-skip className={cn('min-w-0', className)} {...props}>
      {children}
    </bdi>
  )
}
