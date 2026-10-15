/** Supprime définitivement un souvenir. */
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.memory.delete.execute(userId, readIdParam(event))
  return { deleted: true }
})
