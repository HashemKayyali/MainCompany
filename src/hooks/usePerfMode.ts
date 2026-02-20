import { useEffect, useMemo, useState } from 'react'

/**
 * Lightweight heuristic to switch UI into "low" mode.
 * هدفها: تقليل استهلاك CPU/GPU (خصوصاً على الموبايل/اللابتوبات الضعيفة).
 */
export function usePerfMode() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [saveData, setSaveData] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onMQ = () => setPrefersReducedMotion(!!mq?.matches)
    onMQ()
    mq?.addEventListener?.('change', onMQ)

    const conn: any = (navigator as any).connection
    const onConn = () => setSaveData(!!conn?.saveData)
    onConn()
    conn?.addEventListener?.('change', onConn)

    return () => {
      mq?.removeEventListener?.('change', onMQ)
      conn?.removeEventListener?.('change', onConn)
    }
  }, [])

  const perfLow = useMemo(() => {
    if (typeof window === 'undefined') return false
    const nav: any = navigator
    const dm = Number(nav?.deviceMemory || 0) // GB (Chrome/Edge)
    const hc = Number(nav?.hardwareConcurrency || 0)
    const conn: any = nav?.connection
    const eff = String(conn?.effectiveType || '')

    const lowCPU = hc > 0 && hc <= 4
    const lowRAM = dm > 0 && dm <= 4
    const slowNet = /2g/.test(eff)

    return prefersReducedMotion || saveData || lowCPU || lowRAM || slowNet
  }, [prefersReducedMotion, saveData])

  return { perfLow, prefersReducedMotion, saveData }
}
