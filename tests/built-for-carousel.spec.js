import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true })

test.describe('Built-for carousel on mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/landing/')
  })

  test('carousel track element exists with scroll animation', async ({ page }) => {
    const track = page.locator('.built-for-h-track')
    await expect(track).toBeVisible({ timeout: 5000 })

    // Verify it has the scroll animation applied via CSS
    const animation = await track.evaluate(el => {
      const style = getComputedStyle(el)
      return style.animationName
    })
    expect(animation).toContain('built-for-scroll')
  })

  test('carousel becomes visible after animation delay', async ({ page }) => {
    const viewport = page.locator('.built-for-h-viewport')
    // Initially opacity is 0, after ~1.35s it should be 1
    await page.waitForTimeout(2000)
    const opacity = await viewport.evaluate(el => getComputedStyle(el).opacity)
    expect(Number(opacity)).toBe(1)
  })

  test('carousel track is actively scrolling (not frozen)', async ({ page }) => {
    const track = page.locator('.built-for-h-track')
    // Wait for animation to start (delay is 1.35s)
    await page.waitForTimeout(2000)

    // Sample the transform at two points 500ms apart
    const getTransform = () => track.evaluate(el => {
      const matrix = getComputedStyle(el).transform
      return matrix
    })

    const t1 = await getTransform()
    await page.waitForTimeout(500)
    const t2 = await getTransform()

    // If the carousel is scrolling, the transform matrix must differ
    expect(t1).not.toBe(t2)
  })

  test('vertical line grows in via CSS animation', async ({ page }) => {
    const line = page.locator('.built-for-line-v')
    await expect(line).toBeVisible({ timeout: 3000 })

    // After the line-grow animation (0.25s delay + 0.8s duration ≈ 1.05s)
    await page.waitForTimeout(1500)
    const height = await line.evaluate(el => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThanOrEqual(38) // should be ~40px
  })

  test('carousel contains expected items', async ({ page }) => {
    const items = page.locator('.built-for-h-item')
    // TRIPLED = 7 items × 3 = 21
    await expect(items).toHaveCount(21)
    await expect(items.first()).toHaveText('Brokers')
  })
})
