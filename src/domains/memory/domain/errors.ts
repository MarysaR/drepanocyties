/**
 * Erreurs métier propres à la mémoire.
 */
import { DomainError } from '@shared/errors/AppError'

export class DuplicateMemoryError extends DomainError {
  constructor() {
    super('MEMORY_ALREADY_EXISTS', 'Ce souvenir existe déjà.')
  }
}
