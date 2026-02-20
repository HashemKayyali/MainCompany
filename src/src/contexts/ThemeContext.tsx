import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
type Theme = 'dark' | 'light'
interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean }
const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, isDark: true })
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('bl-theme', 'dark')
  useEffect(() => { const r = document.documentElement; r.classList.remove('dark','light'); r.classList.add(theme); r.style.colorScheme = theme }, [theme])
  return <Ctx.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark'), isDark: theme === 'dark' }}>{children}</Ctx.Provider>
}
export const useTheme = () => useContext(Ctx)
