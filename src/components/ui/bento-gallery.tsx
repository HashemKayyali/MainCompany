import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion'
import { cn } from '../../utils/cn'
import FramedImage from './FramedImage'

export type BentoGalleryItem = {
  id: number | string
  title: string
  desc?: string
  url: string
  span: string
}

interface BentoGalleryProps {
  imageItems: BentoGalleryItem[]
  eager?: boolean
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
  },
}

const AUTO_SCROLL_SPEED = 54

export default function BentoGallery({ imageItems, eager = false }: BentoGalleryProps) {
  const [dragConstraint, setDragConstraint] = useState(0)
  const x = useMotionValue(0)
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const autoDirectionRef = useRef(-1)
  const isHoveringRef = useRef(false)
  const isDraggingRef = useRef(false)

  useAnimationFrame((_, delta) => {
    if (reduceMotion || isHoveringRef.current || isDraggingRef.current) return
    if (dragConstraint >= 0) return

    const step = (AUTO_SCROLL_SPEED * delta) / 1000
    const nextX = x.get() + autoDirectionRef.current * step

    if (nextX <= dragConstraint) {
      autoDirectionRef.current = 1
      x.set(dragConstraint)
      return
    }

    if (nextX >= 0) {
      autoDirectionRef.current = -1
      x.set(0)
      return
    }

    x.set(nextX)
  })

  useEffect(() => {
    const calculateConstraints = () => {
      if (!gridRef.current || !containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const gridWidth = gridRef.current.scrollWidth
      const nextConstraint = Math.min(0, containerWidth - gridWidth - 28)

      setDragConstraint(nextConstraint)

      if (x.get() < nextConstraint) {
        x.set(nextConstraint)
        autoDirectionRef.current = 1
      }
    }

    calculateConstraints()
    window.addEventListener('resize', calculateConstraints)
    return () => window.removeEventListener('resize', calculateConstraints)
  }, [imageItems, x])

  return (
    <div
      ref={containerRef}
      className="gallery-strip relative w-full cursor-grab overflow-hidden active:cursor-grabbing"
      dir="ltr"
      onPointerEnter={() => {
        isHoveringRef.current = true
      }}
      onPointerLeave={() => {
        isHoveringRef.current = false
      }}
    >
      <motion.div
        className="w-max py-2"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: dragConstraint, right: 0 }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true
        }}
        onDragEnd={() => {
          isDraggingRef.current = false

          if (x.get() <= dragConstraint + 1) autoDirectionRef.current = 1
          if (x.get() >= -1) autoDirectionRef.current = -1
        }}
      >
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid w-max auto-cols-[8.75rem] grid-flow-col-dense grid-rows-[9.25rem_9.25rem] gap-[3px] px-[max(1rem,calc((100vw-112rem)/2+1.125rem))] sm:auto-cols-[10.5rem] sm:grid-rows-[11.25rem_11.25rem] sm:gap-1 lg:auto-cols-[12.25rem] lg:grid-rows-[13.25rem_13.25rem]"
        >
          {imageItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={cn(
                'group relative flex h-full min-w-0 cursor-grab select-none items-end overflow-hidden rounded-[9px] bg-violet-50 text-left active:cursor-grabbing',
                item.span
              )}
            >
              <FramedImage
                media={item.url}
                alt={item.title}
                width={640}
                height={640}
                loading={eager && index < 10 ? 'eager' : 'lazy'}
                fetchPriority={eager && index < 4 ? 'high' : 'auto'}
                draggable={false}
                revealMode={eager ? 'crisp' : 'soft'}
                fallbackTransform={{ fit: 'cover' }}
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 48vw, 32vw"
                className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/72 via-ink-900/22 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none relative z-10 translate-y-4 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="line-clamp-1 text-sm font-extrabold text-white sm:text-base">
                  {item.title}
                </h3>
                {item.desc ? (
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/82">
                    {item.desc}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
