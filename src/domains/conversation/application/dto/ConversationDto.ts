/**
 * Contrats d'entrée et de sortie des conversations.
 */
import { z } from 'zod'
import type { Conversation } from '../../domain/entities/Conversation'
import type { ConversationMessage, MessageAuthor } from '../../domain/entities/ConversationMessage'
import { MESSAGE_MAX_LENGTH } from '../../domain/value-objects/MessageContent'
import type { SuggestedMemory } from '../ports/ConversationCollaborators'

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Le message est vide.').max(MESSAGE_MAX_LENGTH, `${MESSAGE_MAX_LENGTH} caractères maximum.`),
})

export interface ConversationDto {
  readonly id: string
  readonly title: string | null
  readonly createdAt: string
  readonly lastActivityAt: string
}

export interface MessageDto {
  readonly id: string
  readonly author: MessageAuthor
  readonly content: string
  readonly createdAt: string
}

export interface ConversationHistoryDto {
  readonly conversation: ConversationDto
  readonly messages: MessageDto[]
}

export interface SendMessageResultDto {
  readonly personMessage: MessageDto
  readonly twinMessage: MessageDto
  readonly memoryProposals: SuggestedMemory[]
  readonly memoryProposalsFailed: boolean
}

export function toConversationDto(conversation: Conversation): ConversationDto {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    lastActivityAt: conversation.lastActivityAt.toISOString(),
  }
}

export function toMessageDto(message: ConversationMessage): MessageDto {
  return { id: message.id, author: message.author, content: message.content, createdAt: message.createdAt.toISOString() }
}
