/**
 * Configuration Playwright : l'application compilée est lancée en mode test local
 * (comptes fictifs, modèle simulé) sur une base PostgreSQL dédiée aux E2E.
 */
import { defineConfig, devices } from '@playwright/test'

const port = 3100
const baseURL = `http://localhost:${port}`
const e2eDatabaseUrl = process.env.E2E_DATABASE_URL ?? 'postgresql://twin:twin_local_password@localhost:5432/twin_e2e'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  globalSetup: './tests/e2e/support/globalSetup.ts',
  globalTeardown: './tests/e2e/support/globalTeardown.ts',
  use: {
    baseURL,
    locale: 'fr-FR',
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /responsive\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: {
    command: 'npx prisma migrate deploy && node .output/server/index.mjs',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(port),
      DATABASE_URL: e2eDatabaseUrl,
      NUXT_SITE_URL: baseURL,
      NUXT_PUBLIC_TEST_MODE: 'true',
      NUXT_SESSION_PASSWORD: 'e2e-session-password-not-secret-0123456789',
      NUXT_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
      NUXT_ANTHROPIC_API_KEY: '',
      NUXT_AI_RATE_LIMIT_PER_MINUTE: '100',
    },
  },
})
