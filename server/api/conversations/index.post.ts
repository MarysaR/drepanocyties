/** Ouvre une nouvelle conversation. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.conversation.start.execute(userId))
