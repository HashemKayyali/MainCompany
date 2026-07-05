import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { IMAGE_BUCKET, VIDEO_BUCKET } from '../../src/services/storage.service'

/**
 * Common plumbing for the storage-gc CLI commands. Kept as small as
 * possible so the interesting logic stays in `src/services/storage-gc/*`
 * where vitest can reach it.
 */

export interface Env {
  supabaseUrl: string
  serviceRoleKey: string
  projectRef: string
  buckets: string[]
  safetyWindowDays: number
  reportsDir: string
}

export function loadEnv(): Env {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL (or VITE_SUPABASE_URL) — cannot connect to Supabase.',
    )
  }
  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — the storage GC requires the service role to scan tables and list storage recursively. Do NOT commit this key.',
    )
  }
  const projectRef = safeProjectRef(supabaseUrl)
  const safetyRaw = process.env.STORAGE_GC_SAFETY_DAYS
  const safetyWindowDays = safetyRaw
    ? Math.max(1, Math.floor(Number(safetyRaw)))
    : 7
  return {
    supabaseUrl,
    serviceRoleKey,
    projectRef,
    buckets: [IMAGE_BUCKET, VIDEO_BUCKET],
    safetyWindowDays,
    reportsDir:
      process.env.STORAGE_GC_REPORTS_DIR ?? 'storage-gc-reports',
  }
}

/** Extract the project ref without ever storing the raw URL or key. */
function safeProjectRef(url: string): string {
  try {
    return new URL(url).hostname.split('.')[0] || 'unknown'
  } catch {
    return 'unknown'
  }
}

export function makeAdminClient(env: Env): SupabaseClient {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

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
  // Deliberately routed through stderr so JSON output on stdout
  // stays parseable.
  console.error(...args)
}
