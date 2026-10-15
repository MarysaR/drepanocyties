import { expect, test } from './support/testAccounts'
import { grantAllConsents, sendMessage, signInAs, signOut } from './support/journeys'

test('Aïcha ne voit ni ne peut ouvrir les conversations de Mary', async ({ page, accounts }) => {
  await signInAs(page, accounts.create('mary'))
  await grantAllConsents(page)
  await page.goto('/conversations')
  await page.getByRole('button', { name: 'Nouvelle conversation' }).click()
  await expect(page).toHaveURL(/\/conversations\/[0-9a-f-]{36}$/)
  const maryConversationUrl = page.url()
  await sendMessage(page, 'Message privé de Mary')
  await signOut(page)

  await signInAs(page, accounts.create('aicha'))
  await page.goto('/conversations')
  await expect(page.getByText('Message privé de Mary')).toHaveCount(0)
  await page.goto(maryConversationUrl)
  await expect(page.getByRole('alert').filter({ hasText: 'introuvable' }).first()).toBeVisible()
  await expect(page.getByText('Message privé de Mary')).toHaveCount(0)
})

test('Sans accord, la conversation est bloquée et rien n’est envoyé', async ({ page, accounts }) => {
  await signInAs(page, accounts.create('aicha'))
  await page.goto('/conversations')
  await page.getByRole('button', { name: 'Nouvelle conversation' }).click()
  await expect(page.getByText('votre accord au traitement de vos messages par une IA est nécessaire')).toBeVisible()
  await expect(page.getByLabel('Votre message')).toBeDisabled()
})

test('Journal : création, modification et suppression d’une entrée', async ({ page, accounts }) => {
  await signInAs(page, accounts.create('aicha'))
  await page.goto('/journal')

  const newEntry = page.getByRole('region', { name: 'Nouvelle entrée' })
  await newEntry.getByLabel('Titre (facultatif)').fill('Après-midi au parc')
  await newEntry.getByLabel('Apaisé·e').check()
  await newEntry.getByLabel('Ce que vous souhaitez écrire').fill('Une belle lumière, un moment calme.')
  await newEntry.getByRole('button', { name: 'Ajouter au journal' }).click()

  const entry = page.getByRole('article', { name: 'Après-midi au parc' })
  await expect(entry).toContainText('Une belle lumière')
  await expect(entry).toContainText('Apaisé·e')

  await entry.getByRole('button', { name: 'Modifier' }).click()
  await page.getByRole('article').filter({ has: page.getByRole('button', { name: 'Enregistrer les modifications' }) })
    .getByLabel('Ce que vous souhaitez écrire').fill('Une belle lumière, puis un peu de fatigue.')
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
  await expect(page.getByRole('article', { name: 'Après-midi au parc' })).toContainText('un peu de fatigue')

  await page.getByRole('article', { name: 'Après-midi au parc' }).getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Votre journal est vide pour le moment.')).toBeVisible()
})

test('Pages protégées : redirection vers l’accueil sans session', async ({ page }) => {
  await page.goto('/souvenirs')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible()
})
