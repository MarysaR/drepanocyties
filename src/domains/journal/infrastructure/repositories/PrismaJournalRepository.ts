/**
 * Stockage PostgreSQL du journal, avec chiffrement du titre et du contenu.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { JournalRepository } from '../../application/ports/JournalRepository'
import type { JournalEntry, JournalEntryDraft } from '../../domain/entities/JournalEntry'
import type { Mood } from '../../domain/value-objects/Mood'

interface JournalRow {
  id: string
  titleEncrypted: string | null
  contentEncrypted: string
  mood: Mood | null
  entryDate: Date
  createdAt: Date
  updatedAt: Date
}

export class PrismaJournalRepository implements JournalRepository {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  async list(userId: UserId): Promise<JournalEntry[]> {
    const rows = await this.db.journalEntry.findMany({ where: { userId }, orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }] })
    return rows.map(row => this.toEntry(row))
  }

  async findById(userId: UserId, id: string): Promise<JournalEntry | undefined> {
    const row = await this.db.journalEntry.findFirst({ where: { id, userId } })
    return row ? this.toEntry(row) : undefined
  }

  async create(userId: UserId, draft: JournalEntryDraft): Promise<JournalEntry> {
    return this.toEntry(await this.db.journalEntry.create({ data: { userId, ...this.toData(draft) } }))
  }

  async update(userId: UserId, id: string, draft: JournalEntryDraft): Promise<JournalEntry | undefined> {
    const { count } = await this.db.journalEntry.updateMany({ where: { id, userId }, data: this.toData(draft) })
    return count === 1 ? this.findById(userId, id) : undefined
  }

  async delete(userId: UserId, id: string): Promise<boolean> {
    const { count } = await this.db.journalEntry.deleteMany({ where: { id, userId } })
    return count === 1
  }

  private toData(draft: JournalEntryDraft) {
    return {
      titleEncrypted: draft.title === null ? null : this.cipher.encrypt(draft.title),
      contentEncrypted: this.cipher.encrypt(draft.content),
      mood: draft.mood,
      entryDate: new Date(`${draft.entryDate}T00:00:00.000Z`),
    }
  }

  private toEntry(row: JournalRow): JournalEntry {
    return {
      id: row.id,
      title: row.titleEncrypted === null ? null : this.cipher.decrypt(row.titleEncrypted),
      content: this.cipher.decrypt(row.contentEncrypted),
      mood: row.mood,
      entryDate: row.entryDate.toISOString().slice(0, 10),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
