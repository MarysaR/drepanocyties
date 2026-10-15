/**
 * Protection CSRF complémentaire au cookie SameSite : toute requête API modifiant des données
 * doit provenir de l'origine publique configurée (NUXT_SITE_URL), y compris derrière un proxy HTTPS.
 */
import { createError, defineEventHandler, getRequestHeader, getRequestURL } from 'h3'
import { useServerContainer } from '../http/serverContainer'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (SAFE_METHODS.has(event.method) || !getRequestURL(event).pathname.startsWith('/api/')) return

  const allowedOrigin = new URL(useServerContainer().settings.appBaseUrl).origin
  const origin = getRequestHeader(event, 'origin')
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  const sameOrigin = origin ? origin === allowedOrigin : fetchSite === 'same-origin'
  if (!sameOrigin) throw createError({ statusCode: 403, statusMessage: 'CROSS_ORIGIN_REQUEST_REJECTED' })
})
