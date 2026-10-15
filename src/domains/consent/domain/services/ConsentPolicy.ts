/**
 * Version en vigueur de chaque texte de consentement : un accord donné
 * sur une version antérieure n'est plus considéré comme valable.
 */
import type { ConsentType } from '../value-objects/ConsentType'

export const currentConsentPolicyVersions: Record<ConsentType, string> = {
  AI_PROCESSING: '2026-10-v1',
  PERSISTENT_MEMORY: '2026-10-v1',
}
