/**
 * Utilisé lorsqu'aucune clé d'IA n'est configurée : échoue explicitement
 * au lieu de simuler une réponse.
 */
import type { ConversationModel, TwinReply } from '@domains/conversation/application/ports/ConversationModel'
import { TechnicalError } from '@shared/errors/AppError'

export class UnconfiguredConversationModel implements ConversationModel {
  async generateReply(): Promise<TwinReply> {
    throw new TechnicalError('AI_NOT_CONFIGURED', { message: 'Le service conversationnel n’est pas configuré sur ce serveur.' })
  }
}
