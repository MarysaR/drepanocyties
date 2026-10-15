/**
 * Entrée du journal émotionnel : espace privé, jamais transmis au jumeau.
 */
import type { Mood } from '../value-objects/Mood'

export interface JournalEntry {
  readonly id: string
  readonly title: string | null
  readonly content: string
  readonly mood: Mood | null
  readonly entryDate: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface JournalEntryDraft {
  readonly title: string | null
  readonly content: string
  readonly mood: Mood | null
  readonly entryDate: string
}
