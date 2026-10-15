/**
 * Stockage PostgreSQL des décisions de consentement, toujours filtré par personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { ConsentRepository } from '../../application/ports/ConsentRepository'
import type { ConsentDecision } from '../../domain/entities/ConsentDecision'
import type { ConsentType } from '../../domain/value-objects/ConsentType'

export class PrismaConsentRepository implements ConsentRepository {
  constructor(private readonly db: DatabaseClient) {}

  async latestDecision(userId: UserId, type: ConsentType): Promise<ConsentDecision | undefined> {
    const row = await this.db.consentDecision.findFirst({
      where: { userId, type },
      orderBy: { decidedAt: 'desc' },
    })
    if (!row) return undefined
    return { type: row.type, granted: row.granted, policyVersion: row.policyVersion, decidedAt: row.decidedAt }
  }

  async record(userId: UserId, decision: ConsentDecision): Promise<void> {
    await this.db.consentDecision.create({
      data: { userId, type: decision.type, granted: decision.granted, policyVersion: decision.policyVersion, decidedAt: decision.decidedAt },
    })
  }
}
