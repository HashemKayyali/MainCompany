import { useRef, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Play, Star, ArrowUpRight, Sparkles } from 'lucide-react'
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

  /* ─── 3D tilt + spotlight ─── */
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 200, damping: 22 })
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 200, damping: 22 })

  const spX = useSpring(useTransform(mx, [0, 1], ['0%', '100%']), { stiffness: 160, damping: 24 })
  const spY = useSpring(useTransform(my, [0, 1], ['0%', '100%']), { stiffness: 160, damping: 24 })

  const onMove = (e: React.MouseEvent) => {
    if (!allowFancy || isMobile()) return
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  const resetTilt = () => { mx.set(0.5); my.set(0.5) }
  useEffect(() => { resetTilt() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── IntersectionObserver — mobile autoplay ─── */
  useEffect(() => {
    if (!hasVideo || !cardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current
        if (!v || prefersReducedMotion()) return
        if (entry.isIntersecting && isMobile()) {
          v.currentTime = 0; v.play().catch(() => {}); setIsPlaying(true)
        } else if (!entry.isIntersecting) {
          v.pause(); v.currentTime = 0; setIsPlaying(false)
        }
      },
      { threshold: 0.55 }
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [hasVideo])

  /* ─── Desktop hover video ─── */
  const onEnter = () => {
    setIsHover(true)
    if (isMobile() || prefersReducedMotion()) return
    const v = videoRef.current
    if (!v || !hasVideo) return
    v.currentTime = 0; v.play().catch(() => {}); setIsPlaying(true)
  }

  const onLeave = () => {
    setIsHover(false)
    if (isMobile()) return
    const v = videoRef.current
    if (v) { v.pause(); v.currentTime = 0; setIsPlaying(false) }
    resetTilt()
  }

  const go = () => navigate(`/products/${product.slug}`)

  /* ─── Theme-aware styles ─── */
  const surface = useMemo(() =>
    isDark
      ? 'bg-[#0c0a1e]/90 backdrop-blur-2xl'
      : 'bg-white/98 backdrop-blur-lg shadow-lg shadow-violet-100/40'
  , [isDark])

  return (
    <motion.div
      className="h-full"
      initial={allowFancy ? { opacity: 0, y: 30 } : false}
      whileInView={allowFancy ? { opacity: 1, y: 0 } : undefined}
      viewport={allowFancy ? { once: true, margin: '-40px' } : undefined}
      transition={allowFancy ? { duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      <motion.div
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onMouseMove={onMove}
        style={
          allowFancy && !isMobile()
            ? ({ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } as any)
            : undefined
        }
        className={`
          pc group relative rounded-3xl overflow-hidden h-full flex flex-col
          transition-all duration-500 will-change-transform
          hover:-translate-y-2
          ${surface}
        `}
      >
        {/* ═══ Ambient border + glow ═══ */}
        {isDark ? (
          <>
            {/* resting border */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-0"
              style={{ border: '1px solid rgba(139,92,246,0.12)' }} />
            {/* rotating neon edge on hover */}
            <div className="pc-neon absolute -inset-px rounded-3xl pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'conic-gradient(from var(--neon-angle,220deg), rgba(139,92,246,0.6), rgba(59,130,246,0.45), rgba(236,72,153,0.5), rgba(139,92,246,0.6))',
                filter: 'blur(18px)',
              }}
            />
            {/* hover border glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                border: '1px solid rgba(139,92,246,0.45)',
                boxShadow: '0 0 28px rgba(139,92,246,0.2), inset 0 0 28px rgba(139,92,246,0.04)',
              }}
            />
            {/* spotlight follow */}
            {allowFancy && !isMobile() && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background: `radial-gradient(550px circle at ${spX.get()} ${spY.get()}, rgba(139,92,246,0.13), transparent 55%)`,
                  opacity: isHover ? 1 : 0,
                  transition: 'opacity 300ms ease',
                }}
              />
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 border border-violet-200/50 group-hover:border-violet-300 transition-colors duration-500" />
            {allowFancy && !isMobile() && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background: `radial-gradient(480px circle at ${spX.get()} ${spY.get()}, rgba(139,92,246,0.1), transparent 60%)`,
                  opacity: isHover ? 1 : 0,
                  transition: 'opacity 300ms ease',
                }}
              />
            )}
          </>
        )}

        {/* ═══ IMAGE / VIDEO ═══ */}
        <div
          className="relative aspect-[16/10] overflow-hidden cursor-pointer z-[2]"
          onClick={go}
          role="button" tabIndex={0} aria-label={`Open ${product.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }}
        >
          {/* Thumbnail */}
          <img
            src={toThumb(product.heroImage)}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? 'opacity-0 scale-105' : 'group-hover:scale-[1.06]'
            }`}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />

          {/* Video */}
          {hasVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 pointer-events-none ${
                isPlaying ? 'opacity-100 scale-[1.02]' : 'opacity-0'
              }`}
              muted loop playsInline preload="metadata" poster={toPoster(product.heroImage)}
            >
              <source src={product.videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Gradient overlay */}
          <div className={`absolute inset-0 pointer-events-none ${
            isDark
              ? 'bg-gradient-to-t from-[#0c0a1e] via-[#0c0a1e]/30 to-transparent'
              : 'bg-gradient-to-t from-white via-white/20 to-transparent'
          }`} />

          {/* Top shimmer line */}
          <div className={`absolute top-0 inset-x-0 h-px pointer-events-none ${
            isDark
              ? 'bg-gradient-to-r from-transparent via-violet-400/30 to-transparent'
              : 'bg-gradient-to-r from-transparent via-violet-300/30 to-transparent'
          }`} />

          {/* Play button */}
          {hasVideo && !isPlaying && !prefersReducedMotion() && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl ${
                  isDark
                    ? 'bg-black/50 border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.35)]'
                    : 'bg-white/40 border border-white/60 shadow-lg'
                }`}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Play size={18} className="text-white ml-0.5" fill="white" strokeWidth={0} />
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
                className={`pc-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-xl shadow-xl border border-white/15 ${
                  String(product.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${product.badgeColor}`
                }`}
                style={{
                  ...(String(product.badgeColor || '').includes('linear-gradient') ? { backgroundImage: product.badgeColor } : {}),
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                <span className="pc-badge-dot w-1.5 h-1.5 rounded-full bg-white/90" />
                {product.badge}
              </span>
            </motion.div>
          )}

          {/* Live Preview chip */}
          {hasVideo && isPlaying && (
            <motion.div className="absolute bottom-3 right-3 z-20" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] backdrop-blur-xl ${
                isDark
                  ? 'bg-black/60 text-white/90 border border-violet-400/30 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                  : 'bg-white/85 text-violet-700 border border-violet-200 shadow-sm'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                Live Preview
              </span>
            </motion.div>
          )}

          {/* Category floating chip */}
          {product.categoryTags?.[0] && (
            <motion.span
              className={`absolute top-3 right-3 z-20 text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xl border tracking-[0.1em] uppercase ${
                isDark
                  ? 'bg-black/40 border-violet-400/25 text-violet-200/90'
                  : 'bg-white/70 border-violet-200 text-violet-600'
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

        {/* ═══ BODY ═══ */}
        <div className="relative p-5 pt-4 flex-1 flex flex-col z-[2]">
          {/* Title */}
          <motion.h3
            className={`text-[17px] font-display font-extrabold leading-snug transition-colors duration-400 ${
              isDark ? 'text-white group-hover:text-violet-200' : 'text-gray-900 group-hover:text-violet-700'
            }`}
            initial={allowFancy ? { opacity: 0, x: -8 } : false}
            whileInView={allowFancy ? { opacity: 1, x: 0 } : undefined}
            viewport={{ once: true }}
            transition={allowFancy ? { duration: 0.45, delay: 0.13 + index * 0.04 } : undefined}
            style={allowFancy && !isMobile() ? ({ transform: 'translateZ(10px)' } as any) : undefined}
          >
            {product.name}
          </motion.h3>

          {/* Description */}
          <p className={`text-[12.5px] mt-1.5 leading-relaxed line-clamp-2 min-h-[2.5em] ${
            isDark ? 'text-violet-200/55' : 'text-gray-500'
          }`}>
            {product.shortDescription}
          </p>

          {/* Tags */}
          {product.categoryTags?.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.categoryTags.slice(1, 4).map((tag, i) => (
                <motion.span
                  key={tag}
                  className={`pc-tag text-[9px] font-semibold px-2 py-[3px] rounded-full border transition-all duration-300 ${
                    isDark
                      ? 'bg-violet-500/[0.06] text-violet-300/60 border-violet-500/10 group-hover:border-violet-400/25 group-hover:text-violet-200/75'
                      : 'bg-violet-50/80 text-violet-500 border-violet-100 group-hover:border-violet-200'
                  }`}
                  initial={allowFancy ? { opacity: 0, y: 6 } : false}
                  whileInView={allowFancy ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true }}
                  transition={allowFancy ? { duration: 0.35, delay: 0.28 + i * 0.06 } : undefined}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}

          {/* Spacer + Divider */}
          <div className="mt-auto pt-4 mb-3">
            <div className={`h-px relative overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-violet-100/60'}`}>
              {isDark && <div className="pc-divider-glow absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />}
              {!isDark && <div className="pc-divider-glow2 absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />}
            </div>
          </div>

          {/* Price row */}
          {product.showPrice !== false ? (
            <div className="flex items-end justify-between gap-3 mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-display font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {product.rentalPricePerDay}
                </span>
                <span className={`text-[10px] font-mono tracking-wider ${
                  isDark ? 'text-violet-300/50' : 'text-gray-400'
                }`}>
                  {product.currency}/day
                </span>
              </div>
              {product.rentalPricePerEvent > 0 && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-violet-500/[0.06] text-violet-300/50 border-violet-500/15'
                    : 'bg-violet-50 text-violet-500 border-violet-100'
                }`}>
                  {product.rentalPricePerEvent} {product.currency}/event
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} className={isDark ? 'text-violet-400/70' : 'text-violet-500'} />
              <span className={`text-[12px] font-semibold ${isDark ? 'text-violet-300/70' : 'text-violet-600'}`}>
                Request a Custom Quote
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Link
              to={`/products/${product.slug}`}
              className={`pc-btn-details flex-1 py-2.5 rounded-xl text-[12px] font-bold text-center transition-all duration-300 flex items-center justify-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? 'text-violet-200/70 bg-white/[0.04] border border-white/[0.08] hover:border-violet-400/30 hover:text-white hover:bg-violet-500/[0.08] focus-visible:ring-violet-400/60 focus-visible:ring-offset-[#0c0a1e]'
                  : 'text-gray-500 bg-gray-50 border border-gray-200 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50 focus-visible:ring-violet-500/50 focus-visible:ring-offset-white'
              }`}
            >
              Details
              <ArrowUpRight size={12} />
            </Link>

            <Link
              to={`/contact?product=${product.slug}`}
              className={`pc-btn-cta flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-extrabold text-white transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-[1.03] focus-visible:ring-violet-400/60 focus-visible:ring-offset-[#0c0a1e]'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-md shadow-violet-200/50 hover:shadow-lg hover:shadow-violet-300/50 hover:scale-[1.02] focus-visible:ring-violet-500/50 focus-visible:ring-offset-white'
              }`}
            >
              <Star size={11} />
              Get Quote
            </Link>
          </div>
        </div>

        {/* ═══ CSS Animations ═══ */}
        <style>{`
          @property --neon-angle {
            syntax: '<angle>';
            inherits: false;
            initial-value: 220deg;
          }
          .pc:hover .pc-neon { animation: neonSpin 4s linear infinite; }
          @keyframes neonSpin { to { --neon-angle: 580deg; } }

          .pc-badge { animation: badgePulse 3.5s ease-in-out infinite; }
          @keyframes badgePulse {
            0%, 100% { box-shadow: 0 2px 14px rgba(0,0,0,0.25); }
            50% { box-shadow: 0 2px 22px rgba(139,92,246,0.35), 0 0 36px rgba(139,92,246,0.1); }
          }
          .pc-badge-dot { animation: dotBlink 2s ease-in-out infinite; }
          @keyframes dotBlink { 0%, 100% { opacity: 0.9; } 50% { opacity: 0.3; } }

          .pc-divider-glow { animation: dividerSweep 3s ease-in-out infinite; }
          .pc-divider-glow2 { animation: dividerSweep 3.5s ease-in-out infinite; }
          @keyframes dividerSweep {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(420%); }
          }

          .pc-btn-cta { position: relative; overflow: hidden; }
          .pc-btn-cta::after {
            content: '';
            position: absolute;
            top: 0; left: -120%; bottom: 0;
            width: 55%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes shimmer { 0% { left: -120%; } 100% { left: 220%; } }

          @media (max-width: 767px) {
            .pc .pc-neon { opacity: 0.3 !important; }
            .pc-badge { animation-duration: 4.5s; }
            .pc-btn-cta::after { animation-duration: 4s; opacity: 0.6; }
          }

          @media (prefers-reduced-motion: reduce) {
            .pc:hover .pc-neon { animation: none; }
            .pc-badge, .pc-badge-dot, .pc-divider-glow, .pc-divider-glow2, .pc-btn-cta::after { animation: none !important; }
          }
        `}</style>
      </motion.div>
    </motion.div>
  )
}