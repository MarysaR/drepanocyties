/**
 * Assemble la vue d'ensemble du tableau de bord de la personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { DashboardOverviewDto } from '../dto/DashboardDto'
import type { DashboardActivityReader, DashboardContextReader } from '../ports/DashboardReaders'

export class GetDashboardOverviewUseCase {
  constructor(private readonly activity: DashboardActivityReader, private readonly context: DashboardContextReader) {}

  async execute(userId: UserId): Promise<DashboardOverviewDto> {
    const [snapshot, preferredName, consents] = await Promise.all([
      this.activity.snapshot(userId),
      this.context.preferredName(userId),
      this.context.consentStatuses(userId),
    ])
    const latest = snapshot.latestConversation
    return {
      preferredName,
      conversations: {
        count: snapshot.conversationCount,
        latest: latest ? { id: latest.id, title: latest.title, lastActivityAt: latest.lastActivityAt.toISOString() } : null,
      },
      memories: { count: snapshot.memoryCount, pendingProposals: snapshot.pendingProposalCount },
      journal: { count: snapshot.journalEntryCount, latestEntryDate: snapshot.latestJournalEntryDate },
      consents,
    }
  }
}
