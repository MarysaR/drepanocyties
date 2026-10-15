/**
 * Contenu d'un souvenir : texte non vide et court, pour rester
 * lisible, vérifiable et corrigeable par la personne.
 */
import { ValidationError } from '@shared/errors/AppError'

export const MEMORY_CONTENT_MAX_LENGTH = 500

export function tryCreateMemoryContent(raw: string): string | undefined {
  const content = raw.trim().replace(/\s+/g, ' ')
  if (content.length < 2 || content.length > MEMORY_CONTENT_MAX_LENGTH) return undefined
  return content
}

export function createMemoryContent(raw: string): string {
  const content = tryCreateMemoryContent(raw)
  if (content === undefined) {
    throw new ValidationError('Le souvenir doit contenir entre 2 et 500 caractères.', [
      { path: 'content', message: 'Entre 2 et 500 caractères.' },
    ])
  }
  return content
}
