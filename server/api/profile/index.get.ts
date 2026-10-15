/** Retourne le profil de la personne connectée. */
import { defineApiRoute } from '../../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.profile.get.execute(userId))
