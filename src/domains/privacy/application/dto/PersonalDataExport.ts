/**
 * Format de l'export des données personnelles (lisible, en clair pour la personne).
 */
import { z } from 'zod'

export interface PersonalDataExport {
  readonly profile: { preferredName: string | null; aboutMe: string | null; replyLength: string } | null
  readonly conversations: Array<{
    id: string
    title: string | null
    createdAt: string
    messages: Array<{ author: string; content: string; createdAt: string }>
  }>
  readonly memories: Array<{ content: string; origin: string; consentedAt: string; updatedAt: string }>
  readonly pendingMemoryProposals: Array<{ content: string; createdAt: string }>
  readonly memorySuppressions: Array<{ reason: string; createdAt: string; note: string }>
  readonly journalEntries: Array<{ title: string | null; content: string; mood: string | null; entryDate: string }>
  readonly consentDecisions: Array<{ type: string; granted: boolean; policyVersion: string; decidedAt: string }>
  readonly account: { createdAt: string; authProvider: string }
}

export interface PersonalDataExportDocument extends PersonalDataExport {
  readonly exportedAt: string
  readonly notice: string
}

export const ERASURE_CONFIRMATION = 'SUPPRIMER'

export const eraseAllDataSchema = z.object({ confirmation: z.string() })
