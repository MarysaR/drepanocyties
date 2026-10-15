/** Efface toutes les données de la personne puis termine sa session. */
import { eraseAllDataSchema } from '@domains/privacy/application/dto/PersonalDataExport'
import { defineApiRoute } from '../../http/defineApiRoute'
import { readValidatedInput } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.privacy.eraseAll.execute(userId, await readValidatedInput(event, eraseAllDataSchema))
  await clearUserSession(event)
  return { erased: true }
})
