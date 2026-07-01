import { test, expect } from '@playwright/test'

// e2e coverage for the reusable <ContactForm/> on the /contact page (FR KKADA9).
// Submission is the page's simulated round-trip (~900ms; ?fail=1 forces the
// system-error path), so these specs exercise the form's own behaviour, not a
// real backend. Runs under both the Desktop (1440) and Mobile (430) projects.

const BASE = 'http://localhost:5188/landing/contact/'

async function fillValid(page) {
  await page.fill('#first', 'Jane')
  await page.fill('#last', 'Doe')
  await page.fill('#email', 'jane@acme.com')
  await page.click('#organizationType')
  await page.getByRole('option', { name: 'Broker', exact: true }).click()
  await page.click('#partnershipType')
  await page.getByRole('option', { name: 'Early access', exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
})

test('empty submit shows field errors, a summary, and focuses the first invalid field', async ({ page }) => {
  await page.getByRole('button', { name: /submit interest/i }).click()
  await expect(page.locator('.fld-error').first()).toBeVisible()
  await expect(page.locator('.contact-form__summary')).toBeVisible()
  await expect(page.locator('#first')).toBeFocused()
})

test('an invalid email reports a specific message', async ({ page }) => {
  await page.fill('#email', 'not-an-email')
  await page.locator('#email').blur()
  await expect(page.locator('#email-error')).toHaveText(/valid email/i)
})

test('partnership type is disabled until an organization type is chosen, and resets when it changes', async ({ page }) => {
  await expect(page.locator('#partnershipType')).toBeDisabled()

  await page.click('#organizationType')
  await page.getByRole('option', { name: 'Broker', exact: true }).click()
  await expect(page.locator('#partnershipType')).toBeEnabled()

  await page.click('#partnershipType')
  await page.getByRole('option', { name: 'Early access', exact: true }).click()
  await expect(page.locator('#partnershipType')).toContainText('Early access')

  // Changing the organization type resets the dependent partnership selection.
  await page.click('#organizationType')
  await page.getByRole('option', { name: 'Provider', exact: true }).click()
  await expect(page.locator('#partnershipType')).not.toContainText('Early access')
})

test('a valid submit shows the loading state then swaps to the thank-you panel', async ({ page }) => {
  await fillValid(page)
  const submit = page.getByRole('button', { name: /submit interest/i })
  await submit.click()
  // In-flight: button disabled (double-submit protection) + loading class.
  await expect(submit).toBeDisabled()
  await expect(submit).toHaveClass(/is-loading/)
  // Resolves → page swaps hero+form for the thank-you panel (with the redirect timer).
  await expect(page.locator('.contact-thanks')).toBeVisible()
  await expect(page.locator('.contact-thanks h1')).toHaveText(/thank you/i)
  await expect(page.locator('.contact-thanks__timer')).toContainText(/redirecting/i)
})

test('a failed submit shows a system error and preserves the entered input', async ({ page }) => {
  await page.goto(`${BASE}?fail=1`, { waitUntil: 'networkidle' })
  await fillValid(page)
  await page.getByRole('button', { name: /submit interest/i }).click()
  await expect(page.locator('.contact-form__system')).toBeVisible()
  // Input is preserved, not wiped.
  await expect(page.locator('#first')).toHaveValue('Jane')
  await expect(page.locator('#email')).toHaveValue('jane@acme.com')
})

test('the honeypot is hidden from assistive tech and keyboard', async ({ page }) => {
  const hp = page.locator('.contact-form__hp')
  await expect(hp).toHaveAttribute('aria-hidden', 'true')
  await expect(hp).toHaveAttribute('tabindex', '-1')
})

test('a filled honeypot is dropped without the loading round-trip', async ({ page }) => {
  await fillValid(page)
  // Simulate a bot filling the off-screen trap field.
  await page.locator('.contact-form__hp').fill('http://spam.example', { force: true })
  await page.getByRole('button', { name: /submit interest/i }).click()
  // Bot path swaps straight to the thank-you panel with no in-flight loading state.
  await expect(page.locator('.contact-thanks')).toBeVisible()
})

test('rows are two-column on wide viewports and stacked on narrow ones', async ({ page, viewport }) => {
  const first = await page.locator('#first').boundingBox()
  const last = await page.locator('#last').boundingBox()
  if (viewport.width > 600) {
    expect(Math.abs(first.y - last.y)).toBeLessThan(8) // same row
    expect(last.x).toBeGreaterThan(first.x)            // side by side
  } else {
    expect(last.y).toBeGreaterThan(first.y + 10)       // stacked
  }
})
