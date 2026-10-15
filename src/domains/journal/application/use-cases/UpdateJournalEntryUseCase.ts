/**
 * Modifie une entrée du journal appartenant à la personne.
 */
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import { createEntryDate } from '../../domain/value-objects/EntryDate'
import { toJournalEntryDto, type JournalEntryDto, type JournalEntryInput } from '../dto/JournalDto'
import type { JournalRepository } from '../ports/JournalRepository'

export class UpdateJournalEntryUseCase {
  constructor(private readonly journal: JournalRepository, private readonly clock: Clock) {}

  async execute(userId: UserId, entryId: string, input: JournalEntryInput): Promise<JournalEntryDto> {
    const entry = await this.journal.update(userId, entryId, { ...input, entryDate: createEntryDate(input.entryDate, this.clock.now()) })
    if (!entry) throw new NotFoundError('journal_entry')
    return toJournalEntryDto(entry)
  }
}
