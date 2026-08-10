import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

export type RowPeek = {
  /** Cards per row at the current breakpoint. */
  cols: number
  /** Distance from the grid top to the cut row, in px. */
  fadeStart: number
  /** Height the collapsed grid is clipped to (cut row shown at ~55%), or null when there is no cut row. */
  clipHeight: number | null
}

const INITIAL: RowPeek = { cols: 2, fadeStart: 0, clipHeight: null }

/**
 * Measures a CSS grid so a collapsed section can show `visibleRows` full rows plus a
 * half-row peek — at whatever column count the current breakpoint happens to use.
 * Measuring beats hardcoding counts per breakpoint: rows stay correct at any width.
 */
export function useRowPeek(visibleRows = 2): { ref: (node: HTMLElement | null) => void; peek: RowPeek } {
  // Callback ref, not a RefObject: sections render null while their data loads, so the
  // grid can mount long after the first layout effect would have run.
  const [grid, setGrid] = useState<HTMLElement | null>(null)
  const [peek, setPeek] = useState<RowPeek>(INITIAL)
  const peekRef = useRef(peek)
  peekRef.current = peek

  useLayoutEffect(() => {
    if (!grid) return undefined

    const measure = () => {
      const children = Array.from(grid.children) as HTMLElement[]
      if (children.length === 0) return
      const firstTop = children[0].offsetTop
      const cols = children.filter(child => child.offsetTop === firstTop).length
      const cutRow = children[cols * visibleRows]
      const next: RowPeek = cutRow
        ? { cols, fadeStart: cutRow.offsetTop, clipHeight: cutRow.offsetTop + cutRow.offsetHeight * 0.55 }
        : { cols, fadeStart: 0, clipHeight: null }
      const current = peekRef.current
      if (
        current.cols === next.cols &&
        current.fadeStart === next.fadeStart &&
        current.clipHeight === next.clipHeight
      ) return
      setPeek(next)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [grid, visibleRows])

  return { ref: setGrid, peek }
}

/** Grid fade-out + blur-ramp styles so the cut reads as depth instead of a hard crop. */
export function rowPeekStyles(peek: RowPeek): { grid: CSSProperties; overlay: CSSProperties } {
  const { fadeStart, clipHeight } = peek
  if (clipHeight === null) return { grid: {}, overlay: { display: 'none' } }
  const fade = `linear-gradient(to bottom, #000 ${fadeStart}px, rgba(0,0,0,0.5) ${fadeStart + (clipHeight - fadeStart) * 0.5}px, transparent ${clipHeight}px)`
  const ramp = 'linear-gradient(to bottom, transparent 0%, #000 70%)'
  return {
    grid: { maskImage: fade, WebkitMaskImage: fade },
    overlay: {
      top: fadeStart,
      height: clipHeight - fadeStart,
      maskImage: ramp,
      WebkitMaskImage: ramp,
    },
  }
}
