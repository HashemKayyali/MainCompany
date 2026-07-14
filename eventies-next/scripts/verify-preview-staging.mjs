const STAGING_REF = 'ogfgaupebcabuoczoqcy'
const PRODUCTION_REF = 'dqizzlcsioqykfeldtsj'

const deploymentUrl = process.argv[2]
if (!deploymentUrl) {
  console.log('PREVIEW_URL_MISSING')
  process.exit(1)
}

const loginUrl = new URL('/en/login', deploymentUrl)
const response = await fetch(loginUrl, { redirect: 'follow' })
console.log(`PREVIEW_HTTP_STATUS=${response.status}`)
if (!response.ok) process.exit(1)

const html = await response.text()
const scriptUrls = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(
  ([, source]) => new URL(source, response.url)
)

let stagingFound = html.includes(STAGING_REF)
let productionFound = html.includes(PRODUCTION_REF)

for (const scriptUrl of scriptUrls) {
  const scriptResponse = await fetch(scriptUrl)
  if (!scriptResponse.ok) continue
  const source = await scriptResponse.text()
  stagingFound ||= source.includes(STAGING_REF)
  productionFound ||= source.includes(PRODUCTION_REF)
}

console.log(stagingFound ? 'PREVIEW_STAGING_REF_FOUND' : 'PREVIEW_STAGING_REF_MISSING')
console.log(productionFound ? 'PREVIEW_PRODUCTION_REF_FOUND' : 'PREVIEW_PRODUCTION_REF_ABSENT')

if (!stagingFound || productionFound) process.exitCode = 1
