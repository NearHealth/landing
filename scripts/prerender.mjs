import { chromium } from 'playwright'
import { preview } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

async function prerender() {
  const server = await preview({
    root,
    preview: { port: 4174, strictPort: false, open: false },
  })

  const address = server.resolvedUrls.local[0]
  console.log(`Preview server running at ${address}`)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  await page.goto(`${address}landing/`, { waitUntil: 'networkidle', timeout: 15000 })

  const rootHtml = await page.$eval('#root', (el) => el.innerHTML)

  await browser.close()
  server.httpServer.close()

  const indexPath = resolve(root, 'dist/index.html')
  let html = readFileSync(indexPath, 'utf-8')
  html = html.replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`)
  writeFileSync(indexPath, html)

  console.log(`Pre-rendered dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
