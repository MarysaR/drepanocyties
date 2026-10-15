/**
 * Date d'une entrée de journal (AAAA-MM-JJ), qui ne peut pas être dans le futur.
 */
import { ValidationError } from '@shared/errors/AppError'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function createEntryDate(raw: string, today: Date): string {
  const parsed = new Date(`${raw}T00:00:00.000Z`)
  const isValid = ISO_DATE.test(raw) && !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(raw)
  if (!isValid) throw new ValidationError('Date invalide.', [{ path: 'entryDate', message: 'Date invalide.' }])

  // Tolérance d'un jour pour les fuseaux horaires en avance sur UTC.
  const latestAllowed = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (raw > latestAllowed) throw new ValidationError('La date ne peut pas être dans le futur.', [{ path: 'entryDate', message: 'Date future.' }])
  return raw
}
