/**
 * Double de test : comptes en mémoire.
 */
import { randomUUID } from 'node:crypto'
import type { UserRepository } from '@domains/identity/application/ports/UserRepository'
import type { AuthProvider, User } from '@domains/identity/domain/entities/User'
import { toUserId, type UserId } from '@shared/domain/UserId'

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = []

  async findByExternalIdentity(provider: AuthProvider, subject: string) {
    return this.users.find(user => user.authProvider === provider && user.authSubject === subject)
  }

  async create(provider: AuthProvider, subject: string) {
    const user: User = { id: toUserId(randomUUID()), authProvider: provider, authSubject: subject }
    this.users.push(user)
    return user
  }

  async exists(userId: UserId) { return this.users.some(user => user.id === userId) }
  async count() { return this.users.length }
}
