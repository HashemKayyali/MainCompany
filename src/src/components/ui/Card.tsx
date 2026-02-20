import { useTheme } from '../../contexts/ThemeContext'
export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isDark } = useTheme()
  return <div className={`card-surface ${className}`}>{children}</div>
}
