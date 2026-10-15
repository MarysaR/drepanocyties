/**
 * Contrat du modèle conversationnel, indépendant du fournisseur d'IA
 * (Anthropic aujourd'hui, un autre fournisseur demain).
 */
import type { MessageAuthor } from '../../domain/entities/ConversationMessage'
import type { TokenUsage } from '../../domain/value-objects/TokenUsage'

export interface TwinReplyRequest {
  readonly instructions: string
  readonly history: ReadonlyArray<{ readonly author: MessageAuthor; readonly content: string }>
  readonly canSuggestMemories: boolean
}

export interface TwinReply {
  readonly content: string
  /** Suggestions de souvenirs : jamais enregistrées sans décision de la personne. */
  readonly memorySuggestions: readonly string[]
  /** Modèle réellement utilisé et tokens consommés (tous appels confondus). */
  readonly model: string
  readonly usage: TokenUsage
}

export interface ConversationModel {
  generateReply(request: TwinReplyRequest): Promise<TwinReply>
}
