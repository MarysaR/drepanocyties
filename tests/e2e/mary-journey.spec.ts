import { expect, test } from './support/testAccounts'
import { grantAllConsents, lastTwinReply, sendMessage, signInAs, signOut } from './support/journeys'

test('Parcours de Mary : consentement, souvenir, reconnexion, rappel, correction puis suppression', async ({ page, accounts }) => {
  const mary = accounts.create('mary')
  await signInAs(page, mary)
  await expect(page.getByRole('heading', { name: 'Avant de commencer' })).toBeVisible()

  await grantAllConsents(page)

  // Première conversation et proposition de souvenir.
  await page.goto('/conversations')
  await page.getByRole('button', { name: 'Nouvelle conversation' }).click()
  await expect(page).toHaveURL(/\/conversations\/[0-9a-f-]{36}$/)
  await sendMessage(page, 'Je veux que tu retiennes que j’adore le jazz.')
  await expect(lastTwinReply(page)).toContainText('Je suis là pour vous écouter')

  const proposal = page.getByRole('article', { name: 'Proposition de souvenir' })
  await expect(proposal).toContainText('J’adore le jazz')
  await proposal.getByRole('button', { name: 'Retenir', exact: true }).click()
  await expect(proposal).toHaveCount(0)

  // Déconnexion puis reconnexion.
  await signOut(page)
  await signInAs(page, mary)

  // Reprise de la conversation et rappel autorisé.
  await page.goto('/conversations')
  await page.getByRole('link', { name: 'Je veux que tu retiennes que j’adore le jazz.' }).click()
  await expect(page.getByRole('log')).toContainText('Je veux que tu retiennes que j’adore le jazz.')
  await sendMessage(page, 'De quoi te souviens-tu ?')
  await expect(lastTwinReply(page)).toContainText('J’adore le jazz')

  // Correction du souvenir.
  await page.goto('/souvenirs')
  await page.getByRole('button', { name: 'Corriger' }).click()
  await page.getByLabel('Corriger ce souvenir').fill('J’adore le jazz manouche')
  await page.getByRole('button', { name: 'Enregistrer la correction' }).click()
  await expect(page.getByRole('listitem').filter({ hasText: 'J’adore le jazz manouche' })).toBeVisible()

  await page.goto('/conversations')
  await page.getByRole('link', { name: 'Je veux que tu retiennes que j’adore le jazz.' }).click()
  await sendMessage(page, 'De quoi te souviens-tu maintenant ?')
  await expect(lastTwinReply(page)).toContainText('J’adore le jazz manouche')

  // Suppression du souvenir.
  await page.goto('/souvenirs')
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText('Aucun souvenir pour le moment.')).toBeVisible()

  await page.goto('/conversations')
  await page.getByRole('link', { name: 'Je veux que tu retiennes que j’adore le jazz.' }).click()
  await sendMessage(page, 'De quoi te souviens-tu encore ?')
  await expect(lastTwinReply(page)).toContainText('aucun souvenir autorisé')

  // Le souvenir supprimé n'est pas reproposé par le jumeau.
  await sendMessage(page, 'Je veux que tu retiennes que j’adore le jazz manouche.')
  await expect(lastTwinReply(page)).toContainText('Je suis là pour vous écouter')
  await expect(page.getByRole('article', { name: 'Proposition de souvenir' })).toHaveCount(0)
})
