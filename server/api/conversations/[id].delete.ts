/** Supprime une conversation et ses messages. */
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam } from '../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.conversation.delete.execute(userId, readIdParam(event))
  return { deleted: true }
})
