/**
 * Protection CSRF complémentaire au cookie SameSite : toute requête API
 * modifiant des données doit provenir de la même origine.
 */
import { createError, defineEventHandler, getRequestHeader, getRequestURL } from 'h3'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (SAFE_METHODS.has(event.method) || !getRequestURL(event).pathname.startsWith('/api/')) return

  const origin = getRequestHeader(event, 'origin')
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  const sameOrigin = origin ? origin === getRequestURL(event).origin : fetchSite !== 'cross-site'
  if (!sameOrigin) throw createError({ statusCode: 403, statusMessage: 'CROSS_ORIGIN_REQUEST_REJECTED' })
})
