import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/landing/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Capture top 200px so we see navbar over hero content
await page.screenshot({ path: '/tmp/navbar-debug/current.png', clip: { x: 0, y: 0, width: 1440, height: 200 } });
// Also dump computed style of .navbar
const computed = await page.evaluate(() => {
  const n = document.querySelector('.navbar');
  if (!n) return null;
  const cs = getComputedStyle(n);
  return {
    background: cs.backgroundColor,
    backdropFilter: cs.backdropFilter,
    webkitBackdropFilter: cs.webkitBackdropFilter,
    boxShadow: cs.boxShadow,
    border: cs.border,
    classList: n.className,
  };
});
console.log(JSON.stringify(computed, null, 2));
await browser.close();
