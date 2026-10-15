/// <reference lib="dom" />
import { expect, test } from './support/testAccounts'
import { signInAs } from './support/journeys'

test('Navigation repliable et utilisable sur mobile', async ({ page, accounts }) => {
  await signInAs(page, accounts.create('aicha'))
  const toggle = page.getByRole('button', { name: 'Menu' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await page.getByRole('navigation').getByRole('link', { name: 'Journal', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible()
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(hasHorizontalOverflow).toBe(false)
})
