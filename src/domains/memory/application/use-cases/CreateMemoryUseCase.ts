/**
 * Crée un souvenir choisi par la personne : texte rédigé librement
 * ou l'un de ses propres messages qu'elle décide de retenir.
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import { ConsentRequiredError, NotFoundError } from '@shared/errors/AppError'
import { DuplicateMemoryError } from '../../domain/errors'
import { createMemoryContent } from '../../domain/value-objects/MemoryContent'
import { toMemoryDto, type CreateMemoryInput, type MemoryDto } from '../dto/MemoryDto'
import type { MemoryConsentReader } from '../ports/MemoryConsentReader'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'
import type { PersonMessageReader } from '../ports/PersonMessageReader'

export class CreateMemoryUseCase {
  constructor(
    private readonly store: MemoryUnitOfWork,
    private readonly consent: MemoryConsentReader,
    private readonly messages: PersonMessageReader,
    private readonly fingerprinter: ContentFingerprinter,
    private readonly clock: Clock,
  ) {}

  async execute(userId: UserId, input: CreateMemoryInput): Promise<MemoryDto> {
    if (!(await this.consent.isMemoryAllowed(userId))) throw new ConsentRequiredError('PERSISTENT_MEMORY')

    const sourceMessageId = input.sourceMessageId ?? null
    if (sourceMessageId && !(await this.messages.findPersonMessage(userId, sourceMessageId))) {
      throw new NotFoundError('message')
    }

    const content = createMemoryContent(input.content)
    const fingerprint = this.fingerprinter.fingerprint(content)

    return this.store.run(async ({ memories }) => {
      if (await memories.findByFingerprint(userId, fingerprint)) throw new DuplicateMemoryError()
      return toMemoryDto(await memories.create(userId, {
        content,
        fingerprint,
        origin: sourceMessageId ? 'PERSON_MESSAGE' : 'WRITTEN_BY_PERSON',
        sourceMessageId,
        consentedAt: this.clock.now(),
      }))
    })
  }
}
