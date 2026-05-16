import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173/landing/'
const VW = 1440
const VH = 900

// PadX must mirror the JS: clamp(20px, 5vw, 80px) on a 1440 viewport = 72px.
const PAD_X = Math.max(20, Math.min(80, 0.05 * VW))
const TARGET_WIDTH = VW - 2 * PAD_X

test.use({ viewport: { width: VW, height: VH } })

async function snapshot(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.hero-video-card') as HTMLElement
    const row = document.querySelector('.hero-bottom-row') as HTMLElement
    const next = document.querySelector('.care-journey') as HTMLElement
    const cardRect = card?.getBoundingClientRect()
    const rowRect = row?.getBoundingClientRect()
    const nextRect = next?.getBoundingClientRect()
    const computed = card ? window.getComputedStyle(card) : null
    return {
      scrollY: window.scrollY,
      vw: window.innerWidth,
      vh: window.innerHeight,
      card: cardRect && {
        top: Math.round(cardRect.top),
        left: Math.round(cardRect.left),
        width: Math.round(cardRect.width),
        height: Math.round(cardRect.height),
        bottom: Math.round(cardRect.bottom),
      },
      cardCss: computed && {
        position: computed.position,
        top: computed.top,
        transform: computed.transform,
      },
      row: rowRect && { top: Math.round(rowRect.top), bottom: Math.round(rowRect.bottom), height: Math.round(rowRect.height) },
      next: nextRect && { top: Math.round(nextRect.top), bottom: Math.round(nextRect.bottom) },
    }
  })
}

test('hero video scrub', async ({ page }) => {
  await page.goto(BASE)
  // Disable Lenis smoothing so window.scrollTo lands instantly.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }' })
  await page.waitForLoadState('networkidle')
  // Wait an extra tick for ScrollTrigger to compute positions.
  await page.waitForTimeout(500)

  const initial = await snapshot(page)
  console.log('INITIAL', JSON.stringify(initial, null, 2))

  // Scroll through the entire scroll-zone in steps, log card geometry each step.
  const heroHeight = await page.evaluate(() => (document.querySelector('.hero') as HTMLElement).getBoundingClientRect().height)
  console.log('hero total height:', heroHeight)

  for (const fraction of [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.05, 1.15]) {
    const y = Math.round(heroHeight * fraction)
    await page.evaluate((Y) => window.scrollTo(0, Y), y)
    await page.waitForTimeout(300)
    const s = await snapshot(page)
    console.log(`SCROLL ${y} (frac ${fraction})`, JSON.stringify({ card: s.card, transform: s.cardCss?.transform, next: s.next, row: s.row }))
  }
})
