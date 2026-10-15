/**
 * Personne utilisatrice, reliée à une identité externe (Auth0)
 * sans stocker d'e-mail ni de donnée de profil d'authentification.
 */
import type { UserId } from '@shared/domain/UserId'

export type AuthProvider = 'auth0' | 'test'

export interface User {
  readonly id: UserId
  readonly authProvider: AuthProvider
  readonly authSubject: string
}
