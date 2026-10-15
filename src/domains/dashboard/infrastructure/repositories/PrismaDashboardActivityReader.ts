/**
 * Lecture agrégée (comptages) de l'activité d'une personne pour le tableau de bord.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { ActivitySnapshot, DashboardActivityReader } from '../../application/ports/DashboardReaders'

export class PrismaDashboardActivityReader implements DashboardActivityReader {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  async snapshot(userId: UserId): Promise<ActivitySnapshot> {
    const [conversationCount, latest, memoryCount, pendingProposalCount, journalEntryCount, latestEntry] = await Promise.all([
      this.db.conversation.count({ where: { userId } }),
      this.db.conversation.findFirst({ where: { userId }, orderBy: { lastActivityAt: 'desc' } }),
      this.db.memory.count({ where: { userId } }),
      this.db.memoryProposal.count({ where: { userId } }),
      this.db.journalEntry.count({ where: { userId } }),
      this.db.journalEntry.findFirst({ where: { userId }, orderBy: { entryDate: 'desc' }, select: { entryDate: true } }),
    ])
    return {
      conversationCount,
      latestConversation: latest
        ? { id: latest.id, title: latest.titleEncrypted ? this.cipher.decrypt(latest.titleEncrypted) : null, lastActivityAt: latest.lastActivityAt }
        : null,
      memoryCount,
      pendingProposalCount,
      journalEntryCount,
      latestJournalEntryDate: latestEntry ? latestEntry.entryDate.toISOString().slice(0, 10) : null,
    }
  }
}
