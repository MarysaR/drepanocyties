// Génère les icônes PNG de la PWA depuis public/icons/icon.svg (rendu par Chromium via Playwright).
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url), 'utf8')
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512, 'apple-touch-icon.png': 180 }

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined })
const page = await browser.newPage()
for (const [name, size] of Object.entries(sizes)) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), await page.screenshot({ type: 'png' }))
}
await browser.close()
