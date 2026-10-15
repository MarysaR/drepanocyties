/**
 * Vue d'ensemble de la mémoire : souvenirs retenus, propositions
 * en attente et état du consentement.
 */
import type { UserId } from '@shared/domain/UserId'
import { toMemoryDto, toMemoryProposalDto, type MemoryOverviewDto } from '../dto/MemoryDto'
import type { MemoryConsentReader } from '../ports/MemoryConsentReader'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class ListMemoriesUseCase {
  constructor(private readonly store: MemoryUnitOfWork, private readonly consent: MemoryConsentReader) {}

  async execute(userId: UserId): Promise<MemoryOverviewDto> {
    const memoryEnabled = await this.consent.isMemoryAllowed(userId)
    return this.store.run(async ({ memories, proposals }) => ({
      memoryEnabled,
      memories: (await memories.list(userId)).map(toMemoryDto),
      proposals: (await proposals.listPending(userId)).map(toMemoryProposalDto),
    }))
  }
}
