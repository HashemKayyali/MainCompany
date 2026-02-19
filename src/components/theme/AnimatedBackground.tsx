import { useTheme } from '../../contexts/ThemeContext'

export default function AnimatedBackground() {
  const { isDark } = useTheme()
  if (!isDark) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#f5f3ff]" />
        <div className="absolute inset-0 dot-pattern opacity-70" />
        <div className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] rounded-full bg-violet-200/25 blur-[160px] animate-aurora" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-pink-200/20 blur-[140px] animate-aurora" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-cyan-200/15 blur-[100px] animate-aurora" style={{ animationDelay: '-8s' }} />
        <div className="grain-overlay" />
      </div>
    )
  }
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-void-950" />
      <div className="star-field"><div className="layer s1" /><div className="layer s2" /></div>
      {/* Vibrant Aurora nebula clouds */}
      <div className="nebula animate-aurora" style={{ top: '-12%', left: '8%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 40%, transparent 65%)' }} />
      <div className="nebula animate-aurora" style={{ bottom: '-8%', right: '3%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.04) 40%, transparent 65%)', animationDelay: '-4s' }} />
      <div className="nebula animate-aurora" style={{ top: '35%', left: '55%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, rgba(6,182,212,0.03) 40%, transparent 65%)', animationDelay: '-8s' }} />
      <div className="nebula animate-aurora" style={{ top: '60%', left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 40%, transparent 65%)', animationDelay: '-6s' }} />
      <div className="nebula animate-aurora" style={{ top: '15%', right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 60%)', animationDelay: '-10s' }} />
      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-purple-500/[0.04] animate-orbit" style={{ animationDuration: '50s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-400/[0.05] animate-orbit" style={{ animationDuration: '35s', animationDirection: 'reverse' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-pink-400/[0.04] animate-orbit" style={{ animationDuration: '25s' }} />
      {/* Grain */}
      <div className="grain-overlay" />
    </div>
  )
}
