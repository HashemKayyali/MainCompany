import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'public')
const WARN_BYTES = 500 * 1024

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function detectFormat(buffer) {
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'gif'
  return 'unknown'
}

function normalizedExtension(file) {
  const ext = path.extname(file).slice(1).toLowerCase()
  return ext === 'jpeg' ? 'jpg' : ext
}

const imageExtensions = new Set(['webp', 'png', 'jpg', 'jpeg', 'gif'])
const mismatches = []
const large = []

for (const file of walk(ROOT)) {
  const ext = path.extname(file).slice(1).toLowerCase()
  if (!imageExtensions.has(ext)) continue

  const stat = fs.statSync(file)
  const header = Buffer.alloc(16)
  const fd = fs.openSync(file, 'r')
  fs.readSync(fd, header, 0, header.length, 0)
  fs.closeSync(fd)

  const detected = detectFormat(header)
  if (detected !== 'unknown' && detected !== normalizedExtension(file)) {
    mismatches.push({ file: path.relative(process.cwd(), file), ext: normalizedExtension(file), detected })
  }
  if (stat.size > WARN_BYTES) {
    large.push({ file: path.relative(process.cwd(), file), size: stat.size })
  }
}

console.log(`Image audit: ${mismatches.length} format mismatch(es), ${large.length} file(s) over ${Math.round(WARN_BYTES / 1024)} KB.`)

if (mismatches.length) {
  console.error('\nExtension/content mismatches:')
  for (const item of mismatches) console.error(`- ${item.file}: .${item.ext} contains ${item.detected.toUpperCase()} data`)
}

if (large.length) {
  console.warn('\nLarge image files:')
  for (const item of large.sort((a, b) => b.size - a.size)) console.warn(`- ${(item.size / 1024).toFixed(0)} KB  ${item.file}`)
}

if (mismatches.length) process.exitCode = 1
