/**
 * Abandonne toutes les propositions en attente (retrait du consentement à la mémoire).
 */
import type { UserId } from '@shared/domain/UserId'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class DiscardPendingProposalsUseCase {
  constructor(private readonly store: MemoryUnitOfWork) {}

  async execute(userId: UserId): Promise<void> {
    await this.store.run(({ proposals }) => proposals.deleteAll(userId))
  }
}
