/**
 * Seule source de souvenirs transmis au jumeau : les souvenirs retenus,
 * dans leur version courante, et uniquement si la mémoire est autorisée.
 */
import type { UserId } from '@shared/domain/UserId'
import type { MemoryConsentReader } from '../ports/MemoryConsentReader'
import type { MemoryUnitOfWork } from '../ports/MemoryStore'

export class GetAuthorizedMemoriesUseCase {
  constructor(private readonly store: MemoryUnitOfWork, private readonly consent: MemoryConsentReader) {}

  async execute(userId: UserId): Promise<string[]> {
    if (!(await this.consent.isMemoryAllowed(userId))) return []
    return this.store.run(async ({ memories }) => (await memories.list(userId)).map(memory => memory.content))
  }
}
