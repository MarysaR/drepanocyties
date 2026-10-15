/**
 * Retourne l'état courant de chaque consentement de la personne.
 */
import type { UserId } from '@shared/domain/UserId'
import { consentStatusOf } from '../../domain/entities/ConsentDecision'
import { currentConsentPolicyVersions } from '../../domain/services/ConsentPolicy'
import { consentTypes } from '../../domain/value-objects/ConsentType'
import type { ConsentStateDto } from '../dto/ConsentDto'
import type { ConsentRepository } from '../ports/ConsentRepository'

export class GetConsentStatesUseCase {
  constructor(private readonly consents: ConsentRepository) {}

  async execute(userId: UserId): Promise<ConsentStateDto[]> {
    return Promise.all(consentTypes.map(async (type) => {
      const decision = await this.consents.latestDecision(userId, type)
      return {
        type,
        status: consentStatusOf(type, decision),
        currentPolicyVersion: currentConsentPolicyVersions[type],
        decidedAt: decision?.decidedAt.toISOString() ?? null,
      }
    }))
  }
}
