import { useSyncExternalStore } from 'react'

type PerfModeSnapshot = {
  perfLow: boolean
  prefersReducedMotion: boolean
  saveData: boolean
}

const DEFAULT_SNAPSHOT: PerfModeSnapshot = {
  perfLow: false,
  prefersReducedMotion: false,
  saveData: false,
}

let snapshot = DEFAULT_SNAPSHOT
let initialized = false

const listeners = new Set<() => void>()

function computeSnapshot(): PerfModeSnapshot {
  if (typeof window === 'undefined') return DEFAULT_SNAPSHOT

  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const prefersReducedMotion = !!mq?.matches

  const nav: any = navigator
  const conn: any = nav?.connection
  const saveData = !!conn?.saveData
  const dm = Number(nav?.deviceMemory || 0)
  const hc = Number(nav?.hardwareConcurrency || 0)
  const eff = String(conn?.effectiveType || '')

  const lowCPU = hc > 0 && hc <= 4
  const lowRAM = dm > 0 && dm <= 4
  const slowNet = /2g/.test(eff)

  return {
    prefersReducedMotion,
    saveData,
    perfLow: prefersReducedMotion || saveData || lowCPU || lowRAM || slowNet,
  }
}

function emitSnapshot(nextSnapshot: PerfModeSnapshot) {
  if (
    snapshot.perfLow === nextSnapshot.perfLow &&
    snapshot.prefersReducedMotion === nextSnapshot.prefersReducedMotion &&
    snapshot.saveData === nextSnapshot.saveData
  ) {
    return
  }

  snapshot = nextSnapshot
  listeners.forEach(listener => listener())
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const conn: any = (navigator as any)?.connection
  const updateSnapshot = () => emitSnapshot(computeSnapshot())

  updateSnapshot()

  if (typeof mq?.addEventListener === 'function') {
    mq.addEventListener('change', updateSnapshot)
  } else {
    mq?.addListener?.(updateSnapshot)
  }

  conn?.addEventListener?.('change', updateSnapshot)
}

function subscribe(listener: () => void) {
  ensureInitialized()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  ensureInitialized()
  return snapshot
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT
}

export function usePerfMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
