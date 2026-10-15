/**
 * Accepte une proposition (éventuellement reformulée par la personne) :
 * le souvenir est créé et la proposition retirée dans la même transaction.
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import { ConsentRequiredError, NotFoundError } from '@shared/errors/AppError'
import { DuplicateMemoryError } from '../../domain/errors'
import { createMemoryContent } from '../../domain/value-objects/MemoryContent'
import { toMemoryDto, type MemoryDto } from '../dto/MemoryDto'
import type { MemoryConsentReader } from '../ports/MemoryConsentReader'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class AcceptMemoryProposalUseCase {
  constructor(
    private readonly store: MemoryUnitOfWork,
    private readonly consent: MemoryConsentReader,
    private readonly fingerprinter: ContentFingerprinter,
    private readonly clock: Clock,
  ) {}

  async execute(userId: UserId, input: { proposalId: string; content?: string }): Promise<MemoryDto> {
    return this.store.run(async ({ memories, proposals, suppressions }) => {
      const proposal = await proposals.findById(userId, input.proposalId)
      if (!proposal) throw new NotFoundError('memory_proposal')
      if (!(await this.consent.isMemoryAllowed(userId))) throw new ConsentRequiredError('PERSISTENT_MEMORY')

      const content = createMemoryContent(input.content ?? proposal.content)
      const fingerprint = this.fingerprinter.fingerprint(content)
      if (await memories.findByFingerprint(userId, fingerprint)) throw new DuplicateMemoryError()

      const originalFingerprint = this.fingerprinter.fingerprint(proposal.content)
      if (originalFingerprint !== fingerprint) {
        await suppressions.add(userId, { fingerprint: originalFingerprint, sourceMessageId: null, reason: 'CORRECTED' })
      }

      const memory = await memories.create(userId, {
        content,
        fingerprint,
        origin: 'TWIN_PROPOSAL',
        sourceMessageId: proposal.sourceMessageId,
        consentedAt: this.clock.now(),
      })
      await proposals.delete(userId, proposal.id)
      return toMemoryDto(memory)
    })
  }
}
