'use client'

import { useSyncExternalStore } from 'react'

/**
 * FOUND-024 / CAT-024 — perf-mode store (VERBATIM port of the Vite
 * `hooks/usePerfMode`). Gates GPU-heavy shaders + animations on
 * prefers-reduced-motion, Save-Data, and low-CPU/RAM/slow-network devices.
 * SSR-safe: getServerSnapshot returns the inert default.
 */
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
  const nav = navigator as Navigator & {
    connection?: {
      saveData?: boolean
      effectiveType?: string
      addEventListener?: (t: string, l: () => void) => void
    }
    deviceMemory?: number
  }
  const conn = nav?.connection
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

function emitSnapshot(next: PerfModeSnapshot) {
  if (
    snapshot.perfLow === next.perfLow &&
    snapshot.prefersReducedMotion === next.prefersReducedMotion &&
    snapshot.saveData === next.saveData
  )
    return
  snapshot = next
  listeners.forEach((l) => l())
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const conn = (
    navigator as Navigator & {
      connection?: { addEventListener?: (t: string, l: () => void) => void }
    }
  )?.connection
  const update = () => emitSnapshot(computeSnapshot())
  update()
  if (typeof mq?.addEventListener === 'function') mq.addEventListener('change', update)
  conn?.addEventListener?.('change', update)
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

/** Single switch for motion (Framer + CSS). */
export function useMotionEnabled() {
  const { perfLow, prefersReducedMotion } = usePerfMode()
  return !prefersReducedMotion && !perfLow
}
