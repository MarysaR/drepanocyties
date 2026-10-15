/**
 * Libellés des humeurs proposées dans le journal.
 */
import type { Mood } from '@domains/journal/domain/value-objects/Mood'

export const moodLabels: Record<Mood, string> = {
  CALM: 'Apaisé·e',
  JOYFUL: 'Joyeux·se',
  GRATEFUL: 'Reconnaissant·e',
  TIRED: 'Fatigué·e',
  WORRIED: 'Inquiet·ète',
  SAD: 'Triste',
  ANGRY: 'En colère',
  OVERWHELMED: 'Submergé·e',
}
