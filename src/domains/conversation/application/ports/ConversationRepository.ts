/**
 * Accès aux conversations et messages, toujours filtré par personne.
 */
import type { UserId } from '@shared/domain/UserId'
import type { Conversation } from '../../domain/entities/Conversation'
import type { ConversationMessage } from '../../domain/entities/ConversationMessage'

export interface ExchangeToSave {
  readonly personContent: string
  readonly twinContent: string
  /** Titre à appliquer si la conversation n'en a pas encore. */
  readonly title: string | null
}

export interface ConversationRepository {
  create(userId: UserId): Promise<Conversation>
  list(userId: UserId): Promise<Conversation[]>
  findById(userId: UserId, id: string): Promise<Conversation | undefined>
  listMessages(userId: UserId, conversationId: string): Promise<ConversationMessage[]>
  recentMessages(userId: UserId, conversationId: string, limit: number): Promise<ConversationMessage[]>
  findPersonMessage(userId: UserId, messageId: string): Promise<ConversationMessage | undefined>
  /** Enregistre le message de la personne et la réponse du jumeau dans une même transaction. */
  saveExchange(userId: UserId, conversationId: string, exchange: ExchangeToSave): Promise<{ personMessage: ConversationMessage; twinMessage: ConversationMessage }>
  delete(userId: UserId, id: string): Promise<boolean>
}
