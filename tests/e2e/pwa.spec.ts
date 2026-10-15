import { expect, test } from '@playwright/test'

test('La PWA expose un manifeste et des icônes accessibles, et son service worker ne met rien en cache', async ({ page, request }) => {
  await page.goto('/')
  const manifestLink = page.locator('link[rel="manifest"]')
  await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest')
  await expect(manifestLink).toHaveAttribute('crossorigin', 'use-credentials')

  const manifest = await (await request.get('/manifest.webmanifest')).json() as { icons: Array<{ src: string }> }
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('image/png')
  }

  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).length > 0)
  const cacheNames = await page.evaluate(async () => caches.keys())
  expect(cacheNames).toEqual([])
})
