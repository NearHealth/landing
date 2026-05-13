/**
 * Breakpoint audit — finds layout issues (overflow, clipped content, nav
 * overlap, etc.) at seven target viewports and writes a self-contained
 * HTML report to test-results/breakpoint-audit/report.html
 */

import { test, chromium } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// ─── config ────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5173'

const VIEWPORTS = [
  { label: '390 × 844 — Mobile portrait',  width: 390,  height: 844  },
  { label: '844 × 390 — Mobile landscape', width: 844,  height: 390  },
  { label: '768 × 1024 — Tablet portrait', width: 768,  height: 1024 },
  { label: '1024 × 768 — Tablet landscape',width: 1024, height: 768  },
  { label: '1440 × 900 — Desktop HD',      width: 1440, height: 900  },
  { label: '1920 × 1080 — Desktop FHD',    width: 1920, height: 1080 },
  { label: '2560 × 1440 — Desktop QHD',    width: 2560, height: 1440 },
]

/** CSS selectors for each named section to audit individually */
const SECTIONS = [
  { name: 'Navbar',          sel: 'nav, [class*="navbar"], [class*="Navbar"]' },
  { name: 'Hero',            sel: '[class*="hero"], [class*="Hero"]' },
  { name: 'CareJourney',     sel: '[class*="care-journey"], [class*="CareJourney"], [class*="careJourney"]' },
  { name: 'MemberExperience',sel: '[class*="member-experience"], [class*="MemberExperience"], [class*="memberExperience"]' },
  { name: 'HowItWorks',      sel: '[class*="how-it-works"], [class*="HowItWorks"], [class*="howItWorks"]' },
  { name: 'PostEnrollment',  sel: '[class*="post-enrollment"], [class*="PostEnrollment"], [class*="postEnrollment"]' },
  { name: 'OnePlatform',     sel: '[class*="one-platform"], [class*="OnePlatform"], [class*="onePlatform"]' },
  { name: 'RealWorld',       sel: '[class*="real-world"], [class*="RealWorld"], [class*="realWorld"]' },
  { name: 'ShapedSection',   sel: '[class*="shaped"], [class*="ShapedSection"]' },
  { name: 'CareConnected',   sel: '[class*="care-connected"], [class*="CareConnected"], [class*="careConnected"]' },
  { name: 'FooterCta',       sel: '[class*="footer-cta"], [class*="FooterCta"], [class*="footerCta"]' },
  { name: 'Footer',          sel: 'footer, [class*="footer"]:not([class*="cta"]):not([class*="wrap"])' },
]

// ─── helpers ───────────────────────────────────────────────────────────────

type Issue = {
  element: string
  type: string
  detail: string
  rect?: { x: number; y: number; w: number; h: number }
}

/** Run in the browser to find layout issues on the current page */
async function detectIssues(page: import('@playwright/test').Page): Promise<Issue[]> {
  return page.evaluate(() => {
    const issues: { element: string; type: string; detail: string; rect?: { x: number; y: number; w: number; h: number } }[] = []
    const vw = document.documentElement.clientWidth

    // Carousels / marquees intentionally position their track and cloned items
    // outside the viewport — skip any element that is a descendant of one.
    const CAROUSEL_PATTERN = /carousel|marquee|ticker|built-for-h-track|built-for-h-viewport/i
    function isInsideCarousel(el: Element): boolean {
      let cur: Element | null = el
      while (cur) {
        const cls = typeof cur.className === 'string' ? cur.className : ''
        if (CAROUSEL_PATTERN.test(cls)) return true
        cur = cur.parentElement
      }
      return false
    }

    // 1 – horizontal body overflow
    const bodyScrollW = document.documentElement.scrollWidth
    if (bodyScrollW > vw + 2) {
      issues.push({
        element: '<body>',
        type: 'Horizontal overflow',
        detail: `Page is ${bodyScrollW - vw}px wider than viewport (${bodyScrollW}px vs ${vw}px)`,
      })
    }

    // helper: true if el leaks outside the viewport width
    function leaksRight(el: Element) {
      const r = el.getBoundingClientRect()
      return r.right > vw + 2
    }

    function leaksLeft(el: Element) {
      const r = el.getBoundingClientRect()
      return r.left < -2
    }

    // 2 – elements that visually overflow the viewport to the right
    const all = Array.from(document.querySelectorAll('*'))
    const seen = new Set<Element>()

    for (const el of all) {
      if (seen.has(el)) continue
      if (isInsideCarousel(el)) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue

      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue

      if (leaksRight(el)) {
        seen.add(el)
        const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
        issues.push({
          element: `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}…"` : ''}>`,
          type: 'Overflows right',
          detail: `right edge at ${Math.round(r.right)}px, viewport width ${vw}px (overflows by ${Math.round(r.right - vw)}px)`,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        })
      } else if (leaksLeft(el)) {
        seen.add(el)
        const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
        issues.push({
          element: `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}…"` : ''}>`,
          type: 'Overflows left',
          detail: `left edge at ${Math.round(r.left)}px`,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        })
      }
    }

    // 3 – inline text nodes that overflow their container
    const textContainers = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, button')
    for (const el of Array.from(textContainers)) {
      if (isInsideCarousel(el)) continue
      if ((el as HTMLElement).scrollWidth > (el as HTMLElement).offsetWidth + 2) {
        const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
        issues.push({
          element: `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}…"` : ''}>`,
          type: 'Text overflow',
          detail: `scrollWidth ${(el as HTMLElement).scrollWidth}px > offsetWidth ${(el as HTMLElement).offsetWidth}px`,
        })
      }
    }

    // 4 – fixed/sticky elements that are taller than the viewport
    const fixedEls = document.querySelectorAll('*')
    for (const el of Array.from(fixedEls)) {
      const st = getComputedStyle(el)
      if (st.position === 'fixed') {
        const r = el.getBoundingClientRect()
        if (r.height > window.innerHeight && r.width > 0) {
          const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
          issues.push({
            element: `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}…"` : ''}>`,
            type: 'Fixed element too tall',
            detail: `height ${Math.round(r.height)}px > viewport ${window.innerHeight}px`,
          })
        }
      }
    }

    return issues
  })
}

/** Inject red outlines onto broken elements so they're visible in screenshots */
async function highlightIssues(page: import('@playwright/test').Page, issues: Issue[]) {
  await page.evaluate((issueList) => {
    // remove any previous highlights
    document.querySelectorAll('[data-audit-highlight]').forEach(e => e.remove())

    const overlay = document.createElement('div')
    overlay.setAttribute('data-audit-highlight', 'root')
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999'
    document.body.appendChild(overlay)

    for (const issue of issueList) {
      if (!issue.rect) continue
      const box = document.createElement('div')
      box.setAttribute('data-audit-highlight', 'box')
      box.style.cssText = `
        position: fixed;
        left: ${Math.max(0, issue.rect.x)}px;
        top: ${issue.rect.y}px;
        width: ${Math.min(issue.rect.w, window.innerWidth - Math.max(0, issue.rect.x))}px;
        height: ${issue.rect.h}px;
        border: 3px solid #ff3b3b;
        background: rgba(255,59,59,0.08);
        box-sizing: border-box;
      `
      const label = document.createElement('span')
      label.textContent = issue.type
      label.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        background: #ff3b3b;
        color: #fff;
        font: bold 11px/1.4 monospace;
        padding: 2px 5px;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      `
      box.appendChild(label)
      overlay.appendChild(box)
    }
  }, issues)
}

/** Remove highlights before moving to the next viewport */
async function clearHighlights(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-audit-highlight]').forEach(e => e.remove())
  })
}

// ─── HTML report builder ───────────────────────────────────────────────────

function buildReport(
  results: Array<{
    viewport: typeof VIEWPORTS[0]
    issues: Issue[]
    screenshotFile: string
    sectionIssues: Array<{ name: string; issues: Issue[]; screenshotFile: string | null }>
  }>
) {
  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0)

  const viewportCards = results.map(r => {
    const badge = r.issues.length === 0
      ? `<span class="badge ok">✓ No issues</span>`
      : `<span class="badge err">${r.issues.length} issue${r.issues.length > 1 ? 's' : ''}</span>`

    const issueRows = r.issues.map(i =>
      `<tr><td class="etype">${i.type}</td><td class="eelem">${i.element}</td><td>${i.detail}</td></tr>`
    ).join('')

    const sectionCards = r.sectionIssues.map(s => {
      if (s.issues.length === 0) return ''
      const img = s.screenshotFile
        ? `<img src="${path.basename(s.screenshotFile)}" loading="lazy" alt="${s.name}" class="sshot">`
        : ''
      const rows = s.issues.map(i =>
        `<tr><td class="etype">${i.type}</td><td class="eelem">${i.element}</td><td>${i.detail}</td></tr>`
      ).join('')
      return `
        <div class="section-card">
          <h4>${s.name} <span class="badge err">${s.issues.length}</span></h4>
          ${img}
          <table>${rows}</table>
        </div>`
    }).join('')

    const slug = r.viewport.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    return `
      <section class="vp-card" id="${slug}">
        <h2>${r.viewport.label} ${badge}</h2>
        <div class="vp-body">
          <a href="${path.basename(r.screenshotFile)}" target="_blank">
            <img src="${path.basename(r.screenshotFile)}" loading="lazy" alt="${r.viewport.label}" class="fullshot">
          </a>
          <div class="details">
            ${r.issues.length > 0 ? `
              <h3>All issues</h3>
              <table class="issue-table"><thead><tr><th>Type</th><th>Element</th><th>Detail</th></tr></thead>
              <tbody>${issueRows}</tbody></table>` : '<p class="no-issues">No layout issues detected.</p>'}
            ${sectionCards}
          </div>
        </div>
      </section>`
  }).join('\n')

  const nav = results.map(r => {
    const slug = r.viewport.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const cls = r.issues.length === 0 ? 'nav-ok' : 'nav-err'
    return `<a href="#${slug}" class="${cls}">${r.viewport.width}×${r.viewport.height}</a>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Near Health — Breakpoint Audit</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: system-ui, sans-serif; background: #0f0f11; color: #e4e4e7; line-height: 1.5 }
  a { color: #60a5fa }
  header { position: sticky; top: 0; z-index: 100; background: #18181b; border-bottom: 1px solid #27272a;
    padding: .75rem 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap }
  header h1 { font-size: 1rem; font-weight: 700; color: #f4f4f5; margin-right: auto }
  .nav-ok  { display: inline-block; padding: .25rem .6rem; border-radius: 999px; font-size: .8rem;
    background: #14532d; color: #86efac; text-decoration: none }
  .nav-err { display: inline-block; padding: .25rem .6rem; border-radius: 999px; font-size: .8rem;
    background: #7f1d1d; color: #fca5a5; text-decoration: none }
  main { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem }
  .summary { background: #18181b; border: 1px solid #27272a; border-radius: .75rem;
    padding: 1.25rem 1.5rem; margin-bottom: 2rem }
  .summary h2 { font-size: 1.1rem; margin-bottom: .5rem }
  .summary p { color: #a1a1aa; font-size: .9rem }
  .vp-card { margin-bottom: 3rem; background: #18181b; border: 1px solid #27272a;
    border-radius: .75rem; overflow: hidden }
  .vp-card h2 { padding: 1rem 1.5rem; background: #27272a; font-size: 1rem; display: flex;
    align-items: center; gap: .75rem }
  .vp-body { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; padding: 1.5rem }
  @media (max-width: 900px) { .vp-body { grid-template-columns: 1fr } }
  .fullshot { width: 100%; border-radius: .5rem; border: 1px solid #3f3f46; display: block }
  .badge { display: inline-block; padding: .2rem .55rem; border-radius: 999px;
    font-size: .75rem; font-weight: 600 }
  .badge.ok  { background: #14532d; color: #86efac }
  .badge.err { background: #7f1d1d; color: #fca5a5 }
  .details h3 { font-size: .9rem; color: #a1a1aa; margin: 1rem 0 .5rem }
  .issue-table { width: 100%; border-collapse: collapse; font-size: .8rem }
  .issue-table th { text-align: left; padding: .4rem .75rem; background: #27272a;
    color: #a1a1aa; font-weight: 600; white-space: nowrap }
  .issue-table td { padding: .35rem .75rem; border-bottom: 1px solid #27272a;
    vertical-align: top; word-break: break-all }
  .etype { white-space: nowrap; color: #fca5a5; font-weight: 600 }
  .eelem { white-space: nowrap; color: #93c5fd; font-family: monospace }
  .no-issues { color: #86efac; font-size: .85rem; padding: .5rem 0 }
  .section-card { margin-top: 1.5rem; border: 1px solid #3f3f46; border-radius: .5rem;
    overflow: hidden }
  .section-card h4 { padding: .6rem 1rem; background: #27272a; font-size: .85rem;
    display: flex; align-items: center; gap: .5rem }
  .section-card table { width: 100%; border-collapse: collapse; font-size: .78rem }
  .section-card td { padding: .3rem .75rem; border-bottom: 1px solid #27272a;
    vertical-align: top; word-break: break-all }
  .sshot { width: 100%; display: block; max-height: 300px; object-fit: cover;
    border-bottom: 1px solid #3f3f46 }
</style>
</head>
<body>
<header>
  <h1>Near Health — Breakpoint Audit (${new Date().toLocaleDateString()})</h1>
  ${nav}
</header>
<main>
  <div class="summary">
    <h2>Summary</h2>
    <p>${totalIssues === 0
      ? 'No layout issues detected across all viewports.'
      : `${totalIssues} issue${totalIssues > 1 ? 's' : ''} found across ${results.filter(r => r.issues.length > 0).length} viewport${results.filter(r => r.issues.length > 0).length > 1 ? 's' : ''}.`}</p>
  </div>
  ${viewportCards}
</main>
</body>
</html>`
}

// ─── test ──────────────────────────────────────────────────────────────────

test('breakpoint layout audit', async () => {
  const outDir = path.resolve('test-results/breakpoint-audit')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const results: Parameters<typeof buildReport>[0] = []

  for (const vp of VIEWPORTS) {
    console.log(`\n▶  ${vp.label}`)

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    // Disable CSS animations so screenshots are stable
    await page.addInitScript(() => {
      const style = document.createElement('style')
      style.textContent = `*, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }`
      document.head?.appendChild(style)
    })

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 })

    // Let JS hydrate / fonts load
    await page.waitForTimeout(600)

    // ── full-page scan ─────────────────────────────────────────────────────
    const issues = await detectIssues(page)
    if (issues.length > 0) {
      await highlightIssues(page, issues.filter(i => i.rect))
    }

    const slug = `${vp.width}x${vp.height}`
    const fullshotFile = path.join(outDir, `${slug}-full.png`)
    await page.screenshot({ path: fullshotFile, fullPage: true })
    await clearHighlights(page)

    console.log(`   Issues: ${issues.length}`)
    issues.forEach(i => console.log(`   • [${i.type}] ${i.element} — ${i.detail}`))

    // ── per-section scan ───────────────────────────────────────────────────
    const sectionIssues: (typeof results)[0]['sectionIssues'] = []

    for (const sec of SECTIONS) {
      const el = await page.$(sec.sel)
      if (!el) {
        sectionIssues.push({ name: sec.name, issues: [], screenshotFile: null })
        continue
      }

      // Scroll the section into view and check its sub-elements for overflow
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)

      const secIssues = await page.evaluate((selector) => {
        const root = document.querySelector(selector)
        if (!root) return []
        const issues: { element: string; type: string; detail: string; rect?: { x: number; y: number; w: number; h: number } }[] = []
        const vw = document.documentElement.clientWidth

        const CAROUSEL_PATTERN = /carousel|marquee|ticker|built-for-h-track|built-for-h-viewport/i
        function isInsideCarousel(el: Element): boolean {
          let cur: Element | null = el
          while (cur) {
            const cls = typeof cur.className === 'string' ? cur.className : ''
            if (CAROUSEL_PATTERN.test(cls)) return true
            cur = cur.parentElement
          }
          return false
        }

        for (const el of Array.from(root.querySelectorAll('*'))) {
          if (isInsideCarousel(el)) continue
          const st = getComputedStyle(el)
          if (st.display === 'none' || st.visibility === 'hidden') continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 && r.height === 0) continue
          if (r.right > vw + 2) {
            const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
            issues.push({
              element: `<${el.tagName.toLowerCase()}${cls ? ` .${cls}` : ''}>`,
              type: 'Overflows right',
              detail: `right ${Math.round(r.right)}px (vw ${vw}px, overflow ${Math.round(r.right - vw)}px)`,
              rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
            })
          }
          if ((el as HTMLElement).scrollWidth > (el as HTMLElement).offsetWidth + 2) {
            const cls = (el.className && typeof el.className === 'string') ? el.className.trim().split(' ')[0] : ''
            issues.push({
              element: `<${el.tagName.toLowerCase()}${cls ? ` .${cls}` : ''}>`,
              type: 'Scroll overflow',
              detail: `scrollW ${(el as HTMLElement).scrollWidth} > offsetW ${(el as HTMLElement).offsetWidth}`,
            })
          }
        }
        return issues
      }, sec.sel)

      let sectionScreenshotFile: string | null = null
      if (secIssues.length > 0) {
        await highlightIssues(page, secIssues.filter(i => i.rect))
        sectionScreenshotFile = path.join(outDir, `${slug}-${sec.name.toLowerCase()}.png`)
        try {
          const bb = await el.boundingBox()
          if (bb) {
            // screenshot a viewport-tall clip around the section
            await page.screenshot({
              path: sectionScreenshotFile,
              clip: {
                x: 0,
                y: Math.max(0, bb.y),
                width: vp.width,
                height: Math.min(bb.height + 60, 1200),
              },
            })
          } else {
            await page.screenshot({ path: sectionScreenshotFile, fullPage: false })
          }
        } catch {
          sectionScreenshotFile = null
        }
        await clearHighlights(page)
      }

      sectionIssues.push({ name: sec.name, issues: secIssues, screenshotFile: sectionScreenshotFile })
    }

    results.push({ viewport: vp, issues, screenshotFile: fullshotFile, sectionIssues })
    await context.close()
  }

  await browser.close()

  // ── write HTML report ────────────────────────────────────────────────────
  const reportHtml = buildReport(results)
  const reportPath = path.join(outDir, 'report.html')
  fs.writeFileSync(reportPath, reportHtml, 'utf-8')

  console.log(`\n✅  Report written to ${reportPath}`)

  // Print a summary table
  console.log('\n┌──────────────────────────────────┬─────────┐')
  console.log('│ Viewport                         │ Issues  │')
  console.log('├──────────────────────────────────┼─────────┤')
  for (const r of results) {
    const label = r.viewport.label.padEnd(32)
    const count = String(r.issues.length).padStart(7)
    console.log(`│ ${label} │ ${count} │`)
  }
  console.log('└──────────────────────────────────┴─────────┘')
})
