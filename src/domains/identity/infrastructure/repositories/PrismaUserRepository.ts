/**
 * Stockage PostgreSQL des comptes (identifiant externe uniquement).
 */
import { toUserId, type UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { UserRepository } from '../../application/ports/UserRepository'
import type { AuthProvider, User } from '../../domain/entities/User'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseClient) {}

  async findByExternalIdentity(provider: AuthProvider, subject: string): Promise<User | undefined> {
    const row = await this.db.user.findUnique({ where: { authProvider_authSubject: { authProvider: provider, authSubject: subject } } })
    return row ? { id: toUserId(row.id), authProvider: provider, authSubject: row.authSubject } : undefined
  }

  async create(provider: AuthProvider, subject: string): Promise<User> {
    const row = await this.db.user.upsert({
      where: { authProvider_authSubject: { authProvider: provider, authSubject: subject } },
      create: { authProvider: provider, authSubject: subject },
      update: {},
    })
    return { id: toUserId(row.id), authProvider: provider, authSubject: row.authSubject }
  }

  async exists(userId: UserId): Promise<boolean> {
    if (!uuidPattern.test(userId)) return false
    return (await this.db.user.count({ where: { id: userId } })) === 1
  }

  count(): Promise<number> {
    return this.db.user.count()
  }
}
