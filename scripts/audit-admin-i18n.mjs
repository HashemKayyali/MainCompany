// Dev-only audit: reports admin-scope UI strings missing from the Arabic
// phrase map in src/lib/i18n.ts. Read-only — never modifies files.
// Usage: node scripts/audit-admin-i18n.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

// ── 1. Extract arPhraseMap keys ──
const i18nSrc = readFileSync(join(ROOT, 'src/lib/i18n.ts'), 'utf8')
const mapStart = i18nSrc.indexOf('const arPhraseMap')
const mapEnd = i18nSrc.indexOf('\n}', mapStart)
const mapBody = i18nSrc.slice(mapStart, mapEnd)

const phraseKeys = new Set()
for (const match of mapBody.matchAll(/^\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([A-Za-z][A-Za-z0-9]*))\s*:/gm)) {
  const key = (match[1] ?? match[2] ?? match[3] ?? '').replace(/\\'/g, "'")
  if (key) phraseKeys.add(key.trim().replace(/\s+/g, ' '))
}

// Dynamic patterns handled by translateDynamicPhrase — treat "Label (n)" as
// covered when "Label" itself is covered.
const isCovered = phrase => {
  const core = phrase.trim().replace(/\s+/g, ' ')
  if (phraseKeys.has(core)) return true
  const dyn = core.match(/^(.+?) \(\d+\)$/)
  if (dyn && phraseKeys.has(dyn[1])) return true
  return false
}

// ── 2. Collect admin-scope files ──
const TARGET_DIRS = ['src/pages/admin', 'src/components/admin']
const EXTRA_FILES = [
  'src/components/ui/Modal.tsx',
  'src/components/ui/MediaPlacementModal.tsx',
  'src/components/ui/ImageUploader.tsx',
  'src/components/ui/VideoUploader.tsx',
  'src/contexts/DialogContext.tsx',
]

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(tsx|ts)$/.test(entry)) acc.push(full)
  }
  return acc
}

const files = [
  ...TARGET_DIRS.flatMap(dir => walk(join(ROOT, dir))),
  ...EXTRA_FILES.map(f => join(ROOT, f)),
]

// ── 3. Extract candidate user-visible strings ──
const ATTR_RE =
  /(?:label|placeholder|title|hint|description|message|confirmLabel|cancelLabel|submitLabel|noteLabel|notePlaceholder|frameTitle|frameHint|previewTitle|previewHint|contextPreviewTitle|contextPreviewHint|frameContextTitle|frameContextHint|subtitle|footer|toneLabel|'aria-label')(?:=|:)\s*\{?\s*(['"])((?:(?!\1)[^\\]|\\.)+)\1/g
const JSX_TEXT_RE = />\s*([A-Z][^<>{}\n]*[a-zA-Z).!?%…])\s*</g
const TT_RE = /translateText\(\s*(['"])((?:(?!\1)[^\\]|\\.)+)\1\s*\)/g

const looksLikeCode = s =>
  /[<>{}\\]|className|https?:|^\d|^[a-z0-9-]+$|\.(tsx|ts|css|webp|svg)|^#|^\/|--|var\(/.test(s) ||
  !/[A-Za-z]{2}/.test(s)

const missing = new Map() // phrase -> Set(files)
const report = (phrase, file) => {
  const core = phrase.trim().replace(/\s+/g, ' ')
  if (!core || core.length < 2 || looksLikeCode(core) || isCovered(core)) return
  if (!missing.has(core)) missing.set(core, new Set())
  missing.get(core).add(file.replace(ROOT, '').replace(/\\/g, '/'))
}

for (const file of files) {
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const re of [ATTR_RE, JSX_TEXT_RE, TT_RE]) {
    re.lastIndex = 0
    for (const match of src.matchAll(re)) {
      report(match[2] ?? match[1], file)
    }
  }
}

// ── 4. Output ──
const sorted = [...missing.entries()].sort((a, b) => a[0].localeCompare(b[0]))
console.log(`arPhraseMap keys: ${phraseKeys.size}`)
console.log(`Admin-scope files scanned: ${files.length}`)
console.log(`Missing Arabic phrases: ${sorted.length}\n`)
for (const [phrase, fileSet] of sorted) {
  console.log(`  '${phrase.replace(/'/g, "\\'")}'  ← ${[...fileSet][0]}`)
}
