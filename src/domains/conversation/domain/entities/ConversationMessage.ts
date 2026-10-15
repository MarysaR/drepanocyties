/**
 * Message d'une conversation, écrit par la personne ou par le jumeau.
 */
export type MessageAuthor = 'PERSON' | 'TWIN'

export interface ConversationMessage {
  readonly id: string
  readonly conversationId: string
  readonly author: MessageAuthor
  readonly content: string
  readonly createdAt: Date
}
