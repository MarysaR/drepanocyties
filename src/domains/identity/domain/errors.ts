/**
 * Erreurs métier propres à l'identité.
 */
import { ForbiddenError } from '@shared/errors/AppError'

export class RegistrationClosedError extends ForbiddenError {
  constructor() {
    super('REGISTRATION_CLOSED', 'Les inscriptions sont fermées sur cet espace.')
  }
}
