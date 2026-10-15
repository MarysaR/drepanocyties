/**
 * Configuration Vitest : tests unitaires (sans infrastructure)
 * et tests d'intégration (PostgreSQL réel, base dédiée).
 */
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const alias = {
  '@domains': fromRoot('./src/domains'),
  '@shared': fromRoot('./src/shared'),
  '@composition': fromRoot('./src/composition'),
}

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], environment: 'node' },
      },
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          globalSetup: ['tests/integration/support/globalSetup.ts'],
          fileParallelism: false,
          testTimeout: 20_000,
        },
      },
    ],
  },
})
