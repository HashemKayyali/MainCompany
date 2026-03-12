import { useTheme } from '../../contexts/ThemeContext'
export default function Chip({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const { isDark } = useTheme()
  return <button type="button" onClick={onClick} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${active ? isDark ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40' : 'bg-violet-50 text-violet-700 border border-violet-200' : isDark ? 'bg-purple-500/[0.07] text-purple-200/70 hover:text-purple-100/90 border border-purple-500/20' : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'}`}>{children}</button>
}
