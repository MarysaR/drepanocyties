/**
 * Efface toutes les données de la personne, après confirmation explicite.
 */
import type { UserId } from '@shared/domain/UserId'
import { ValidationError } from '@shared/errors/AppError'
import { ERASURE_CONFIRMATION } from '../dto/PersonalDataExport'
import type { PersonalDataEraser } from '../ports/PersonalDataPorts'

export class EraseAllPersonalDataUseCase {
  constructor(private readonly eraser: PersonalDataEraser) {}

  async execute(userId: UserId, input: { confirmation: string }): Promise<void> {
    if (input.confirmation.trim() !== ERASURE_CONFIRMATION) {
      throw new ValidationError(`Pour confirmer, saisissez « ${ERASURE_CONFIRMATION} ».`, [
        { path: 'confirmation', message: `Saisissez ${ERASURE_CONFIRMATION}.` },
      ])
    }
    await this.eraser.eraseAll(userId)
  }
}
