/**
 * Enregistre un accord ou un retrait de consentement. Un accord n'est accepté
 * que sur la version en vigueur du texte ; un retrait prévient les autres domaines.
 */
import { DomainError } from '@shared/errors/AppError'
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import { currentConsentPolicyVersions } from '../../domain/services/ConsentPolicy'
import type { RecordConsentDecisionInput } from '../dto/ConsentDto'
import type { ConsentRepository } from '../ports/ConsentRepository'
import type { ConsentRevocationListener } from '../ports/ConsentRevocationListener'

export class OutdatedConsentPolicyError extends DomainError {
  constructor() {
    super('OUTDATED_CONSENT_POLICY', 'Le texte de consentement a évolué : merci de relire la version actuelle.')
  }
}

export class RecordConsentDecisionUseCase {
  constructor(
    private readonly consents: ConsentRepository,
    private readonly revocationListener: ConsentRevocationListener,
    private readonly clock: Clock,
  ) {}

  async execute(userId: UserId, input: RecordConsentDecisionInput): Promise<void> {
    const currentVersion = currentConsentPolicyVersions[input.type]
    if (input.granted && input.policyVersion !== currentVersion) throw new OutdatedConsentPolicyError()

    await this.consents.record(userId, {
      type: input.type,
      granted: input.granted,
      policyVersion: currentVersion,
      decidedAt: this.clock.now(),
    })

    if (!input.granted) await this.revocationListener.onConsentRevoked(userId, input.type)
  }
}
