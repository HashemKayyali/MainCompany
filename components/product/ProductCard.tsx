import { useRef, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Play, Star, Tag, Zap, Eye } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'

/* ── helpers ── */
const toThumb = (u: string) => (u?.includes('-hero.webp') ? u.replace('-hero.webp', '-thumb.webp') : u)
const toPoster = (u: string) => (u?.includes('-hero.webp') ? u.replace('-hero.webp', '-poster.webp') : toThumb(u))
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isDark } = useTheme()
  const motion_ = useMotionEnabled()
  const navigate = useNavigate()

  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isHover, setIsHover] = useState(false)

  const hasVideo = !!product.videoUrl
  const allowFancy = motion_ && !prefersReducedMotion()

  /* ─────────────────────────────
     3D tilt + spotlight follow
     ───────────────────────────── */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 180, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 180, damping: 18 })

  const spX = useSpring(useTransform(mx, [0, 1], ['0%', '100%']), { stiffness: 140, damping: 20 })
  const spY = useSpring(useTransform(my, [0, 1], ['0%', '100%']), { stiffness: 140, damping: 20 })

  const onMove = (e: React.MouseEvent) => {
    if (!allowFancy || isMobile()) return
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    mx.set(x)
    my.set(y)
  }

  const resetTilt = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  useEffect(() => {
    resetTilt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─────────────────────────────
     IntersectionObserver — mobile autoplay
     ───────────────────────────── */
  useEffect(() => {
    if (!hasVideo || !cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (!v) return

        // احترام reduce motion
        if (prefersReducedMotion()) return

        if (entry.isIntersecting && isMobile()) {
          v.currentTime = 0
          v.play().catch(() => {})
          setIsPlaying(true)
        } else if (!entry.isIntersecting) {
          v.pause()
          v.currentTime = 0
          setIsPlaying(false)
        }
      },
      { threshold: 0.55 }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [hasVideo])

  /* ─────────────────────────────
     Desktop hover video
     ───────────────────────────── */
  const onEnter = () => {
    setIsHover(true)
    if (isMobile()) return
    if (prefersReducedMotion()) return
    const v = videoRef.current
    if (!v || !hasVideo) return
    v.currentTime = 0
    v.play().catch(() => {})
    setIsPlaying(true)
  }

  const onLeave = () => {
    setIsHover(false)
    if (isMobile()) return
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
    setIsPlaying(false)
    resetTilt()
  }

  const go = () => navigate(`/products/${product.slug}`)

  /* ── neon colors (a touch more premium) ── */
  const neonA = 'rgba(99,102,241,0.65)' // indigo
  const neonB = 'rgba(34,211,238,0.55)' // cyan
  const neonC = 'rgba(168,85,247,0.55)' // purple

  /* ── computed classes for readability ── */
  const surface = useMemo(() => {
    if (isDark) {
      return 'bg-[#07061a]/85 backdrop-blur-2xl'
    }
    return 'bg-white/95 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-violet-200/40'
  }, [isDark])

  const titleColor = isDark ? 'text-white group-hover:text-indigo-100' : 'text-gray-900 group-hover:text-violet-700'
  const descColor = isDark ? 'text-indigo-100/60' : 'text-gray-500'
  const subtleMono = isDark ? 'text-cyan-300/55' : 'text-gray-400'

  return (
    <motion.div
      className="h-full"
      initial={allowFancy ? { opacity: 0, y: 26 } : false}
      whileInView={allowFancy ? { opacity: 1, y: 0 } : undefined}
      viewport={allowFancy ? { once: true, margin: '-40px' } : undefined}
      transition={allowFancy ? { duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      <motion.div
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onMouseMove={onMove}
        style={
          allowFancy && !isMobile()
            ? ({
                rotateX: rx,
                rotateY: ry,
                transformStyle: 'preserve-3d',
              } as any)
            : undefined
        }
        className={`
          pc group relative rounded-[22px] overflow-hidden h-full flex flex-col
          transition-all duration-500 will-change-transform
          hover:-translate-y-3
          focus-within:-translate-y-2
          ${surface}
        `}
      >
        {/* ══════════ premium border + glow layers ══════════ */}
        {isDark ? (
          <>
            <div
              className="absolute inset-0 rounded-[22px] pointer-events-none z-0"
              style={{ border: '1px solid rgba(99,102,241,0.16)' }}
            />
            <div
              className="pc-neon absolute -inset-[1.5px] rounded-[24px] pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `conic-gradient(from var(--neon-angle, 220deg), ${neonA}, ${neonB}, ${neonC}, ${neonA})`,
                filter: 'blur(16px)',
              }}
            />
            <div
              className="absolute inset-0 rounded-[22px] pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                border: '1px solid rgba(99,102,241,0.48)',
                boxShadow: `0 0 22px ${neonA}, inset 0 0 22px rgba(99,102,241,0.06)`,
              }}
            />

            {/* spotlight that follows cursor */}
            {allowFancy && !isMobile() && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background: `radial-gradient(600px circle at ${spX.get()} ${spY.get()}, rgba(99,102,241,0.16), transparent 55%)`,
                  opacity: isHover ? 1 : 0,
                  transition: 'opacity 240ms ease',
                }}
              />
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 rounded-[22px] pointer-events-none z-0 border border-violet-200/60 group-hover:border-violet-300 transition-colors duration-500" />
            {allowFancy && !isMobile() && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background: `radial-gradient(520px circle at ${spX.get()} ${spY.get()}, rgba(139,92,246,0.14), transparent 60%)`,
                  opacity: isHover ? 1 : 0,
                  transition: 'opacity 240ms ease',
                }}
              />
            )}
          </>
        )}

        {/* Inner reflection + grain */}
        <div
          className={`absolute inset-0 rounded-[22px] pointer-events-none z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-indigo-500/[0.08] via-transparent to-cyan-500/[0.05]'
              : 'bg-gradient-to-b from-violet-500/[0.03] to-transparent'
          }`}
        />
        <div className="pc-grain absolute inset-0 pointer-events-none z-[1] opacity-[0.08]" />

        {/* ══════════ MEDIA ══════════ */}
        <div
          className="relative aspect-[16/10] overflow-hidden cursor-pointer z-[2]"
          onClick={go}
          role="button"
          tabIndex={0}
          aria-label={`Open ${product.name}`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              go()
            }
          }}
        >
          {/* Thumbnail */}
          <img
            src={toThumb(product.heroImage)}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? 'opacity-0 scale-105' : 'group-hover:scale-[1.07]'
            }`}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />

          {/* Video */}
          {hasVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 pointer-events-none ${
                isPlaying ? 'opacity-100 scale-[1.02]' : 'opacity-0'
              }`}
              muted
              loop
              playsInline
              preload="metadata"
              poster={toPoster(product.heroImage)}
            >
              <source src={product.videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Media overlays (better depth) */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isDark
                ? 'bg-[radial-gradient(circle_at_30%_10%,rgba(99,102,241,0.18),transparent_45%),linear-gradient(to_top,rgba(7,6,26,0.95),rgba(7,6,26,0.18),transparent)]'
                : 'bg-[radial-gradient(circle_at_30%_10%,rgba(139,92,246,0.12),transparent_55%),linear-gradient(to_top,rgba(255,255,255,0.78),transparent)]'
            }`}
          />

          {/* Top shine line */}
          <div
            className={`absolute top-0 left-0 right-0 h-[1px] pointer-events-none ${
              isDark
                ? 'bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent'
                : 'bg-gradient-to-r from-transparent via-violet-300/35 to-transparent'
            }`}
          />

          {/* Play button */}
          {hasVideo && !isPlaying && !prefersReducedMotion() && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div
                className={`w-[54px] h-[54px] rounded-full flex items-center justify-center ${
                  isDark
                    ? 'bg-black/45 border border-white/18 shadow-[0_0_32px_rgba(99,102,241,0.38)]'
                    : 'bg-white/35 border border-white/55 shadow-lg'
                }`}
                animate={{ scale: [1, 1.09, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Play size={22} className="text-white ml-0.5" fill="white" strokeWidth={0} />
              </motion.div>
            </div>
          )}

          {/* Badge */}
          {product.badge?.trim() && (
            <motion.div
              className="absolute top-3 left-3 z-20"
              initial={allowFancy ? { opacity: 0, x: -10, scale: 0.94 } : false}
              whileInView={allowFancy ? { opacity: 1, x: 0, scale: 1 } : undefined}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.18 + index * 0.05 }}
            >
              <span
                className={`pc-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.09em] text-white shadow-xl border border-white/15 ${
                  String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`
                }`}
                style={{
                  ...(String(product.badgeColor || '').includes('linear-gradient') ? { backgroundImage: product.badgeColor } : {}),
                  textShadow: '0 1px 4px rgba(0,0,0,0.42)',
                }}
              >
                <span className="pc-badge-dot w-1.5 h-1.5 rounded-full bg-white/85" />
                {product.badge}
              </span>
            </motion.div>
          )}

          {/* Live Preview chip */}
          {hasVideo && isPlaying && (
            <motion.div className="absolute bottom-3 right-3 z-20" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] backdrop-blur-xl ${
                  isDark
                    ? 'bg-black/60 text-white/90 border border-indigo-400/30 shadow-[0_0_14px_rgba(99,102,241,0.28)]'
                    : 'bg-white/85 text-violet-700 border border-violet-200 shadow-sm'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.85)]" />
                Live Preview
              </span>
            </motion.div>
          )}
        </div>

        {/* ══════════ BODY ══════════ */}
        <div className="relative p-5 flex-1 flex flex-col z-[2]">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <motion.h3
              className={`text-[17px] md:text-[18px] font-display font-extrabold leading-snug transition-colors duration-500 ${titleColor}`}
              initial={allowFancy ? { opacity: 0, x: -8 } : false}
              whileInView={allowFancy ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true }}
              transition={allowFancy ? { duration: 0.45, delay: 0.13 + index * 0.04 } : undefined}
              style={allowFancy && !isMobile() ? ({ transform: 'translateZ(12px)' } as any) : undefined}
            >
              {product.name}
            </motion.h3>

            {product.categoryTags?.[0] && (
              <motion.span
                className={`pc-cat-chip shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-full border tracking-[0.12em] uppercase ${
                  isDark ? 'border-indigo-400/25 bg-indigo-500/[0.09] text-indigo-200/90' : 'border-violet-200 bg-violet-50 text-violet-600'
                }`}
                initial={allowFancy ? { opacity: 0, scale: 0.88 } : false}
                whileInView={allowFancy ? { opacity: 1, scale: 1 } : undefined}
                viewport={{ once: true }}
                transition={allowFancy ? { duration: 0.4, delay: 0.22 + index * 0.04 } : undefined}
              >
                {product.categoryTags[0]}
              </motion.span>
            )}
          </div>

          {/* Description (higher contrast on dark) */}
          <p className={`text-[12px] mt-1.5 leading-relaxed line-clamp-2 min-h-[2.5em] ${descColor}`}>
            {product.shortDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 min-h-[1.75rem]">
            {product.categoryTags?.slice(1, 4).map((tag, i) => (
              <motion.span
                key={tag}
                className={`pc-tag inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-[3px] rounded-full border ${
                  isDark
                    ? 'bg-white/[0.04] text-indigo-200/70 border-white/[0.07]'
                    : 'bg-violet-50/80 text-violet-600 border-violet-100'
                }`}
                initial={allowFancy ? { opacity: 0, y: 6 } : false}
                whileInView={allowFancy ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true }}
                transition={allowFancy ? { duration: 0.35, delay: 0.28 + i * 0.06 } : undefined}
              >
                <Tag size={8} />
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-auto pt-4 mb-3.5">
            <div className={`h-px relative overflow-hidden ${isDark ? 'bg-white/[0.07]' : 'bg-violet-100/70'}`}>
              {isDark && <div className="pc-divider-glow absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-400/45 to-transparent" />}
              {!isDark && <div className="pc-divider-glow2 absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-violet-300/55 to-transparent" />}
            </div>
          </div>

          {/* Price / Quote */}
          {product.showPrice !== false ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-display font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {product.rentalPricePerDay}
                </span>
                <span className={`text-[10px] font-mono tracking-wider ${subtleMono}`}>{product.currency}/day</span>
              </div>

              {product.rentalPricePerEvent > 0 && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-white/[0.04] text-indigo-200/55 border-white/[0.08]' : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {product.rentalPricePerEvent} {product.currency}/event
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Star size={13} className={isDark ? 'text-cyan-300/70' : 'text-violet-500'} />
              <span className={`text-[12px] font-semibold ${isDark ? 'text-cyan-200/70' : 'text-violet-600'}`}>
                Request a Quote
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <Link
              to={`/products/${product.slug}`}
              className={`pc-btn-details flex-1 py-2.5 rounded-xl text-[12px] font-bold text-center transition-all flex items-center justify-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? 'text-indigo-100/75 bg-white/[0.05] border border-white/[0.09] hover:border-indigo-400/35 hover:text-indigo-100 hover:bg-indigo-500/[0.07] hover:shadow-[0_0_18px_rgba(99,102,241,0.16)] focus-visible:ring-indigo-400/60 focus-visible:ring-offset-[#07061a]'
                  : 'text-gray-600 bg-gray-50 border border-gray-200 hover:text-violet-700 hover:border-violet-300 focus-visible:ring-violet-500/50 focus-visible:ring-offset-white'
              }`}
            >
              <Eye size={13} />
              Details
            </Link>

            <Link
              to={`/contact?product=${product.slug}`}
              className={`pc-btn-cta flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-extrabold text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_6px_24px_rgba(99,102,241,0.34)] hover:shadow-[0_10px_34px_rgba(99,102,241,0.52)] hover:scale-[1.02] focus-visible:ring-indigo-400/60 focus-visible:ring-offset-[#07061a]'
                  : 'bg-gradient-to-r from-violet-600 to-pink-500 shadow-md hover:shadow-lg hover:shadow-violet-200/60 hover:scale-[1.01] focus-visible:ring-violet-500/50 focus-visible:ring-offset-white'
              }`}
            >
              <Zap size={12} />
              Request Quote
            </Link>
          </div>
        </div>

        {/* ══════════ CSS ══════════ */}
        <style>{`
          /* Neon border rotation */
          @property --neon-angle {
            syntax: '<angle>';
            inherits: false;
            initial-value: 220deg;
          }
          .pc:hover .pc-neon { animation: neonSpin 4.2s linear infinite; }
          @keyframes neonSpin { to { --neon-angle: 580deg; } }

          /* Badge pulse (subtle) */
          .pc-badge { animation: badgePulse 3.2s ease-in-out infinite; }
          @keyframes badgePulse {
            0%, 100% { box-shadow: 0 2px 16px rgba(0,0,0,0.28); }
            50% { box-shadow: 0 2px 26px rgba(99,102,241,0.38), 0 0 42px rgba(99,102,241,0.12); }
          }
          .pc-badge-dot { animation: dotBlink 2.1s ease-in-out infinite; }
          @keyframes dotBlink { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.32; } }

          /* Divider glow sweep */
          .pc-divider-glow { animation: dividerSweep 3.1s ease-in-out infinite; }
          .pc-divider-glow2 { animation: dividerSweep 3.4s ease-in-out infinite; }
          @keyframes dividerSweep {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(420%); }
          }

          /* CTA shimmer (premium, less loud) */
          .pc-btn-cta { position: relative; overflow: hidden; }
          .pc-btn-cta::after {
            content: '';
            position: absolute;
            top: 0; left: -120%; bottom: 0;
            width: 60%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
            animation: shimmer 3.2s ease-in-out infinite;
          }
          @keyframes shimmer { 0% { left: -120%; } 100% { left: 220%; } }

          /* Hover polish */
          .pc:hover .pc-tag {
            border-color: rgba(99,102,241,0.22);
            background: rgba(99,102,241,0.07);
          }
          .pc:hover .pc-cat-chip {
            border-color: rgba(99,102,241,0.38);
            box-shadow: 0 0 14px rgba(99,102,241,0.14);
          }
          .pc:hover .pc-btn-details {
            box-shadow: inset 0 0 14px rgba(99,102,241,0.06);
          }

          /* Grain overlay (super subtle) */
          .pc-grain {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
            mix-blend-mode: overlay;
          }

          /* Mobile: less heavy */
          @media (max-width: 767px) {
            .pc .pc-neon { opacity: 0.38 !important; }
            .pc-badge { animation-duration: 4.2s; }
            .pc-btn-cta::after { animation-duration: 3.8s; opacity: 0.7; }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .pc:hover .pc-neon { animation: none; }
            .pc-badge, .pc-badge-dot, .pc-divider-glow, .pc-divider-glow2, .pc-btn-cta::after { animation: none !important; }
          }
        `}</style>
      </motion.div>
    </motion.div>
  )
}