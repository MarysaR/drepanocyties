/**
 * Liste les entrées du journal, les plus récentes en premier.
 */
import type { UserId } from '@shared/domain/UserId'
import { toJournalEntryDto, type JournalEntryDto } from '../dto/JournalDto'
import type { JournalRepository } from '../ports/JournalRepository'

export class ListJournalEntriesUseCase {
  constructor(private readonly journal: JournalRepository) {}

  async execute(userId: UserId): Promise<JournalEntryDto[]> {
    return (await this.journal.list(userId)).map(toJournalEntryDto)
  }
}
