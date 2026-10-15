/**
 * Accès aux entrées du journal, toujours filtré par personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { JournalEntry, JournalEntryDraft } from '../../domain/entities/JournalEntry'

export interface JournalRepository {
  list(userId: UserId): Promise<JournalEntry[]>
  findById(userId: UserId, id: string): Promise<JournalEntry | undefined>
  create(userId: UserId, draft: JournalEntryDraft): Promise<JournalEntry>
  update(userId: UserId, id: string, draft: JournalEntryDraft): Promise<JournalEntry | undefined>
  delete(userId: UserId, id: string): Promise<boolean>
}
