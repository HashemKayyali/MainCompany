import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
type Theme = 'dark' | 'light'
interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean }
const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, isDark: true })
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('bl-theme', 'dark')
  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [setTheme])
  const value = useMemo(() => ({ theme, toggle, isDark: theme === 'dark' }), [theme, toggle])
  useEffect(() => { const r = document.documentElement; r.classList.remove('dark','light'); r.classList.add(theme); r.style.colorScheme = theme }, [theme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useTheme = () => useContext(Ctx)
