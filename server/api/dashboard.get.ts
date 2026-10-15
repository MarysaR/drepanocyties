/** Vue d'ensemble du tableau de bord. */
import { defineApiRoute } from '../http/defineApiRoute'

export default defineApiRoute(({ container, userId }) => container.dashboard.overview.execute(userId))
