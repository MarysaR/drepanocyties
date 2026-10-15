/**
 * Supprime définitivement une entrée du journal.
 */
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import type { JournalRepository } from '../ports/JournalRepository'

export class DeleteJournalEntryUseCase {
  constructor(private readonly journal: JournalRepository) {}

  async execute(userId: UserId, entryId: string): Promise<void> {
    if (!(await this.journal.delete(userId, entryId))) throw new NotFoundError('journal_entry')
  }
}
