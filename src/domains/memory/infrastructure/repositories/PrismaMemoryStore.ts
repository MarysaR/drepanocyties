/**
 * Stockage PostgreSQL de la mémoire : contenus chiffrés, empreintes HMAC,
 * filtrage systématique par personne et transactions pour les écritures liées.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient, DatabaseTransaction } from '@shared/infrastructure/prisma/createPrismaClient'
import type {
  MemoryDraft,
  MemoryProposalDraft,
  MemoryProposalRepository,
  MemoryRepositories,
  MemoryRepository,
  MemorySuppressionRepository,
  MemoryUnitOfWork,
  SuppressionDraft,
} from '../../application/ports/MemoryStore'
import type { Memory } from '../../domain/entities/Memory'
import type { MemoryProposal } from '../../domain/entities/MemoryProposal'

interface MemoryRow {
  id: string
  contentEncrypted: string
  origin: Memory['origin']
  sourceMessageId: string | null
  consentedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface ProposalRow {
  id: string
  contentEncrypted: string
  sourceMessageId: string | null
  createdAt: Date
}

class PrismaMemoryRepository implements MemoryRepository {
  constructor(private readonly db: DatabaseTransaction, private readonly cipher: ContentCipher) {}

  async list(userId: UserId): Promise<Memory[]> {
    const rows = await this.db.memory.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
    return rows.map(row => this.toMemory(row))
  }

  async findById(userId: UserId, id: string): Promise<Memory | undefined> {
    const row = await this.db.memory.findFirst({ where: { id, userId } })
    return row ? this.toMemory(row) : undefined
  }

  async findByFingerprint(userId: UserId, fingerprint: string): Promise<Memory | undefined> {
    const row = await this.db.memory.findUnique({ where: { userId_contentFingerprint: { userId, contentFingerprint: fingerprint } } })
    return row ? this.toMemory(row) : undefined
  }

  async create(userId: UserId, draft: MemoryDraft): Promise<Memory> {
    const row = await this.db.memory.create({
      data: {
        userId,
        contentEncrypted: this.cipher.encrypt(draft.content),
        contentFingerprint: draft.fingerprint,
        origin: draft.origin,
        sourceMessageId: draft.sourceMessageId,
        consentedAt: draft.consentedAt,
      },
    })
    return this.toMemory(row)
  }

  async updateContent(userId: UserId, id: string, content: string, fingerprint: string): Promise<Memory> {
    await this.db.memory.updateMany({
      where: { id, userId },
      data: { contentEncrypted: this.cipher.encrypt(content), contentFingerprint: fingerprint },
    })
    const row = await this.db.memory.findFirstOrThrow({ where: { id, userId } })
    return this.toMemory(row)
  }

  async delete(userId: UserId, id: string): Promise<void> {
    await this.db.memory.deleteMany({ where: { id, userId } })
  }

  private toMemory(row: MemoryRow): Memory {
    return {
      id: row.id,
      content: this.cipher.decrypt(row.contentEncrypted),
      origin: row.origin,
      sourceMessageId: row.sourceMessageId,
      consentedAt: row.consentedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

class PrismaMemoryProposalRepository implements MemoryProposalRepository {
  constructor(private readonly db: DatabaseTransaction, private readonly cipher: ContentCipher) {}

  async listPending(userId: UserId): Promise<MemoryProposal[]> {
    const rows = await this.db.memoryProposal.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
    return rows.map(row => this.toProposal(row))
  }

  async findById(userId: UserId, id: string): Promise<MemoryProposal | undefined> {
    const row = await this.db.memoryProposal.findFirst({ where: { id, userId } })
    return row ? this.toProposal(row) : undefined
  }

  async existsWithFingerprint(userId: UserId, fingerprint: string): Promise<boolean> {
    return (await this.db.memoryProposal.count({ where: { userId, contentFingerprint: fingerprint } })) > 0
  }

  async create(userId: UserId, draft: MemoryProposalDraft): Promise<MemoryProposal> {
    const row = await this.db.memoryProposal.create({
      data: {
        userId,
        contentEncrypted: this.cipher.encrypt(draft.content),
        contentFingerprint: draft.fingerprint,
        sourceMessageId: draft.sourceMessageId,
      },
    })
    return this.toProposal(row)
  }

  async delete(userId: UserId, id: string): Promise<void> {
    await this.db.memoryProposal.deleteMany({ where: { id, userId } })
  }

  async deleteAll(userId: UserId): Promise<void> {
    await this.db.memoryProposal.deleteMany({ where: { userId } })
  }

  private toProposal(row: ProposalRow): MemoryProposal {
    return { id: row.id, content: this.cipher.decrypt(row.contentEncrypted), sourceMessageId: row.sourceMessageId, createdAt: row.createdAt }
  }
}

class PrismaMemorySuppressionRepository implements MemorySuppressionRepository {
  constructor(private readonly db: DatabaseTransaction) {}

  async add(userId: UserId, draft: SuppressionDraft): Promise<void> {
    await this.db.memorySuppression.create({
      data: { userId, contentFingerprint: draft.fingerprint, sourceMessageId: draft.sourceMessageId, reason: draft.reason },
    })
  }

  async isSuppressed(userId: UserId, criteria: { fingerprint: string; sourceMessageId: string | null }): Promise<boolean> {
    const bySource = criteria.sourceMessageId ? [{ sourceMessageId: criteria.sourceMessageId }] : []
    const count = await this.db.memorySuppression.count({
      where: { userId, OR: [{ contentFingerprint: criteria.fingerprint }, ...bySource] },
    })
    return count > 0
  }
}

export class PrismaMemoryStore implements MemoryUnitOfWork {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  run<T>(work: (repositories: MemoryRepositories) => Promise<T>): Promise<T> {
    return this.db.$transaction(transaction => work({
      memories: new PrismaMemoryRepository(transaction, this.cipher),
      proposals: new PrismaMemoryProposalRepository(transaction, this.cipher),
      suppressions: new PrismaMemorySuppressionRepository(transaction),
    }))
  }
}
