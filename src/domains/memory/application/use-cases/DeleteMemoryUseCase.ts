/**
 * Supprime définitivement un souvenir et empêche le jumeau
 * de le reproposer (seule une empreinte non réversible est conservée).
 */
import type { ContentFingerprinter } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class DeleteMemoryUseCase {
  constructor(private readonly store: MemoryUnitOfWork, private readonly fingerprinter: ContentFingerprinter) {}

  async execute(userId: UserId, memoryId: string): Promise<void> {
    await this.store.run(async ({ memories, suppressions }) => {
      const memory = await memories.findById(userId, memoryId)
      if (!memory) throw new NotFoundError('memory')
      await suppressions.add(userId, {
        fingerprint: this.fingerprinter.fingerprint(memory.content),
        sourceMessageId: memory.sourceMessageId,
        reason: 'DELETED',
      })
      await memories.delete(userId, memory.id)
    })
  }
}
