/// <reference lib="dom" />
/**
 * Critère d'acceptation : à la première connexion, l'application est entièrement vierge,
 * et les premières données proviennent exclusivement des actions de la personne.
 */
import { expect, test } from './support/testAccounts'
import { signInAs } from './support/journeys'

test('Première utilisation : application vierge, puis premières données issues des seules actions de la personne', async ({ page, accounts }) => {
  await signInAs(page, accounts.create('aicha'))

  // Tableau de bord : tout est à zéro et les accords restent à décider.
  await expect(page.getByRole('heading', { name: 'Avant de commencer' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Conversations\s+0 conversation$/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Souvenirs\s+0 souvenir$/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Journal\s+Aucune entrée pour le moment/ })).toBeVisible()
  await expect(page.getByText('Reprendre là où vous en étiez')).toHaveCount(0)

  // Profil à compléter.
  await page.goto('/profil')
  await expect(page.getByLabel('Comment souhaitez-vous être appelé·e ?')).toHaveValue('')
  await expect(page.getByLabel(/Ce que vous aimeriez que le jumeau sache/)).toHaveValue('')

  // Aucun consentement accordé.
  await page.goto('/confidentialite')
  await expect(page.getByText('En attente de votre choix')).toHaveCount(2)
  await expect(page.getByText('Accordé', { exact: true })).toHaveCount(0)

  // Zéro conversation, zéro souvenir, zéro proposition, zéro entrée de journal.
  await page.goto('/conversations')
  await expect(page.getByText('Vous n’avez pas encore de conversation.')).toBeVisible()
  await page.goto('/souvenirs')
  await expect(page.getByText('Aucun souvenir pour le moment.')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Proposition de souvenir' })).toHaveCount(0)
  await page.goto('/journal')
  await expect(page.getByText('Votre journal est vide pour le moment.')).toBeVisible()

  // Rien n'est stocké côté navigateur (ni localStorage, ni sessionStorage, ni IndexedDB, ni service worker).
  const browserStorage = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    indexedDb: (await indexedDB.databases()).length,
    serviceWorkers: (await navigator.serviceWorker.getRegistrations()).length,
  }))
  expect(browserStorage).toEqual({ localStorage: 0, sessionStorage: 0, indexedDb: 0, serviceWorkers: 0 })

  // La première entrée du journal provient de la personne.
  const newEntry = page.getByRole('region', { name: 'Nouvelle entrée' })
  await newEntry.getByLabel('Ce que vous souhaitez écrire').fill('Ma toute première entrée.')
  await newEntry.getByRole('button', { name: 'Ajouter au journal' }).click()
  await expect(page.getByRole('region', { name: 'Mes entrées' }).getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'Mes entrées' })).toContainText('Ma toute première entrée.')

  // Le premier message provient de la personne, après son accord explicite.
  await page.goto('/confidentialite')
  await page.getByRole('article', { name: 'Discuter avec votre jumeau' }).getByRole('button', { name: 'J’accepte' }).click()
  await expect(page.getByRole('article', { name: 'Discuter avec votre jumeau' }).getByText('Accordé', { exact: true })).toBeVisible()
  await page.goto('/conversations')
  await page.getByRole('button', { name: 'Nouvelle conversation' }).click()
  await expect(page.getByRole('log').getByRole('listitem')).toHaveCount(0)
  await page.getByLabel('Votre message').fill('Bonjour, c’est mon premier message.')
  await page.getByRole('button', { name: 'Envoyer' }).click()
  const messages = page.getByRole('log').getByRole('listitem')
  await expect(messages).toHaveCount(2)
  await expect(messages.first()).toContainText('Bonjour, c’est mon premier message.')

  // Sans accord à la mémoire, aucun souvenir ni proposition n'apparaît.
  await page.goto('/souvenirs')
  await expect(page.getByText('Aucun souvenir pour le moment.')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Proposition de souvenir' })).toHaveCount(0)
})
