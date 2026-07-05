#!/usr/bin/env node
/**
 * Static import-graph audit for the storage GC CLIs.
 *
 * Follows every relative import starting from the three entry points
 * and asserts that `src/lib/supabase.ts` is unreachable. Fails with a
 * non-zero exit code if it isn't.
 *
 * Kept dependency-free so it can run as a plain Node script.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')
const ENTRIES = [
  'scripts/storage-gc/audit.ts',
  'scripts/storage-gc/cleanup.ts',
  'scripts/storage-gc/verify.ts',
]
const FORBIDDEN = 'src/lib/supabase'

const IMPORT_RE = /(?:^|[^\w$])(?:import|export)\s+(?:type\s+)?[^'"`]*?from\s+(['"])(\.[^'"`]+)\1/g
const BARE_IMPORT_RE = /(?:^|[^\w$])import\s+(['"])(\.[^'"`]+)\1/g

/** Resolve a relative specifier from `fromFile` to an absolute file path. */
function resolveSpec(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec)
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    `${base}.js`,
    resolve(base, 'index.ts'),
    resolve(base, 'index.tsx'),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate) && extname(candidate)) return candidate
  }
  return null
}

/** Extract relative import specifiers from a single file's source text. */
function extractSpecs(source) {
  const specs = new Set()
  for (const re of [IMPORT_RE, BARE_IMPORT_RE]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(source)) !== null) specs.add(m[2])
  }
  return Array.from(specs)
}

let failed = false

for (const entry of ENTRIES) {
  const entryAbs = resolve(ROOT, entry)
  const visited = new Set()
  const stack = [entryAbs]
  const parents = new Map()
  while (stack.length > 0) {
    const file = stack.pop()
    if (visited.has(file)) continue
    visited.add(file)
    const source = readFileSync(file, 'utf8')
    const specs = extractSpecs(source)
    for (const spec of specs) {
      const target = resolveSpec(file, spec)
      if (!target) continue
      // Normalize to posix-ish for the forbidden match.
      const rel = target.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, '')
      const relBare = rel.replace(/\.(ts|tsx|mjs|js)$/, '')
      if (relBare === FORBIDDEN) {
        failed = true
        const chain = [rel]
        let cursor = file
        while (parents.has(cursor)) {
          const parent = parents.get(cursor)
          chain.unshift(
            parent.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, ''),
          )
          cursor = parent
        }
        chain.unshift(entry)
        console.error(`FAIL ${entry}: reaches ${FORBIDDEN}`)
        console.error('  chain:')
        for (const c of chain) console.error('    → ' + c)
      }
      if (!parents.has(target)) parents.set(target, file)
      stack.push(target)
    }
  }
  if (!failed) console.error(`OK   ${entry}: does NOT reach ${FORBIDDEN} (${visited.size} files traversed)`)
}

process.exit(failed ? 1 : 0)
