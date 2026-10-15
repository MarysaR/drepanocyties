/**
 * Liste les conversations de la personne, la plus récente en premier.
 */
import type { UserId } from '@shared/domain/UserId'
import { toConversationDto, type ConversationDto } from '../dto/ConversationDto'
import type { ConversationRepository } from '../ports/ConversationRepository'

export class ListConversationsUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(userId: UserId): Promise<ConversationDto[]> {
    const conversations = await this.conversations.list(userId)
    return conversations
      .toSorted((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
      .map(toConversationDto)
  }
}
