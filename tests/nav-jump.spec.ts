import { test, expect, type Page } from '@playwright/test'

// Regression tests for the navbar nav-link jumps. Two guarantees:
//
// 1. SINGLE-CLICK LANDING. Every section after the hero lives in `.post-hero`,
//    which carries a scroll-linked `translateY(--post-hero-y)` that VARIES in
//    the riser zone near the top and FREEZES past `release`. The old scrollToId
//    measured at the current scroll and teleported, so the first click from the
//    top landed ~one section early. App.jsx re-measures after the jump settles
//    into the frozen zone and corrects, so a single click lands.
//
// 2. HERO-ALIGNED GAP. scrollToId lands each section so its content start (box
//    top + the section's own padding-top) sits at the SAME viewport height as
//    the hero's "The future of…" headline (`.hero-heading`) — the same breathing
//    room below the navbar on every jump, instead of the old fixed offset that
//    stacked on top of each section's 120px padding.

const BASE = 'http://localhost:5188/landing/'
const VW = 1440
const VH = 900

test.use({ viewport: { width: VW, height: VH } })

// Wait until the hero riser geometry is measured (--post-hero-y published) and
// the scroll has settled, so the page is in the exact pre-click state a user
// sees at the top.
async function settleAtTop(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--post-hero-y')
    return v !== '' && v !== '0px' // riser active on desktop → non-zero
  }, { timeout: 5000 }).catch(() => {}) // tolerate (mobile/reduced-motion = 0px)
  await page.waitForTimeout(300)
}

// Poll until scrollY stops moving (covers the fix's 2-rAF re-measure + the
// one correcting jump). Counters are reset first so a previous settle can't
// satisfy the stillness check before the new scroll even starts.
async function waitStill(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __ly?: number; __still?: number }
    w.__ly = -1
    w.__still = 0
  })
  await page.waitForFunction(() => {
    const w = window as unknown as { __ly?: number; __still?: number }
    const y = window.scrollY
    if (w.__ly === y) { w.__still = (w.__still ?? 0) + 1 } else { w.__still = 0 }
    w.__ly = y
    return (w.__still ?? 0) > 4
  }, { timeout: 5000 })
}

// The hero heading's resting top in viewport coords at scroll 0 — the gap every
// section landing should reproduce (165 desktop / 143 mobile).
async function heroHeadingTop(page: Page) {
  return page.evaluate(() => {
    const h = document.querySelector('.hero-heading')
    return h ? Math.round(h.getBoundingClientRect().top) : null
  })
}

// A landed section's CONTENT START in viewport coords = box top + padding-top,
// measured after the scroll fully settles. This is the stable reference App.jsx
// aligns to the hero heading (the inner heading lines animate translateY on
// reveal, so they are not a stable probe; the box + padding is).
async function contentTopAfter(page: Page, click: () => Promise<void>, id: string) {
  await click()
  await waitStill(page)
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
    return Math.round(el.getBoundingClientRect().top + padTop)
  }, id)
}

const TARGETS = [
  { name: 'How it works', id: '#how-it-works', click: (page: Page) => page.locator('.nav-link', { hasText: 'How it works' }).click() },
  { name: 'Why near',     id: '#why-near',     click: (page: Page) => page.locator('.nav-link', { hasText: 'Why near' }).click() },
  { name: 'Talk to us',   id: '#care-connected', click: (page: Page) => page.locator('.nav-link', { hasText: 'Talk to us' }).click() },
  { name: 'Request a demo', id: '#contact',    click: (page: Page) => page.locator('.navbar-cta-fixed').click() },
]

for (const t of TARGETS) {
  test(`single nav click from the top lands on ${t.id} aligned to the hero gap`, async ({ page }) => {
    await page.goto(BASE)
    await settleAtTop(page)

    const heroTop = await heroHeadingTop(page)
    expect(heroTop, 'hero heading should be measurable').not.toBeNull()

    // Sanity: target is far below the fold before the click.
    const before = await page.evaluate((sel: string) => Math.round(document.querySelector(sel)!.getBoundingClientRect().top), t.id)
    expect(before, `${t.id} should start below the fold`).toBeGreaterThan(VH)

    const contentTop = await contentTopAfter(page, () => t.click(page), t.id)

    // Single-click landing: content is on-screen near the top, NOT a section
    // lower (the two-click bug) and NOT buried far down (the old big gap).
    expect(contentTop, `${t.name} → ${t.id} content landed at ${contentTop}px`).toBeGreaterThanOrEqual(0)
    expect(contentTop!).toBeLessThan(VH / 2)
    // Hero-aligned gap: content start matches the hero heading top (±6px).
    expect(Math.abs(contentTop! - heroTop!), `${t.id} content ${contentTop}px vs hero ${heroTop}px`).toBeLessThanOrEqual(6)
  })
}

// The fix's corrective second jump (~2 frames after the first) must not
// disturb any animation system on the page: the navbar's scroll-direction
// hide, the Motion whileInView reveals, or the hero's scroll-scrubbed
// geometry. These pin that behavior.
test.describe('animations unaffected by the nav jump', () => {
  const clickHowItWorks = (page: Page) => page.locator('.nav-link', { hasText: 'How it works' }).click()

  test('navbar stays visible through the jump', async ({ page }) => {
    await page.goto(BASE)
    await settleAtTop(page)
    await clickHowItWorks(page)
    await waitStill(page)
    const navbar = page.locator('nav.navbar')
    await expect(navbar).not.toHaveClass(/navbar--hidden/)
    // And no deferred hide once the 800ms nav:goto guard expires.
    await page.waitForTimeout(900)
    await expect(navbar).not.toHaveClass(/navbar--hidden/)
  })

  test('target entrance reveal replays after the jump', async ({ page }) => {
    await page.goto(BASE)
    await settleAtTop(page)
    await clickHowItWorks(page)
    // The bump() remount puts the section back in its hidden state…
    const early = await page.evaluate(() => {
      const el = document.querySelector('.how-label')
      return el ? parseFloat(getComputedStyle(el).opacity) : null
    })
    expect(early, '.how-label should exist right after the click').not.toBeNull()
    expect(early!, 'reveal should start from hidden').toBeLessThan(1)
    // …then whileInView replays the reveal to full opacity once it lands.
    await page.waitForFunction(() => {
      const el = document.querySelector('.how-label')
      return !!el && parseFloat(getComputedStyle(el).opacity) === 1
    }, { timeout: 4000 })
  })

  test('hero scrub and riser self-correct after jump + return to top', async ({ page }) => {
    const heroSnapshot = () => page.evaluate(() => {
      const card = document.querySelector('.hero-video-card-inner')
      const rect = card ? card.getBoundingClientRect() : null
      const riser = getComputedStyle(document.documentElement).getPropertyValue('--post-hero-y')
      return {
        cardW: rect ? rect.width : null,
        cardH: rect ? rect.height : null,
        riserY: parseFloat(riser) || 0,
      }
    })
    await page.goto(BASE)
    await settleAtTop(page)
    const before = await heroSnapshot()
    await clickHowItWorks(page)
    await waitStill(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    await waitStill(page)
    const after = await heroSnapshot()
    expect(before.cardW, 'hero card should be measurable at top').not.toBeNull()
    expect(Math.abs(after.cardW! - before.cardW!)).toBeLessThanOrEqual(2)
    expect(Math.abs(after.cardH! - before.cardH!)).toBeLessThanOrEqual(2)
    expect(Math.abs(after.riserY - before.riserY)).toBeLessThanOrEqual(1)
  })

  test('mid-page re-click is idempotent (no visible double jump)', async ({ page }) => {
    await page.goto(BASE)
    await settleAtTop(page)
    await clickHowItWorks(page)
    await waitStill(page)
    const firstY = await page.evaluate(() => window.scrollY)
    await clickHowItWorks(page)
    await waitStill(page)
    const secondY = await page.evaluate(() => window.scrollY)
    expect(Math.abs(secondY - firstY)).toBeLessThanOrEqual(1)
  })
})
