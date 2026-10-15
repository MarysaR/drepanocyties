/**
 * Fixture Playwright : chaque test crée ses propres comptes de test (vides) et les efface
 * à la fin via la fonction réelle de suppression des données. Rien ne subsiste après le test.
 */
import { test as base, expect, request as playwrightRequest } from '@playwright/test'
import { testIdentityFor } from './journeys'

interface TestAccounts {
  create(persona: 'mary' | 'aicha'): string
}

export const test = base.extend<{ accounts: TestAccounts }>({
  accounts: async ({ baseURL }, use) => {
    const created: string[] = []
    await use({
      create(persona) {
        const identity = testIdentityFor(persona)
        created.push(identity)
        return identity
      },
    })

    for (const testIdentity of created) {
      const context = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL! } })
      const login = await context.post('/api/identity/test-login', { data: { testIdentity } })
      expect(login.ok()).toBe(true)
      const erase = await context.post('/api/privacy/erase', { data: { confirmation: 'SUPPRIMER' } })
      expect(erase.ok()).toBe(true)
      await context.dispose()
    }
  },
})

export { expect }
