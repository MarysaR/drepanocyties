/** Télécharge l'export complet des données personnelles (JSON). */
import { setResponseHeader } from 'h3'
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(async ({ event, container, userId }) => {
  const document = await container.privacy.export.execute(userId)
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="mes-donnees-${document.exportedAt.slice(0, 10)}.json"`)
  return document
})
