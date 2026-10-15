/** Consommation estimée de l'IA par rapport au plafond configuré. */
import { defineApiRoute } from '../http/defineApiRoute'

export default defineApiRoute(({ container }) => container.conversation.usage.execute())
