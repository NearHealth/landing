import { chromium } from 'playwright'
import { preview } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Regenerates the 1200×630 social-share image (public/assets/images/og-image.png)
// by screenshotting the built hero. Screenshots the PREVIEW build (not dev) so the
// DEV-only GradientTuner / GridOverlay overlays never leak into the card. Run via
// `npm run og:snapshot` (builds dist first). The image URL in index.html's og:image
// is rewritten to https://near.health by scripts/fix-production-urls.mjs at build.

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const OUT = resolve(root, 'public/assets/images/og-image.png')

async function snapshot() {
  const base = '/landing/'
  const server = await preview({
    root,
    base,
    build: { outDir: 'dist' },
    preview: { port: 4176, strictPort: false, open: false },
  })
  const address = server.resolvedUrls.local[0]
  console.log(`Preview server running at ${address}`)

  const browser = await chromium.launch()
  // Exact OG dimensions; reduced-motion so GSAP reveals are skipped and all hero
  // content is visible (the site short-circuits animations under reduced-motion).
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })

  try {
    await page.goto(address, { waitUntil: 'load', timeout: 20000 })
    await page.evaluate(() => document.fonts.ready)

    // Force the hero video to paint a real frame — the old og-image had an empty
    // white video panel because the screenshot fired before the video decoded.
    await page.evaluate(async () => {
      const v = document.querySelector('.hero-video-card video')
      if (!v) return
      v.muted = true
      try { await v.play() } catch { /* autoplay may be blocked; seek still paints */ }
      await new Promise((res) => {
        if (v.readyState >= 2) return res()
        v.addEventListener('loadeddata', res, { once: true })
        setTimeout(res, 3000)
      })
      try {
        v.currentTime = Number.isFinite(v.duration) && v.duration > 2 ? 1.5 : 0.1
        await new Promise((res) => {
          v.addEventListener('seeked', res, { once: true })
          setTimeout(res, 1500)
        })
      } catch { /* ignore */ }
      v.pause()
    })

    await page.waitForTimeout(600)
    await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } })
    console.log(`Wrote ${OUT} (1200×630)`)
  } finally {
    await browser.close()
    server.httpServer.close()
  }
}

snapshot().catch((err) => {
  console.error('OG snapshot failed:', err)
  process.exit(1)
})
