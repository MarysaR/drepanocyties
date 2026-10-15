/**
 * Déconnexion : efface la session locale et, pour Auth0, indique l'URL
 * de déconnexion du fournisseur.
 */
import { defineEventHandler } from 'h3'
import { useServerContainer } from '../../http/serverContainer'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  await clearUserSession(event)

  const { auth0, appBaseUrl } = useServerContainer().settings
  if (session.user?.provider === 'auth0' && auth0) {
    const returnTo = encodeURIComponent(appBaseUrl)
    return { redirectTo: `https://${auth0.domain}/v2/logout?client_id=${encodeURIComponent(auth0.clientId)}&returnTo=${returnTo}` }
  }
  return { redirectTo: '/' }
})
