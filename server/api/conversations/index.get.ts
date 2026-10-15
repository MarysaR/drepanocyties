/** Liste les conversations de la personne connectée. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.conversation.list.execute(userId))
