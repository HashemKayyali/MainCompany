// @vitest-environment jsdom
import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { APP_ROUTE_CHANGE_EVENT } from '../../utils/route-lifecycle'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}))

vi.mock('../LanguageContext', () => ({
  useI18n: () => ({
    dir: 'ltr',
    t: (value: string) => value,
    translateText: (value: string) => value,
  }),
}))

import { DialogProvider, useDialog } from '../DialogContext'

describe('DialogProvider route lifecycle', () => {
  let container: HTMLDivElement
  let root: Root
  let confirmDialog!: ReturnType<typeof useDialog>['confirm']
  let scrollTo: ReturnType<typeof vi.spyOn>

  function Harness() {
    const { confirm } = useDialog()
    useEffect(() => {
      confirmDialog = confirm
    }, [confirm])
    return null
  }

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    await act(async () => {
      root.render(
        <DialogProvider>
          <Harness />
        </DialogProvider>
      )
    })
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    scrollTo.mockRestore()
    document.documentElement.removeAttribute('data-scroll-locked')
    document.documentElement.removeAttribute('style')
    document.body.removeAttribute('style')
  })

  it('resolves a pending confirm as false and removes the overlay on route change', async () => {
    let result: Promise<boolean>
    await act(async () => {
      result = confirmDialog({ title: 'Delete request?', message: 'This cannot be undone.' })
    })

    expect(document.body.textContent).toContain('Delete request?')

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(APP_ROUTE_CHANGE_EVENT, {
          detail: {
            from: { pathname: '/', search: '', hash: '', key: 'home' },
            to: { pathname: '/products', search: '', hash: '', key: 'products' },
          },
        })
      )
    })

    await expect(result!).resolves.toBe(false)
  })
})
