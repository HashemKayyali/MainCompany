import type { ElementType, ReactNode } from 'react'

/**
 * FOUND-023 — <Bidi>: the SCOPED reincarnation of the banned document-walker
 * direction heuristic (08 §Banned: applyNaturalTextDirections). Used ONLY
 * where mixed-direction content actually occurs: product names on AR pages,
 * chat bubbles, user-generated text. Inputs/textareas use dir="auto" directly.
 */

const RTL_CHARS = /[֐-׿؀-ۿ܀-ݏݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const LTR_CHARS = /[A-Za-zÀ-ɏ]/

/** First-strong-character detection (mirrors dir="auto" semantics, usable in logic). */
export function detectDirection(text: string): 'rtl' | 'ltr' | 'auto' {
  for (const ch of text) {
    if (RTL_CHARS.test(ch)) return 'rtl'
    if (LTR_CHARS.test(ch)) return 'ltr'
  }
  return 'auto'
}

export function Bidi({
  children,
  as: Tag = 'span',
  className,
}: {
  children: ReactNode
  as?: ElementType
  className?: string
}) {
  // dir="auto" + isolation keeps surrounding punctuation/numbers from being
  // reordered by the embedding paragraph — the browser applies first-strong
  // per element, which is exactly the legacy heuristic, scoped.
  return (
    <Tag dir="auto" className={className} style={{ unicodeBidi: 'isolate' }}>
      {children}
    </Tag>
  )
}
