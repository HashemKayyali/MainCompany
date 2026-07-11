#!/usr/bin/env node
/**
 * FOUND-029 / QG-I18N-1 — key-coverage check (converted from the legacy
 * audit-*-i18n.mjs intent): every domain file must exist in BOTH locales with
 * IDENTICAL key sets. A missing key fails CI.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MESSAGES = join(process.cwd(), 'src', 'messages')
const LOCALES = ['en', 'ar']

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  )
}

const domains = new Set(LOCALES.flatMap((l) => readdirSync(join(MESSAGES, l))))
const failures = []

for (const domain of domains) {
  const keysByLocale = {}
  for (const locale of LOCALES) {
    try {
      keysByLocale[locale] = new Set(
        flatten(JSON.parse(readFileSync(join(MESSAGES, locale, domain), 'utf8')))
      )
    } catch {
      failures.push(`${locale}/${domain}: missing or invalid JSON`)
    }
  }
  const [en, ar] = [keysByLocale.en, keysByLocale.ar]
  if (en && ar) {
    for (const k of en) if (!ar.has(k)) failures.push(`ar/${domain}: missing key "${k}"`)
    for (const k of ar) if (!en.has(k)) failures.push(`en/${domain}: missing key "${k}"`)
  }
}

if (failures.length) {
  console.error(`I18N-COV FAILED (${failures.length}):`)
  for (const f of failures) console.error('  ' + f)
  process.exit(1)
}
console.log(`I18N-COV green — ${domains.size} domain(s), locales en/ar in sync`)
