import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { IMAGE_BUCKET, VIDEO_BUCKET } from '../../src/services/storage-identity'
import { loadAdminEnv, makeAdminClient, type AdminEnv } from './supabase-admin'

/**
 * CLI plumbing shared by audit / cleanup / verify. Deliberately
 * imports ONLY from the Node-safe `storage-identity` module — never
 * from `storage.service` (which pulls in the browser Supabase
 * singleton via `src/lib/supabase.ts`).
 */

export interface Env extends AdminEnv {
  buckets: string[]
  safetyWindowDays: number
  reportsDir: string
}

export function loadEnv(): Env {
  const admin = loadAdminEnv()
  const safetyRaw = process.env.STORAGE_GC_SAFETY_DAYS
  const safetyWindowDays = safetyRaw
    ? Math.max(1, Math.floor(Number(safetyRaw)))
    : 7
  return {
    ...admin,
    buckets: [IMAGE_BUCKET, VIDEO_BUCKET],
    safetyWindowDays,
    reportsDir: process.env.STORAGE_GC_REPORTS_DIR ?? 'storage-gc-reports',
  }
}

export { makeAdminClient }

export function writeReport(
  reportsDir: string,
  filename: string,
  contents: string,
): string {
  const path = `${reportsDir}/${filename}`
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents, 'utf8')
  return path
}

export function log(...args: unknown[]) {
  // Route all human-readable output through stderr so the small JSON
  // summary on stdout stays parseable for CI.
  console.error(...args)
}
