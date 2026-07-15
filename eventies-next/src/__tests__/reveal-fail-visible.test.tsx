import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const motionState = vi.hoisted(() => ({ reduced: false }))

vi.mock('framer-motion', async () => {
  const React = await import('react')
  return {
    useReducedMotion: () => motionState.reduced,
    motion: {
      div: ({
        children,
        initial,
        whileInView,
        ...props
      }: {
        children: React.ReactNode
        initial?: { opacity?: number; y?: number }
        whileInView?: { opacity?: number; y?: number }
        [key: string]: unknown
      }) =>
        React.createElement(
          'div',
          {
            ...props,
            'data-initial-opacity': initial?.opacity,
            'data-final-opacity': whileInView?.opacity,
          },
          children
        ),
    },
  }
})

import { Reveal } from '@/components/ui/Reveal'

describe('Reveal fail-visible contract', () => {
  beforeEach(() => {
    motionState.reduced = false
  })

  it('keeps content opaque before IntersectionObserver enhancement', () => {
    const html = renderToStaticMarkup(<Reveal>Visible content</Reveal>)
    expect(html).toContain('data-initial-opacity="1"')
    expect(html).toContain('data-final-opacity="1"')
    expect(html).toContain('Visible content')
  })

  it('renders a plain visible wrapper when reduced motion is preferred', () => {
    motionState.reduced = true
    const html = renderToStaticMarkup(<Reveal>Reduced motion content</Reveal>)
    expect(html).not.toContain('data-initial-opacity')
    expect(html).toContain('Reduced motion content')
  })
})
