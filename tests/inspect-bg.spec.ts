import { test } from '@playwright/test'

const BASE = 'http://localhost:5173/landing/'
test.use({ viewport: { width: 1440, height: 900 } })

test('inspect backgrounds', async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  const info = await page.evaluate(() => {
    const html = getComputedStyle(document.documentElement)
    const body = getComputedStyle(document.body)
    const before = getComputedStyle(document.body, '::before')
    const careJourney = document.querySelector('.care-journey') as HTMLElement
    const cj = careJourney ? getComputedStyle(careJourney) : null
    return {
      html: { bg: html.background, bgColor: html.backgroundColor, bgImage: html.backgroundImage },
      body: { bg: body.background, bgColor: body.backgroundColor, bgImage: body.backgroundImage },
      bodyBefore: { content: before.content, position: before.position, zIndex: before.zIndex, bgImage: before.backgroundImage },
      careJourney: cj && { bg: cj.background, position: cj.position, zIndex: cj.zIndex },
    }
  })
  console.log(JSON.stringify(info, null, 2))
})
