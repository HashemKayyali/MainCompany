import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

type Theme = 'light'
interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean }

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {}, isDark: false })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ThemeCtx>(() => ({ theme: 'light', toggle: () => {}, isDark: false }), [])
  useEffect(() => {
    const r = document.documentElement
    r.classList.remove('dark')
    r.classList.add('light')
    r.style.colorScheme = 'light'
  }, [])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
