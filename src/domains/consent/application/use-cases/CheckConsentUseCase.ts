/**
 * Indique si un consentement est effectif (accordé sur la version en vigueur).
 */
import type { UserId } from '@shared/domain/UserId'
import { isConsentEffective } from '../../domain/entities/ConsentDecision'
import type { ConsentType } from '../../domain/value-objects/ConsentType'
import type { ConsentRepository } from '../ports/ConsentRepository'

export class CheckConsentUseCase {
  constructor(private readonly consents: ConsentRepository) {}

  async execute(userId: UserId, type: ConsentType): Promise<boolean> {
    return isConsentEffective(type, await this.consents.latestDecision(userId, type))
  }
}
