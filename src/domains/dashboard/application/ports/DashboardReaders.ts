/**
 * Contrats de lecture du tableau de bord : activité agrégée (lecture seule)
 * et informations fournies par les domaines profil et consentement.
 */
import type { UserId } from '@shared/domain/UserId'

export interface ActivitySnapshot {
  readonly conversationCount: number
  readonly latestConversation: { id: string; title: string | null; lastActivityAt: Date } | null
  readonly memoryCount: number
  readonly pendingProposalCount: number
  readonly journalEntryCount: number
  readonly latestJournalEntryDate: string | null
}

export interface DashboardActivityReader {
  snapshot(userId: UserId): Promise<ActivitySnapshot>
}

export type DashboardConsentStatus = 'granted' | 'refused' | 'not_decided' | 'outdated'

export interface DashboardContextReader {
  preferredName(userId: UserId): Promise<string | null>
  consentStatuses(userId: UserId): Promise<{ aiProcessing: DashboardConsentStatus; persistentMemory: DashboardConsentStatus }>
}
