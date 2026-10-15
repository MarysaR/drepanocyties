/** Retourne une conversation et ses messages. */
import { defineApiRoute } from '../../http/defineApiRoute'
import { readIdParam } from '../../http/requestInput'

export default defineApiRoute(({ event, container, userId }) => container.conversation.history.execute(userId, readIdParam(event)))
