import { test, expect } from '@playwright/test'

// Verify the morph slider semantics:
//   morph=0 should produce a STATIC lottie (no frame-to-frame change)
//   morph=1 should produce an ANIMATED lottie (frames differ over time)
//
// Strategy: hash the canvas's pixel data at two points in time and compare.

async function canvasFingerprint(page) {
  return page.evaluate(async () => {
    const card = document.querySelector('.care-connected-card')
    if (!card) return null
    const canvas = card.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const w = canvas.width, h = canvas.height
    const sx = Math.max(0, Math.floor(w * 0.2))
    const sy = Math.max(0, Math.floor(h * 0.2))
    const sw = Math.max(1, Math.floor(w * 0.6))
    const sh = Math.max(1, Math.floor(h * 0.6))
    const data = ctx.getImageData(sx, sy, sw, sh).data
    // FNV-1a hash over every channel byte; also count non-zero alpha.
    let hash = 2166136261 >>> 0
    let nonZero = 0
    for (let i = 0; i < data.length; i++) {
      const b = data[i]
      hash ^= b
      hash = Math.imul(hash, 16777619) >>> 0
      if (b !== 0) nonZero++
    }
    return { hash, nonZero, sampled: data.length, w, h }
  })
}

async function setMorph(page, value: number) {
  const morphRow = page.locator('.lottie-debug-row', { hasText: 'morph' })
  await expect(morphRow).toBeVisible()
  const numberInput = morphRow.locator('input[type="number"]')
  await numberInput.fill(String(value))
  await numberInput.blur()
}

async function setControl(page, label: string, value: number) {
  const row = page.locator('.lottie-debug-row', { hasText: label })
  await expect(row).toBeVisible()
  const numberInput = row.locator('input[type="number"]')
  await numberInput.fill(String(value))
  await numberInput.blur()
}

// Sample N frames over `durationMs` and return the maximum pairwise hash distance.
// A larger number means the canvas is changing more dramatically over time.
async function sampleVariance(page, durationMs: number, samples: number) {
  const hashes: number[] = []
  for (let i = 0; i < samples; i++) {
    const fp = await page.evaluate(() => {
      const card = document.querySelector('.care-connected-card')
      if (!card) return null
      const canvas = card.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) return null
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      const w = canvas.width, h = canvas.height
      const sx = Math.floor(w * 0.2)
      const sy = Math.floor(h * 0.2)
      const sw = Math.floor(w * 0.6)
      const sh = Math.floor(h * 0.6)
      const data = ctx.getImageData(sx, sy, sw, sh).data
      let nonZero = 0
      let hash = 2166136261 >>> 0
      for (let i = 0; i < data.length; i++) {
        const b = data[i]
        hash ^= b
        hash = Math.imul(hash, 16777619) >>> 0
        if (b !== 0) nonZero++
      }
      return { hash, nonZero }
    })
    if (fp) hashes.push(fp.nonZero) // use nonZero pixel count — varies with shape size
    await page.waitForTimeout(durationMs / samples)
  }
  if (hashes.length < 2) return 0
  const min = Math.min(...hashes)
  const max = Math.max(...hashes)
  return max - min
}

test.describe('Lottie morph slider', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5188/')
    // Scroll the CareConnected section into view so the lottie starts playing.
    await page.locator('#care-connected').scrollIntoViewIfNeeded()
    // Wait for the canvas to exist.
    await page.waitForSelector('.care-connected-card canvas', { timeout: 10000 })
    // Wait a bit for first paint.
    await page.waitForTimeout(500)
  })

  test('morph=0 produces a STATIC lottie (consecutive frames are identical)', async ({ page }) => {
    await setMorph(page, 0)
    await page.waitForTimeout(1500)
    const a = await canvasFingerprint(page)
    expect(a).not.toBeNull()
    await page.waitForTimeout(2000)
    const b = await canvasFingerprint(page)
    console.log('[morph=0] a=', a, 'b=', b)
    // Sanity: canvas must contain visible content (not all zeros).
    expect(a!.nonZero).toBeGreaterThan(0)
    expect(b!.nonZero).toBeGreaterThan(0)
    expect(b!.hash).toBe(a!.hash)
  })

  test('morph=1 produces an ANIMATED lottie (consecutive frames differ)', async ({ page }) => {
    await setMorph(page, 1)
    await page.waitForTimeout(1500)
    const a = await canvasFingerprint(page)
    expect(a).not.toBeNull()
    await page.waitForTimeout(2000)
    const b = await canvasFingerprint(page)
    console.log('[morph=1] a=', a, 'b=', b)
    expect(a!.nonZero).toBeGreaterThan(0)
    expect(b!.nonZero).toBeGreaterThan(0)
    expect(b!.hash).not.toBe(a!.hash)
  })

  test('amplitude=3 produces noticeably more variation than amplitude=1', async ({ page }) => {
    await setControl(page, 'morph', 1)
    await setControl(page, 'expandX', 1)
    await setControl(page, 'expandY', 1)
    await setControl(page, 'ampl', 1)
    await page.waitForTimeout(1500)
    const baselineVariance = await sampleVariance(page, 4000, 8)

    await setControl(page, 'ampl', 3)
    await page.waitForTimeout(1500)
    const boostedVariance = await sampleVariance(page, 4000, 8)

    console.log('[amplitude] baseline=', baselineVariance, 'boosted=', boostedVariance)
    expect(boostedVariance).toBeGreaterThan(baselineVariance)
  })

  test('amplitude affects mid-playback frames (not just initial)', async ({ page }) => {
    // Use the user's actual default values (morph=0.65, expand=1.45) and compare
    // ampl=1 vs ampl=3 sampled across the animation timeline.
    await setControl(page, 'morph', 0.65)
    await setControl(page, 'expandX', 1.45)
    await setControl(page, 'expandY', 1.45)
    await setControl(page, 'ampl', 1)
    await page.waitForTimeout(2000)
    const a1 = await sampleVariance(page, 5000, 10)

    await setControl(page, 'ampl', 3)
    await page.waitForTimeout(2000)
    const a3 = await sampleVariance(page, 5000, 10)

    console.log('[user-defaults] ampl=1 variance=', a1, '  ampl=3 variance=', a3)
    // If amplitude only affected the initial paused frame, both variances would be similar.
    // A significantly higher variance at ampl=3 confirms it's affecting frames during playback.
    expect(a3).toBeGreaterThan(a1 * 1.5)
  })
})
