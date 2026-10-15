/**
 * Vue d'ensemble affichée sur le tableau de bord.
 */
import type { DashboardConsentStatus } from '../ports/DashboardReaders'

export interface DashboardOverviewDto {
  readonly preferredName: string | null
  readonly conversations: { count: number; latest: { id: string; title: string | null; lastActivityAt: string } | null }
  readonly memories: { count: number; pendingProposals: number }
  readonly journal: { count: number; latestEntryDate: string | null }
  readonly consents: { aiProcessing: DashboardConsentStatus; persistentMemory: DashboardConsentStatus }
}
