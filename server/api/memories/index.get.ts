/** Retourne les souvenirs, les propositions en attente et l'état de la mémoire. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.memory.list.execute(userId))
