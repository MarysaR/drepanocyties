/** Liste les entrées du journal. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.journal.list.execute(userId))
