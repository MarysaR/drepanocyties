/**
 * Contrats d'entrée et de sortie du domaine consentement.
 */
import { z } from 'zod'
import { consentTypes, type ConsentType } from '../../domain/value-objects/ConsentType'
import type { ConsentStatus } from '../../domain/entities/ConsentDecision'

export const recordConsentDecisionSchema = z.object({
  type: z.enum(consentTypes),
  granted: z.boolean(),
  policyVersion: z.string().min(1).max(32),
})

export type RecordConsentDecisionInput = z.infer<typeof recordConsentDecisionSchema>

export interface ConsentStateDto {
  readonly type: ConsentType
  readonly status: ConsentStatus
  readonly currentPolicyVersion: string
  readonly decidedAt: string | null
}
