/**
 * Contrats de stockage de la mémoire. Toutes les opérations sont filtrées
 * par personne ; l'unité de travail garantit la cohérence des écritures liées.
 */
import type { UserId } from '@shared/domain/UserId'
import type { Memory, MemoryOrigin } from '../../domain/entities/Memory'
import type { MemoryProposal } from '../../domain/entities/MemoryProposal'

export interface MemoryDraft {
  readonly content: string
  readonly fingerprint: string
  readonly origin: MemoryOrigin
  readonly sourceMessageId: string | null
  readonly consentedAt: Date
}

export interface MemoryProposalDraft {
  readonly content: string
  readonly fingerprint: string
  readonly sourceMessageId: string | null
}

export type SuppressionReason = 'REJECTED' | 'CORRECTED' | 'DELETED'

export interface SuppressionDraft {
  readonly fingerprint: string
  readonly sourceMessageId: string | null
  readonly reason: SuppressionReason
}

export interface MemoryRepository {
  list(userId: UserId): Promise<Memory[]>
  findById(userId: UserId, id: string): Promise<Memory | undefined>
  findByFingerprint(userId: UserId, fingerprint: string): Promise<Memory | undefined>
  create(userId: UserId, draft: MemoryDraft): Promise<Memory>
  updateContent(userId: UserId, id: string, content: string, fingerprint: string): Promise<Memory>
  delete(userId: UserId, id: string): Promise<void>
}

export interface MemoryProposalRepository {
  listPending(userId: UserId): Promise<MemoryProposal[]>
  findById(userId: UserId, id: string): Promise<MemoryProposal | undefined>
  existsWithFingerprint(userId: UserId, fingerprint: string): Promise<boolean>
  create(userId: UserId, draft: MemoryProposalDraft): Promise<MemoryProposal>
  delete(userId: UserId, id: string): Promise<void>
  deleteAll(userId: UserId): Promise<void>
}

/** Empreintes de contenus que le jumeau ne doit plus proposer (aucun texte conservé). */
export interface MemorySuppressionRepository {
  add(userId: UserId, draft: SuppressionDraft): Promise<void>
  isSuppressed(userId: UserId, criteria: { fingerprint: string; sourceMessageId: string | null }): Promise<boolean>
}

export interface MemoryRepositories {
  readonly memories: MemoryRepository
  readonly proposals: MemoryProposalRepository
  readonly suppressions: MemorySuppressionRepository
}

export interface MemoryUnitOfWork {
  run<T>(work: (repositories: MemoryRepositories) => Promise<T>): Promise<T>
}
