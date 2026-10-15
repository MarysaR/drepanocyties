/**
 * Ajoute une entrée au journal émotionnel.
 */
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import { createEntryDate } from '../../domain/value-objects/EntryDate'
import { toJournalEntryDto, type JournalEntryDto, type JournalEntryInput } from '../dto/JournalDto'
import type { JournalRepository } from '../ports/JournalRepository'

export class CreateJournalEntryUseCase {
  constructor(private readonly journal: JournalRepository, private readonly clock: Clock) {}

  async execute(userId: UserId, input: JournalEntryInput): Promise<JournalEntryDto> {
    const entry = await this.journal.create(userId, { ...input, entryDate: createEntryDate(input.entryDate, this.clock.now()) })
    return toJournalEntryDto(entry)
  }
}
