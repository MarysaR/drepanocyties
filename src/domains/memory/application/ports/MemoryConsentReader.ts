/**
 * Contrat fourni par le domaine consentement : la mémoire permanente est-elle autorisée ?
 */
import type { UserId } from '@shared/domain/UserId'

export interface MemoryConsentReader {
  isMemoryAllowed(userId: UserId): Promise<boolean>
}
