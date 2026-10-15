/**
 * Refuse une proposition : elle est supprimée et son empreinte retenue
 * pour que le jumeau ne la repropose pas.
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class RejectMemoryProposalUseCase {
  constructor(private readonly store: MemoryUnitOfWork, private readonly fingerprinter: ContentFingerprinter) {}

  async execute(userId: UserId, proposalId: string): Promise<void> {
    await this.store.run(async ({ proposals, suppressions }) => {
      const proposal = await proposals.findById(userId, proposalId)
      if (!proposal) throw new NotFoundError('memory_proposal')
      await suppressions.add(userId, {
        fingerprint: this.fingerprinter.fingerprint(proposal.content),
        sourceMessageId: null,
        reason: 'REJECTED',
      })
      await proposals.delete(userId, proposal.id)
    })
  }
}
