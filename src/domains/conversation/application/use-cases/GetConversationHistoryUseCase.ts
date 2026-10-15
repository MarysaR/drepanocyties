/**
 * Retourne une conversation et l'ensemble de ses messages pour la reprendre.
 */
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import { toConversationDto, toMessageDto, type ConversationHistoryDto } from '../dto/ConversationDto'
import type { ConversationRepository } from '../ports/ConversationRepository'

export class GetConversationHistoryUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(userId: UserId, conversationId: string): Promise<ConversationHistoryDto> {
    const conversation = await this.conversations.findById(userId, conversationId)
    if (!conversation) throw new NotFoundError('conversation')
    const messages = await this.conversations.listMessages(userId, conversation.id)
    return { conversation: toConversationDto(conversation), messages: messages.map(toMessageDto) }
  }
}
