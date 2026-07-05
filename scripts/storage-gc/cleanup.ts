#!/usr/bin/env tsx
import { readFileSync } from 'node:fs'
import { loadEnv, log, makeAdminClient, writeReport } from './common'
import {
  makeDeleter,
  makeLiveReferenceFetcher,
} from './fetchers'
import { runCleanup, renderCleanupMarkdown } from '../../src/services/storage-gc/cleanup-core'
import type { AuditReport } from '../../src/services/storage-gc/types'

interface CleanupCliArgs {
  report: string
  confirm: string
  batchSize: number
  safetyWindowDays: number
}

function parseArgs(): CleanupCliArgs {
  const args = process.argv.slice(2)
  const get = (name: string) => {
    const prefix = `--${name}=`
    const hit = args.find(a => a.startsWith(prefix))
    return hit ? hit.slice(prefix.length) : undefined
  }
  const report = get('report')
  const confirm = get('confirm')
  const batchSize = Number(get('batch-size') ?? '50')
  const safetyRaw = get('safety-days')
  const safetyWindowDays = safetyRaw ? Number(safetyRaw) : 0
  if (!report) throw new Error('Missing --report=<path> (audit report to apply)')
  if (!confirm) {
    throw new Error(
      'Missing --confirm=<integrityHash> (paste the integrityHash from the audit report)',
    )
  }
  return { report, confirm, batchSize, safetyWindowDays }
}

async function main() {
  const env = loadEnv()
  const cli = parseArgs()
  const requestedSafety = cli.safetyWindowDays || env.safetyWindowDays

  const raw = readFileSync(cli.report, 'utf8')
  const report = JSON.parse(raw) as AuditReport & { sourcesFailed?: string[] }

  if (report.sourcesFailed && report.sourcesFailed.length > 0) {
    log('[storage-gc] Report has failed reference sources:')
    for (const line of report.sourcesFailed) log('    ' + line)
    log('[storage-gc] Refusing to run cleanup — re-run audit until all sources succeed.')
    process.exit(2)
  }

  if (requestedSafety < 1) {
    log('[storage-gc] Refusing to run cleanup with safety window < 1 day.')
    process.exit(2)
  }

  const client = makeAdminClient(env)
  const liveReferenceFetcher = await makeLiveReferenceFetcher(client)
  const deleter = makeDeleter(client)

  log(
    `[storage-gc] Cleanup start · project=${env.projectRef}` +
      ` candidates=${report.safeCandidates.length}` +
      ` batch=${cli.batchSize}` +
      ` safety=${requestedSafety}d`,
  )

  const now = new Date()
  const result = await runCleanup({
    report,
    confirmationToken: cli.confirm,
    batchSize: cli.batchSize,
    safetyWindowDays: requestedSafety,
    environment: env.projectRef,
    timestamp: now,
    now,
    deleter: async identities => deleter(identities),
    liveReferenceFetcher,
    onProgress: msg => log(`    ${msg}`),
  })

  const stamp = now.toISOString().replace(/[:.]/g, '-')
  writeReport(
    env.reportsDir,
    `storage-cleanup-${stamp}.json`,
    JSON.stringify(result, null, 2),
  )
  writeReport(
    env.reportsDir,
    `storage-cleanup-${stamp}.md`,
    renderCleanupMarkdown(result),
  )
  writeReport(
    env.reportsDir,
    'storage-cleanup-latest.json',
    JSON.stringify(result, null, 2),
  )

  log(
    `[storage-gc] Deleted=${result.deleted.length}` +
      ` alreadyMissing=${result.alreadyMissing.length}` +
      ` skippedNewlyReferenced=${result.skippedNewlyReferenced.length}` +
      ` skippedSafetyChanged=${result.skippedSafetyChanged.length}` +
      ` failed=${result.failed.length}` +
      ` reclaimedBytes=${result.reclaimedBytes}`,
  )
  process.stdout.write(
    JSON.stringify({
      deleted: result.deleted.length,
      alreadyMissing: result.alreadyMissing.length,
      skippedNewlyReferenced: result.skippedNewlyReferenced.length,
      skippedSafetyChanged: result.skippedSafetyChanged.length,
      failed: result.failed.length,
      reclaimedBytes: result.reclaimedBytes,
    }) + '\n',
  )
}

main().catch(err => {
  log('[storage-gc] cleanup failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
