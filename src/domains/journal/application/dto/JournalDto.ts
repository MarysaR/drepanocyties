/**
 * Contrats d'entrée et de sortie du journal.
 */
import { z } from 'zod'
import type { JournalEntry } from '../../domain/entities/JournalEntry'
import { moods, type Mood } from '../../domain/value-objects/Mood'

export const journalEntrySchema = z.object({
  title: z.string().trim().max(120, '120 caractères maximum.').transform(value => value || null).nullable(),
  content: z.string().trim().min(1, 'L’entrée est vide.').max(10_000, '10 000 caractères maximum.'),
  mood: z.enum(moods).nullable(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide.'),
})

export type JournalEntryInput = z.infer<typeof journalEntrySchema>

export interface JournalEntryDto {
  readonly id: string
  readonly title: string | null
  readonly content: string
  readonly mood: Mood | null
  readonly entryDate: string
  readonly updatedAt: string
}

export function toJournalEntryDto(entry: JournalEntry): JournalEntryDto {
  return { id: entry.id, title: entry.title, content: entry.content, mood: entry.mood, entryDate: entry.entryDate, updatedAt: entry.updatedAt.toISOString() }
}
