/**
 * Double de test : stockage des souvenirs, propositions et empreintes
 * supprimées en mémoire, avec unité de travail simplifiée.
 */
import { randomUUID } from 'node:crypto'
import type {
  MemoryDraft,
  MemoryProposalDraft,
  MemoryProposalRepository,
  MemoryRepositories,
  MemoryRepository,
  MemorySuppressionRepository,
  MemoryUnitOfWork,
  SuppressionDraft,
} from '@domains/memory/application/ports/MemoryStore'
import type { Memory } from '@domains/memory/domain/entities/Memory'
import type { MemoryProposal } from '@domains/memory/domain/entities/MemoryProposal'
import type { UserId } from '@shared/domain/UserId'

type Owned<T> = T & { userId: UserId; fingerprint: string }

class InMemoryMemoryRepository implements MemoryRepository {
  constructor(readonly rows: Array<Owned<Memory>>, private readonly now: () => Date) {}

  async list(userId: UserId) { return this.rows.filter(r => r.userId === userId).map(strip) }
  async findById(userId: UserId, id: string) { return mapOptional(this.rows.find(r => r.userId === userId && r.id === id)) }
  async findByFingerprint(userId: UserId, fingerprint: string) { return mapOptional(this.rows.find(r => r.userId === userId && r.fingerprint === fingerprint)) }
  async create(userId: UserId, draft: MemoryDraft) {
    const row: Owned<Memory> = { id: randomUUID(), userId, fingerprint: draft.fingerprint, content: draft.content, origin: draft.origin, sourceMessageId: draft.sourceMessageId, consentedAt: draft.consentedAt, createdAt: this.now(), updatedAt: this.now() }
    this.rows.push(row)
    return strip(row)
  }

  async updateContent(userId: UserId, id: string, content: string, fingerprint: string) {
    const row = this.rows.find(r => r.userId === userId && r.id === id)
    if (!row) throw new Error('missing row')
    Object.assign(row, { content, fingerprint, updatedAt: this.now() })
    return strip(row)
  }

  async delete(userId: UserId, id: string) {
    const index = this.rows.findIndex(r => r.userId === userId && r.id === id)
    if (index >= 0) this.rows.splice(index, 1)
  }
}

class InMemoryProposalRepository implements MemoryProposalRepository {
  constructor(readonly rows: Array<Owned<MemoryProposal>>, private readonly now: () => Date) {}

  async listPending(userId: UserId) { return this.rows.filter(r => r.userId === userId).map(strip) }
  async findById(userId: UserId, id: string) { return mapOptional(this.rows.find(r => r.userId === userId && r.id === id)) }
  async existsWithFingerprint(userId: UserId, fingerprint: string) { return this.rows.some(r => r.userId === userId && r.fingerprint === fingerprint) }
  async fingerprintOf(userId: UserId, id: string) { return this.rows.find(r => r.userId === userId && r.id === id)?.fingerprint }
  async create(userId: UserId, draft: MemoryProposalDraft) {
    const row: Owned<MemoryProposal> = { id: randomUUID(), userId, fingerprint: draft.fingerprint, content: draft.content, sourceMessageId: draft.sourceMessageId, createdAt: this.now() }
    this.rows.push(row)
    return strip(row)
  }

  async delete(userId: UserId, id: string) {
    const index = this.rows.findIndex(r => r.userId === userId && r.id === id)
    if (index >= 0) this.rows.splice(index, 1)
  }

  async deleteAll(userId: UserId) {
    for (let i = this.rows.length - 1; i >= 0; i--) if (this.rows[i]?.userId === userId) this.rows.splice(i, 1)
  }
}

class InMemorySuppressionRepository implements MemorySuppressionRepository {
  readonly rows: Array<SuppressionDraft & { userId: UserId }> = []

  async add(userId: UserId, draft: SuppressionDraft) { this.rows.push({ ...draft, userId }) }
  async isSuppressed(userId: UserId, criteria: { fingerprint: string; sourceMessageId: string | null }) {
    return this.rows.some(r => r.userId === userId && (r.fingerprint === criteria.fingerprint
      || (criteria.sourceMessageId !== null && r.sourceMessageId === criteria.sourceMessageId)))
  }
}

export class InMemoryMemoryStore implements MemoryUnitOfWork {
  readonly memories: InMemoryMemoryRepository
  readonly proposals: InMemoryProposalRepository
  readonly suppressions = new InMemorySuppressionRepository()

  constructor(now: () => Date = () => new Date()) {
    this.memories = new InMemoryMemoryRepository([], now)
    this.proposals = new InMemoryProposalRepository([], now)
  }

  async run<T>(work: (repositories: MemoryRepositories) => Promise<T>): Promise<T> {
    return work({ memories: this.memories, proposals: this.proposals, suppressions: this.suppressions })
  }
}

function strip<T extends { userId: UserId; fingerprint: string }>(row: T): Omit<T, 'userId' | 'fingerprint'> {
  const { userId: _userId, fingerprint: _fingerprint, ...rest } = row
  return rest
}

function mapOptional<T extends { userId: UserId; fingerprint: string }>(row: T | undefined) {
  return row ? strip(row) : undefined
}
