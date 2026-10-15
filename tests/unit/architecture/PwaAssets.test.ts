/**
 * Garde-fous de la PWA : manifeste installable, icônes présentes et aux bonnes dimensions,
 * et service worker qui ne met aucune donnée en cache.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const publicDirectory = join(import.meta.dirname, '../../../public')
const manifest = JSON.parse(readFileSync(join(publicDirectory, 'manifest.webmanifest'), 'utf8')) as {
  name: string; start_url: string; scope: string; display: string; theme_color: string
  icons: Array<{ src: string; sizes: string; type: string; purpose: string }>
}

function pngSize(path: string): string {
  const buffer = readFileSync(path)
  expect(buffer.subarray(1, 4).toString('ascii')).toBe('PNG')
  return `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`
}

describe('PWA', () => {
  it('déclare un manifeste installable en mode standalone', () => {
    expect(manifest).toMatchObject({ name: 'Drepa', start_url: '/', scope: '/', display: 'standalone', theme_color: '#3b1263' })
  })

  it('fournit des icônes 192, 512 et maskable, aux dimensions annoncées', () => {
    expect(manifest.icons.map(icon => icon.purpose)).toEqual(expect.arrayContaining(['any', 'maskable']))
    expect(manifest.icons.some(icon => icon.sizes === '192x192')).toBe(true)
    expect(manifest.icons.some(icon => icon.sizes === '512x512')).toBe(true)
    for (const icon of manifest.icons) expect(pngSize(join(publicDirectory, icon.src))).toBe(icon.sizes)
  })

  it('utilise un service worker qui ne met rien en cache et n’intercepte aucune requête', () => {
    const worker = readFileSync(join(publicDirectory, 'sw.js'), 'utf8')
    expect(worker).not.toMatch(/caches\.(open|match)|\.addAll\(|\.put\(|respondWith|importScripts/)
    expect(worker).toMatch(/addEventListener\('fetch'/)
  })
})
