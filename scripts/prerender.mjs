import { chromium } from 'playwright'
import { preview } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

async function prerender() {
  if (process.env.VERCEL) {
    console.log('Skipping prerender on Vercel — Chromium system libs unavailable in build container.')
    return
  }

  // Default to the GitHub Pages build (dist/ + /landing/); override via env for
  // the generic-host build (production/ + /) — see build-production.sh.
  const outDir = process.env.PRERENDER_OUTDIR || 'dist'
  const base = process.env.PRERENDER_BASE || '/landing/'

  const server = await preview({
    root,
    base, // override vite.config base when building for a different host
    build: { outDir }, // serve the right output folder
    preview: { port: 4174, strictPort: false, open: false },
  })

  const address = server.resolvedUrls.local[0]
  console.log(`Preview server running at ${address}`)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  try {
    const subpath = base.replace(/^\//, '') // '/landing/' -> 'landing/' ; '/' -> ''

    // Every multi-page entry: '' is the landing page (outDir/index.html),
    // 'terms/' is the Terms page (outDir/terms/index.html). Each snapshots its
    // own #root into its own built HTML.
    // The contact page snapshots its default (early-access) intent state; the
    // ?intent=talk variant is chosen client-side and needs no separate snapshot.
    const routes = ['', 'terms/', 'privacy/', 'contact/']
    for (const route of routes) {
      await page.goto(`${address}${subpath}${route}`, { waitUntil: 'networkidle', timeout: 15000 })

      const rootHtml = await page.$eval('#root', (el) => el.innerHTML)

      const indexPath = resolve(root, outDir, route, 'index.html')
      let html = readFileSync(indexPath, 'utf-8')
      html = html.replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`)
      writeFileSync(indexPath, html)

      console.log(`Pre-rendered ${outDir}/${route}index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`)
    }
  } finally {
    await browser.close()
    server.httpServer.close()
  }
}

prerender().catch((err) => {
  // Soft-fail: keep the non-prerendered dist/index.html so the deploy can still ship.
  // A flaky Playwright run shouldn't take down production; the SPA hydrates fine without SSR.
  console.error('Prerender failed — falling through to non-prerendered dist/index.html.')
  console.error(err)
})
