/** Retourne l'état de chaque consentement de la personne connectée. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.consent.states.execute(userId))
