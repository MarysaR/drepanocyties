/**
 * Accès aux décisions de consentement d'une personne (journal append-only).
 */
import type { UserId } from '@shared/domain/UserId'
import type { ConsentDecision } from '../../domain/entities/ConsentDecision'
import type { ConsentType } from '../../domain/value-objects/ConsentType'

export interface ConsentRepository {
  latestDecision(userId: UserId, type: ConsentType): Promise<ConsentDecision | undefined>
  record(userId: UserId, decision: ConsentDecision): Promise<void>
}
