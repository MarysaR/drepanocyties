/** Refuse une proposition de souvenir. */
import { defineApiRoute } from '../../../http/defineApiRoute'
import { readIdParam } from '../../../http/requestInput'

export default defineApiRoute(async ({ event, container, userId }) => {
  await container.memory.rejectProposal.execute(userId, readIdParam(event))
  return { rejected: true }
})
