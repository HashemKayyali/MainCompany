#!/usr/bin/env node
/**
 * QG-ARCH gates (FOUND-007 / CACHE-004 / SEC-010). Run in CI before build.
 *
 *  GATE 1 (server-only markers): every .ts file under src/server/ imports
 *          'server-only' as its first import.
 *  GATE 2 (QG-ARCH-3, 06 §Hard rule 1): no file that imports
 *          server/supabase/session or server-client may contain 'use cache',
 *          force-cache, unstable_cache, or route-level revalidate — personal
 *          data is never cross-user cached.
 *  GATE 3 (QG-ARCH-4 / SEC-010): SUPABASE_SERVICE_ROLE_KEY may be referenced
 *          only in src/server/env.ts and ops scripts — never in client-
 *          reachable code, never NEXT_PUBLIC_.
 *  GATE 4 (ENV-002): no import.meta.env / VITE_ reads anywhere in src/.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const SRC = join(process.cwd(), 'src')
const failures = []
const SERVICE_ROLE_ALLOWLIST = new Set([
  'src/server/env.ts',
  'src/server/supabase/service-role-rest.ts',
])

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (/\.(ts|tsx|mts)$/.test(entry) && !entry.endsWith('.d.ts')) yield full
  }
}

for (const file of walk(SRC)) {
  const rel = relative(process.cwd(), file).split(sep).join('/')
  const raw = readFileSync(file, 'utf8').replace(/^﻿/, '')
  // Strip comments before pattern-matching: the gates analyze CODE, not prose
  // (a comment may legitimately mention `import.meta.env` or `'use cache'`).
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')

  // GATE 1 (tests are exercised via the vitest server-only shim, not at runtime)
  if (rel.startsWith('src/server/') && !rel.includes('__tests__')) {
    if (!/^import 'server-only'/m.test(text)) {
      failures.push(`[server-only] ${rel} lacks the "import 'server-only'" marker`)
    }
  }

  // GATE 2 — QG-ARCH-3
  const touchesSession =
    /server\/supabase\/(session|server-client)/.test(text) &&
    !rel.startsWith('src/server/supabase/')
  if (touchesSession || rel.startsWith('src/server/supabase/')) {
    if (/'use cache'|"use cache"|force-cache|unstable_cache/.test(text)) {
      failures.push(`[QG-ARCH-3] ${rel} mixes session access with caching primitives`)
    }
  }

  // GATE 3 — QG-ARCH-4
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(text) && !SERVICE_ROLE_ALLOWLIST.has(rel)) {
    failures.push(`[QG-ARCH-4] ${rel} references the service-role key outside src/server/env.ts`)
  }
  if (/NEXT_PUBLIC_[A-Z_]*SERVICE_ROLE/.test(text)) {
    failures.push(`[QG-ARCH-4] ${rel} exposes a service-role key as NEXT_PUBLIC_`)
  }

  // GATE 4 — ENV-002
  if (/import\.meta\.env|VITE_[A-Z_]+/.test(text)) {
    failures.push(`[ENV-002] ${rel} reads legacy VITE_/import.meta.env`)
  }
}

if (failures.length) {
  console.error(`QG-ARCH gates FAILED (${failures.length}):`)
  for (const f of failures) console.error('  ' + f)
  process.exit(1)
}
console.log('QG-ARCH gates green (server-only markers, QG-ARCH-3, QG-ARCH-4, ENV-002)')
