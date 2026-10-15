/**
 * Accès aux comptes : recherche par identité externe et vérification d'existence.
 */
import type { UserId } from '@shared/domain/UserId'
import type { AuthProvider, User } from '../../domain/entities/User'

export interface UserRepository {
  findByExternalIdentity(provider: AuthProvider, subject: string): Promise<User | undefined>
  create(provider: AuthProvider, subject: string): Promise<User>
  exists(userId: UserId): Promise<boolean>
  count(): Promise<number>
}
