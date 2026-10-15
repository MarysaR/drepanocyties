/**
 * Réaction des autres domaines au retrait d'un consentement
 * (ex. abandon des propositions de souvenirs en attente).
 */
import type { UserId } from '@shared/domain/UserId'
import type { ConsentType } from '../../domain/value-objects/ConsentType'

export interface ConsentRevocationListener {
  onConsentRevoked(userId: UserId, type: ConsentType): Promise<void>
}
