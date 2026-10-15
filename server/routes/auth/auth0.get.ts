/**
 * Connexion et inscription via Auth0 (flux Authorization Code avec contrôle du state).
 * Seul l'identifiant Auth0 (sub) est utilisé ; aucun e-mail n'est demandé.
 */
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { catchError } from '@shared/errors/catchError'
import { normalizeError } from '@shared/errors/normalizeError'
import { serverLogger } from '@shared/infrastructure/logging/logger'
import { useServerContainer } from '../../http/serverContainer'

export default defineEventHandler((event) => {
  const isSignup = getQuery(event).intent === 'signup'
  const { appBaseUrl } = useServerContainer().settings

  return defineOAuthAuth0EventHandler({
    config: {
      // URL de rappel fixée sur l'adresse publique configurée (indispensable derrière un proxy HTTPS).
      redirectURL: `${new URL(appBaseUrl).origin}/auth/auth0`,
      scope: ['openid'],
      authorizationParams: isSignup ? { screen_hint: 'signup' } : {},
    },
    async onSuccess(event, { user }) {
      const subject = typeof user.sub === 'string' ? user.sub : ''
      const signIn = await catchError(() => useServerContainer().identity.signIn.execute('auth0', subject))
      if (!signIn.ok) {
        serverLogger.failure('auth0_signin_refused', signIn.error)
        return sendRedirect(event, signIn.error.code === 'REGISTRATION_CLOSED' ? '/?erreur=inscription' : '/?erreur=connexion')
      }
      const account = signIn.value.user
      await replaceUserSession(event, { user: { id: account.id, provider: 'auth0' }, loggedInAt: Date.now() })
      return sendRedirect(event, '/tableau-de-bord')
    },
    onError(event, error) {
      serverLogger.failure('auth0_login_failed', normalizeError(error))
      return sendRedirect(event, '/?erreur=connexion')
    },
  })(event)
})
