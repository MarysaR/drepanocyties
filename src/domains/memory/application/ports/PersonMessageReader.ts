/**
 * Contrat fourni par le domaine conversation : retrouver un message
 * écrit par la personne elle-même (jamais une réponse du jumeau).
 */
import type { UserId } from '@shared/domain/UserId'

export interface PersonMessageReader {
  findPersonMessage(userId: UserId, messageId: string): Promise<{ id: string; content: string } | undefined>
}
