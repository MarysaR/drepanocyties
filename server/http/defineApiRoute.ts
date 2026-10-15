/**
 * Enveloppe commune des routes API : authentification obligatoire,
 * capture centralisée des erreurs et traduction HTTP.
 */
import { defineEventHandler, type H3Event } from 'h3'
import type { ServerContainer } from '@composition/createServerContainer'
import type { UserId } from '@shared/domain/UserId'
import { catchError } from '@shared/errors/catchError'
import { useServerContainer } from './serverContainer'
import { toHttpError } from './toHttpError'

export interface ApiContext {
  readonly event: H3Event
  readonly container: ServerContainer
}

export interface AuthenticatedApiContext extends ApiContext {
  readonly userId: UserId
}

/** Route publique (aucune donnée personnelle). */
export function definePublicApiRoute<T>(handler: (context: ApiContext) => Promise<T> | T) {
  return defineEventHandler(async (event) => {
    const result = await catchError(() => handler({ event, container: useServerContainer() }))
    if (result.ok) return result.value
    throw toHttpError(event, result.error)
  })
}

/** Route protégée : la session doit désigner un compte existant. */
export function defineApiRoute<T>(handler: (context: AuthenticatedApiContext) => Promise<T> | T) {
  return defineEventHandler(async (event) => {
    const result = await catchError(async () => {
      const container = useServerContainer()
      const session = await getUserSession(event)
      const userId = await container.identity.requireExistingUser.execute(session.user?.id)
      return handler({ event, container, userId })
    })
    if (result.ok) return result.value
    if (result.error.kind === 'unauthenticated') await clearUserSession(event)
    throw toHttpError(event, result.error)
  })
}
