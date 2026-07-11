#!/usr/bin/env node
/**
 * I18N-004 — extraction: legacy phrase dictionary (Vite src/lib/i18n.ts) →
 * keyed corpus drafts for next-intl (I18N-005 curates these into the real
 * per-domain files). Emits:
 *   src/messages/extraction/en.draft.json
 *   src/messages/extraction/ar.draft.json
 *   src/messages/extraction/REPORT.md   (coverage % + leftovers)
 *
 * Rerunnable: node scripts/extract-i18n-corpus.mjs [--source ../src/lib/i18n.ts]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const si = args.indexOf('--source')
const SOURCE = resolve(si !== -1 ? args[si + 1] : '../src/lib/i18n.ts')
const OUT_DIR = join(process.cwd(), 'src', 'messages', 'extraction')

const text = readFileSync(SOURCE, 'utf8')

/** Extract a top-level `const NAME ... = { ... }` object literal by brace matching. */
function extractObjectLiteral(name) {
  const start = text.indexOf(`const ${name}`)
  if (start === -1) throw new Error(`cannot find const ${name}`)
  const braceStart = text.indexOf('{', start)
  let depth = 0
  for (let i = braceStart; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return text.slice(braceStart, i + 1)
    }
  }
  throw new Error(`unbalanced braces for ${name}`)
}

/** Evaluate an object literal from our own trusted source file. */
function evalObject(literal) {
  return new Function(`return (${literal})`)()
}

function slugify(phrase) {
  return phrase
    .toLowerCase()
    .replace(/\{[^}]+\}/g, 'x')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
}

// 1. Keyed dictionaries (already key→copy)
const enDict = evalObject(extractObjectLiteral('en: Messages'))
const arDict = evalObject(extractObjectLiteral('ar: Messages'))

// 2. Phrase map (EN phrase → AR), with section-comment bucketing
const phraseLiteral = extractObjectLiteral('arPhraseMap')
const phraseMap = evalObject(phraseLiteral)

// bucket phrases by the section comments (── Section ──) preceding them
const sectionRegex = /\/\/\s*[─-]{1,}\s*([^─\n]+?)\s*[─-]{1,}\s*\n/g
const sections = []
let match
while ((match = sectionRegex.exec(phraseLiteral))) {
  sections.push({ name: match[1].trim(), index: match.index })
}
function sectionFor(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const keyRegex = new RegExp(
    `(?:'${escaped}'|"${escaped}"|\`${escaped}\`|^\\s*${escaped}\\s*:)`,
    'm'
  )
  const m = keyRegex.exec(phraseLiteral)
  const at = m ? m.index : -1
  let current = 'misc'
  for (const s of sections) {
    if (s.index < at) current = s.name
    else break
  }
  return current
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

const en = { ...enDict }
const ar = { ...arDict }
let phraseCount = 0
let mappedCount = 0
const leftovers = []

for (const [phrase, arabic] of Object.entries(phraseMap)) {
  phraseCount++
  const key = `phrases.${sectionFor(phrase)}.${slugify(phrase)}`
  en[key] = phrase
  if (typeof arabic === 'string' && arabic.trim()) {
    ar[key] = arabic
    mappedCount++
  } else {
    leftovers.push(phrase)
  }
}

// keyed-dict coverage
const dictKeys = Object.keys(enDict)
const dictMapped = dictKeys.filter((k) => typeof arDict[k] === 'string' && arDict[k].trim()).length
for (const k of dictKeys) if (!(k in arDict)) leftovers.push(`[keyed] ${k}`)

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'en.draft.json'), JSON.stringify(en, null, 2))
writeFileSync(join(OUT_DIR, 'ar.draft.json'), JSON.stringify(ar, null, 2))

const total = phraseCount + dictKeys.length
const mapped = mappedCount + dictMapped
const pct = ((mapped / total) * 100).toFixed(2)

const report = `# I18N-004 extraction report

- Source: Vite \`src/lib/i18n.ts\`
- Keyed dictionary entries: ${dictKeys.length} (AR-mapped: ${dictMapped})
- Phrase-map entries: ${phraseCount} (AR-mapped: ${mappedCount})
- **Coverage: ${mapped}/${total} = ${pct}%** (acceptance: ≥95%)
- Leftovers (${leftovers.length}):
${leftovers.map((l) => `  - ${l}`).join('\n') || '  - none'}

Next step (I18N-005): curate these drafts into messages/{en,ar}/{common,catalog,forms,...}.json;
the drafts are DATA, not live dictionaries — nothing imports them.
`
writeFileSync(join(OUT_DIR, 'REPORT.md'), report)
console.log(`extracted ${total} entries — coverage ${pct}% — leftovers ${leftovers.length}`)
if (Number(pct) < 95) process.exitCode = 2
