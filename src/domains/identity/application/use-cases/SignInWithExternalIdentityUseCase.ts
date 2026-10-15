/**
 * Associe une identité externe validée à un compte interne,
 * en le créant lors de la première connexion (inscription).
 */
import { ValidationError } from '@shared/errors/AppError'
import type { AuthProvider, User } from '../../domain/entities/User'
import type { UserRepository } from '../ports/UserRepository'

export class SignInWithExternalIdentityUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(provider: AuthProvider, subject: string): Promise<{ user: User; isNewUser: boolean }> {
    const normalizedSubject = subject.trim()
    if (!normalizedSubject || normalizedSubject.length > 255) throw new ValidationError('Identité externe invalide.')

    const existing = await this.users.findByExternalIdentity(provider, normalizedSubject)
    if (existing) return { user: existing, isNewUser: false }
    return { user: await this.users.create(provider, normalizedSubject), isNewUser: true }
  }
}
