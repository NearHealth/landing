// Rewrite hardcoded GitHub Pages URLs/paths in the production/ bundle to the real
// host. Vite's --base only rewrites paths it resolves as imports, so literal URLs
// baked into index.html / sitemap.xml / robots.txt — canonical, og:*, twitter:*,
// the sitemap <loc>, the robots Sitemap: line, and the font <link rel=preload>
// hrefs — are left pointing at nearhealth.github.io/landing. This runs after the
// build (and after prerender) so the root-domain bundle is SEO-correct.
//
// Configure via env: SITE_URL (default https://near.health), OUT_DIR (default production).
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', process.env.OUT_DIR || 'production')
const siteUrl = (process.env.SITE_URL || 'https://near.health').replace(/\/+$/, '')

// Order matters: rewrite the more specific /landing URL before the bare origin.
const replacements = [
  ['https://nearhealth.github.io/landing', siteUrl], // og:url, og:image, twitter:image, canonical, sitemap <loc>
  ['https://nearhealth.github.io', siteUrl], // bare origin (robots.txt Sitemap:)
  ['/landing/assets/', '/assets/'], // root-relative font preloads Vite didn't rewrite
]

for (const file of ['index.html', 'terms/index.html', 'privacy/index.html', 'sitemap.xml', 'robots.txt']) {
  const path = resolve(outDir, file)
  if (!existsSync(path)) continue
  const before = readFileSync(path, 'utf-8')
  let after = before
  for (const [from, to] of replacements) after = after.split(from).join(to)
  if (after !== before) {
    writeFileSync(path, after)
    console.log(`Rewrote ${file} → ${siteUrl}`)
  }
}
