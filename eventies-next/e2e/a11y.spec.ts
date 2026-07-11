import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * A11Y-010 — axe CI gate: fails on critical violations. The template set
 * grows to the top-8 as P2 pages land; P1 covers every page that exists.
 */

const PAGES = ['/']

for (const path of PAGES) {
  test(`axe: no critical violations on ${path}`, async ({ page }, testInfo) => {
    const pathPrefix = (testInfo.project.metadata.pathPrefix as string) ?? ''
    await page.goto(pathPrefix + path)

    const results = await new AxeBuilder({ page }).analyze()
    const critical = results.violations.filter((v) => v.impact === 'critical')
    expect(
      critical,
      critical.map((v) => `${v.id}: ${v.help}`).join('\n')
    ).toEqual([])
  })
}
