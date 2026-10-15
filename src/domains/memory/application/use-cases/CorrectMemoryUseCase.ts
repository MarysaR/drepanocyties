/**
 * Corrige un souvenir : seule la nouvelle version est conservée et
 * l'ancienne ne pourra plus être réintroduite par le jumeau.
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import { DuplicateMemoryError } from '../../domain/errors'
import { createMemoryContent } from '../../domain/value-objects/MemoryContent'
import { toMemoryDto, type MemoryDto } from '../dto/MemoryDto'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class CorrectMemoryUseCase {
  constructor(private readonly store: MemoryUnitOfWork, private readonly fingerprinter: ContentFingerprinter) {}

  async execute(userId: UserId, input: { memoryId: string; content: string }): Promise<MemoryDto> {
    const content = createMemoryContent(input.content)
    const fingerprint = this.fingerprinter.fingerprint(content)

    return this.store.run(async ({ memories, suppressions }) => {
      const memory = await memories.findById(userId, input.memoryId)
      if (!memory) throw new NotFoundError('memory')

      const previousFingerprint = this.fingerprinter.fingerprint(memory.content)
      if (previousFingerprint === fingerprint) return toMemoryDto(memory)

      const duplicate = await memories.findByFingerprint(userId, fingerprint)
      if (duplicate && duplicate.id !== memory.id) throw new DuplicateMemoryError()

      await suppressions.add(userId, { fingerprint: previousFingerprint, sourceMessageId: memory.sourceMessageId, reason: 'CORRECTED' })
      return toMemoryDto(await memories.updateContent(userId, memory.id, content, fingerprint))
    })
  }
}
