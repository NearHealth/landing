import { test } from '@playwright/test'

const BASE = 'http://localhost:5173/landing/'
test.use({ viewport: { width: 1440, height: 900 } })

test('overlap screenshots', async ({ page }) => {
  await page.goto(BASE)
  await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0.01ms !important; }' })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  // 1) Initial
  await page.screenshot({ path: 'test-results/01-initial.png' })

  // 2) Mid-scrub.
  await page.evaluate(() => window.scrollTo(0, 713))
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'test-results/02-mid-scrub.png' })

  // 3) Full scale at sticky release.
  await page.evaluate(() => window.scrollTo(0, 1000))
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'test-results/03-full-release.png' })

  // 4) Card scrolling with row.
  await page.evaluate(() => window.scrollTo(0, 1300))
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'test-results/04-post-release.png' })

  // 5) Card scrolling out, next section approaching.
  await page.evaluate(() => window.scrollTo(0, 1500))
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'test-results/05-next-section.png' })
})
