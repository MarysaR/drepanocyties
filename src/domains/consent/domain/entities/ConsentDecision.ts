/**
 * Décision de consentement horodatée et règle d'interprétation
 * de son statut courant (accordé, refusé, non décidé, obsolète).
 */
import { currentConsentPolicyVersions } from '../services/ConsentPolicy'
import type { ConsentType } from '../value-objects/ConsentType'

export interface ConsentDecision {
  readonly type: ConsentType
  readonly granted: boolean
  readonly policyVersion: string
  readonly decidedAt: Date
}

export type ConsentStatus = 'granted' | 'refused' | 'not_decided' | 'outdated'

export function consentStatusOf(type: ConsentType, decision: ConsentDecision | undefined): ConsentStatus {
  if (!decision) return 'not_decided'
  if (!decision.granted) return 'refused'
  return decision.policyVersion === currentConsentPolicyVersions[type] ? 'granted' : 'outdated'
}

export function isConsentEffective(type: ConsentType, decision: ConsentDecision | undefined): boolean {
  return consentStatusOf(type, decision) === 'granted'
}
