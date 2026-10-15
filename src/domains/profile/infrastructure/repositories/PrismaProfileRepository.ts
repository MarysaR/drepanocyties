/**
 * Stockage PostgreSQL du profil, avec chiffrement des champs libres.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { ProfileRepository } from '../../application/ports/ProfileRepository'
import type { Profile } from '../../domain/entities/Profile'

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  async find(userId: UserId): Promise<Profile | undefined> {
    const row = await this.db.profile.findUnique({ where: { userId } })
    if (!row) return undefined
    return {
      userId,
      preferredName: this.decryptOptional(row.preferredNameEncrypted),
      aboutMe: this.decryptOptional(row.aboutMeEncrypted),
      replyLength: row.replyLength,
    }
  }

  async save(profile: Profile): Promise<Profile> {
    const data = {
      preferredNameEncrypted: this.encryptOptional(profile.preferredName),
      aboutMeEncrypted: this.encryptOptional(profile.aboutMe),
      replyLength: profile.replyLength,
    }
    await this.db.profile.upsert({ where: { userId: profile.userId }, create: { userId: profile.userId, ...data }, update: data })
    return profile
  }

  private encryptOptional(value: string | null): string | null {
    return value === null ? null : this.cipher.encrypt(value)
  }

  private decryptOptional(value: string | null): string | null {
    return value === null ? null : this.cipher.decrypt(value)
  }
}
