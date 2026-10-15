/**
 * Ouvre une nouvelle conversation vide.
 */
import type { UserId } from '@shared/domain/UserId'
import { toConversationDto, type ConversationDto } from '../dto/ConversationDto'
import type { ConversationRepository } from '../ports/ConversationRepository'

export class StartConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(userId: UserId): Promise<ConversationDto> {
    return toConversationDto(await this.conversations.create(userId))
  }
}
