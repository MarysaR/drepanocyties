/** Supprime une entrée du journal. */
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.journal.delete.execute(userId, readIdParam(event))
  return { deleted: true }
})
