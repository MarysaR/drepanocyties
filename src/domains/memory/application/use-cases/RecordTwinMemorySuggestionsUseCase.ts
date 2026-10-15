/**
 * Transforme les suggestions du jumeau en propositions en attente,
 * uniquement avec consentement et hors contenus refusés, corrigés ou supprimés.
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import { MAX_TWIN_SUGGESTIONS_PER_MESSAGE, isTwinProposalAllowed } from '../../domain/services/MemoryProposalPolicy'
import { tryCreateMemoryContent } from '../../domain/value-objects/MemoryContent'
import { toMemoryProposalDto, type MemoryProposalDto } from '../dto/MemoryDto'
import type { MemoryConsentReader } from '../ports/MemoryConsentReader'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export interface TwinSuggestions {
  readonly sourceMessageId: string
  readonly suggestions: readonly string[]
}

export class RecordTwinMemorySuggestionsUseCase {
  constructor(
    private readonly store: MemoryUnitOfWork,
    private readonly consent: MemoryConsentReader,
    private readonly fingerprinter: ContentFingerprinter,
  ) {}

  async execute(userId: UserId, input: TwinSuggestions): Promise<MemoryProposalDto[]> {
    if (!(await this.consent.isMemoryAllowed(userId))) return []

    const candidates = input.suggestions
      .map(tryCreateMemoryContent)
      .filter((content): content is string => content !== undefined)
      .slice(0, MAX_TWIN_SUGGESTIONS_PER_MESSAGE)

    return this.store.run(async ({ memories, proposals, suppressions }) => {
      const created: MemoryProposalDto[] = []
      for (const content of candidates) {
        const fingerprint = this.fingerprinter.fingerprint(content)
        const allowed = isTwinProposalAllowed({
          isSuppressed: await suppressions.isSuppressed(userId, { fingerprint, sourceMessageId: input.sourceMessageId }),
          alreadyRemembered: (await memories.findByFingerprint(userId, fingerprint)) !== undefined,
          alreadyProposed: await proposals.existsWithFingerprint(userId, fingerprint),
        })
        if (allowed) created.push(toMemoryProposalDto(await proposals.create(userId, { content, fingerprint, sourceMessageId: input.sourceMessageId })))
      }
      return created
    })
  }
}
