/**
 * Vérifie qu'une session désigne un compte toujours existant
 * (un compte supprimé invalide immédiatement les sessions restantes).
 */
import { UnauthenticatedError } from '@shared/errors/AppError'
import { toUserId, type UserId } from '@shared/domain/UserId'
import type { UserRepository } from '../ports/UserRepository'

export class RequireExistingUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(sessionUserId: string | undefined): Promise<UserId> {
    if (!sessionUserId) throw new UnauthenticatedError()
    const userId = toUserId(sessionUserId)
    if (!(await this.users.exists(userId))) throw new UnauthenticatedError()
    return userId
  }
}
