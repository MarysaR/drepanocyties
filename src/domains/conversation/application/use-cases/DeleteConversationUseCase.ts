/**
 * Supprime une conversation et tous ses messages.
 * Les souvenirs déjà acceptés sont conservés : ils se gèrent dans l'espace Souvenirs.
 */
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import type { ConversationRepository } from '../ports/ConversationRepository'

export class DeleteConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(userId: UserId, conversationId: string): Promise<void> {
    if (!(await this.conversations.delete(userId, conversationId))) throw new NotFoundError('conversation')
  }
}
