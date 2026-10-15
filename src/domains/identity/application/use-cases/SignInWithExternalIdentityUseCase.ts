/**
 * Associe une identité externe validée à un compte interne, en le créant lors de la
 * première connexion (inscription), sauf si le nombre de comptes autorisés est atteint.
 */
import { ValidationError } from '@shared/errors/AppError'
import { RegistrationClosedError } from '../../domain/errors'
import type { AuthProvider, User } from '../../domain/entities/User'
import type { UserRepository } from '../ports/UserRepository'

export class SignInWithExternalIdentityUseCase {
  constructor(private readonly users: UserRepository, private readonly registrationLimit?: number) {}

  async execute(provider: AuthProvider, subject: string): Promise<{ user: User; isNewUser: boolean }> {
    const normalizedSubject = subject.trim()
    if (!normalizedSubject || normalizedSubject.length > 255) throw new ValidationError('Identité externe invalide.')

    const existing = await this.users.findByExternalIdentity(provider, normalizedSubject)
    if (existing) return { user: existing, isNewUser: false }

    if (this.registrationLimit !== undefined && (await this.users.count()) >= this.registrationLimit) {
      throw new RegistrationClosedError()
    }
    return { user: await this.users.create(provider, normalizedSubject), isNewUser: true }
  }
}
