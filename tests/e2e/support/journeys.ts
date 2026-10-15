/**
 * Étapes réutilisables des parcours E2E.
 */
import { expect, type Page } from '@playwright/test'

/**
 * Identifiant de test unique : les personas (Mary, Aïcha) n'existent que dans les tests,
 * et chaque test crée ses propres comptes vides dans la base E2E dédiée.
 */
export function testIdentityFor(persona: 'mary' | 'aicha'): string {
  return `e2e-${persona}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function signInAs(page: Page, testIdentity: string): Promise<void> {
  await page.goto('/connexion/test')
  await page.getByLabel('Identifiant de test').fill(testIdentity)
  await page.getByRole('button', { name: 'Se connecter (test)' }).click()
  await expect(page).toHaveURL(/tableau-de-bord/)
}

export async function signOut(page: Page): Promise<void> {
  const menuToggle = page.getByRole('button', { name: 'Menu' })
  if (await menuToggle.isVisible()) await menuToggle.click()
  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL(/\/$/)
}

export async function grantAllConsents(page: Page): Promise<void> {
  await page.goto('/confidentialite')
  for (const title of ['Discuter avec votre jumeau', 'Mémoire d’une conversation à l’autre']) {
    const card = page.getByRole('article', { name: title })
    await card.getByRole('button', { name: 'J’accepte' }).click()
    await expect(card.getByText('Accordé', { exact: true })).toBeVisible()
  }
}

export async function sendMessage(page: Page, content: string): Promise<void> {
  await page.getByLabel('Votre message').fill(content)
  await page.getByRole('button', { name: 'Envoyer' }).click()
  await expect(page.getByRole('log').getByText(content)).toBeVisible()
}

export function lastTwinReply(page: Page) {
  return page.getByRole('log').getByRole('listitem').filter({ hasText: 'Votre jumeau' }).last()
}
