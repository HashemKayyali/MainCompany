/**
 * CAT-024 — base page atmosphere (VERBATIM port of the Vite AnimatedBackground
 * in its `lightweight` variant, as used by PageContainer). Pure CSS (white/
 * lavender wash + grid + radial glows + vignette), no sparkles/orbs, so it is a
 * static server component with zero client cost. Sits fixed behind the app.
 */
const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(124,58,237,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.035) 1px, transparent 1px)',
  backgroundSize: '128px 128px',
}

export function AnimatedBackground({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#fbf8ff]" />
      <div className="absolute inset-0 opacity-[0.55]" style={gridStyle} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(72% 44% at 12% -4%, rgba(124,58,237,0.16) 0%, transparent 70%), ' +
            'radial-gradient(58% 36% at 88% 14%, rgba(168,85,247,0.13) 0%, transparent 68%), ' +
            'radial-gradient(58% 40% at 52% 104%, rgba(217,70,239,0.10) 0%, transparent 72%), ' +
            'radial-gradient(48% 28% at 50% 50%, rgba(196,165,255,0.08) 0%, transparent 78%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 50%, rgba(124,58,237,0.04) 100%)',
        }}
      />
    </div>
  )
}
