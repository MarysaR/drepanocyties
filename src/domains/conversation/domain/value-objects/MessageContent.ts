/**
 * Contenu d'un message de la personne : non vide, longueur bornée.
 */
import { ValidationError } from '@shared/errors/AppError'

export const MESSAGE_MAX_LENGTH = 4000

export function createMessageContent(raw: string): string {
  const content = raw.trim()
  if (content.length === 0 || content.length > MESSAGE_MAX_LENGTH) {
    throw new ValidationError(`Le message doit contenir entre 1 et ${MESSAGE_MAX_LENGTH} caractères.`, [
      { path: 'content', message: `Entre 1 et ${MESSAGE_MAX_LENGTH} caractères.` },
    ])
  }
  return content
}
