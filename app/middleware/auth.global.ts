/**
 * Protection des pages côté interface : les espaces personnels exigent une session.
 * Le contrôle d'accès réel reste effectué par le serveur sur chaque requête API.
 */
const publicRoutes = new Set(['/', '/connexion/test'])

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch: refreshSession } = useUserSession()
  await refreshSession()

  if (publicRoutes.has(to.path)) {
    if (loggedIn.value && to.path === '/') return navigateTo('/tableau-de-bord')
    return
  }
  if (!loggedIn.value) return navigateTo('/')
})
