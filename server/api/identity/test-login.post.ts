/**
 * Connexion par identifiant de test, disponible uniquement en mode test local
 * sur une base dédiée (E2E). Répond 404 dans tout autre contexte.
 * Aucun compte n'existe à l'avance : le compte est créé à la première connexion.
 */
import { z } from 'zod'
import { NotFoundError } from '@shared/errors/AppError'
import { definePublicApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

const testLoginSchema = z.object({
  testIdentity: z.string().regex(/^[a-z0-9-]{3,64}$/, 'Identifiant de test : lettres minuscules, chiffres et tirets.'),
})

export default definePublicApiRoute(async ({ event, container }) => {
  if (!container.settings.testMode) throw new NotFoundError('route')
  const { testIdentity } = await readValidatedInput(event, testLoginSchema)
  const { user } = await container.identity.signIn.execute('test', testIdentity)
  await replaceUserSession(event, { user: { id: user.id, provider: 'test' }, loggedInAt: Date.now() })
  return { ok: true }
})
