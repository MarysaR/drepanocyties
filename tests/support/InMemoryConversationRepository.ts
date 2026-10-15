/**
 * Double de test : conversations et messages en mémoire, filtrés par personne.
 */
import { randomUUID } from 'node:crypto'
import type { ConversationRepository, ExchangeToSave } from '@domains/conversation/application/ports/ConversationRepository'
import type { Conversation } from '@domains/conversation/domain/entities/Conversation'
import type { ConversationMessage } from '@domains/conversation/domain/entities/ConversationMessage'
import type { UserId } from '@shared/domain/UserId'

type Mutable<T> = { -readonly [K in keyof T]: T[K] }

export class InMemoryConversationRepository implements ConversationRepository {
  readonly conversations: Array<Mutable<Conversation> & { userId: UserId }> = []
  readonly messages: Array<ConversationMessage & { userId: UserId }> = []

  constructor(private readonly now: () => Date = () => new Date()) {}

  async create(userId: UserId): Promise<Conversation> {
    const conversation = { id: randomUUID(), userId, title: null, createdAt: this.now(), lastActivityAt: this.now() }
    this.conversations.push(conversation)
    return stripUser(conversation)
  }

  async list(userId: UserId) { return this.conversations.filter(c => c.userId === userId).map(stripUser) }

  async findById(userId: UserId, id: string) {
    const found = this.conversations.find(c => c.userId === userId && c.id === id)
    return found ? stripUser(found) : undefined
  }

  async listMessages(userId: UserId, conversationId: string) {
    return this.messages.filter(m => m.userId === userId && m.conversationId === conversationId).map(stripUser)
  }

  async recentMessages(userId: UserId, conversationId: string, limit: number) {
    return (await this.listMessages(userId, conversationId)).slice(-limit)
  }

  async findPersonMessage(userId: UserId, messageId: string) {
    const found = this.messages.find(m => m.userId === userId && m.id === messageId && m.author === 'PERSON')
    return found ? stripUser(found) : undefined
  }

  async saveExchange(userId: UserId, conversationId: string, exchange: ExchangeToSave) {
    const conversation = this.conversations.find(c => c.userId === userId && c.id === conversationId)
    if (!conversation) throw new Error('conversation absente')
    const personMessage = { id: randomUUID(), userId, conversationId, author: 'PERSON' as const, content: exchange.personContent, createdAt: this.now() }
    const twinMessage = { id: randomUUID(), userId, conversationId, author: 'TWIN' as const, content: exchange.twinContent, createdAt: this.now() }
    this.messages.push(personMessage, twinMessage)
    conversation.lastActivityAt = this.now()
    if (exchange.title && !conversation.title) conversation.title = exchange.title
    return { personMessage: stripUser(personMessage), twinMessage: stripUser(twinMessage) }
  }

  async delete(userId: UserId, id: string) {
    const index = this.conversations.findIndex(c => c.userId === userId && c.id === id)
    if (index < 0) return false
    this.conversations.splice(index, 1)
    for (let i = this.messages.length - 1; i >= 0; i--) if (this.messages[i]?.conversationId === id) this.messages.splice(i, 1)
    return true
  }
}

function stripUser<T extends { userId: UserId }>(row: T): Omit<T, 'userId'> {
  const { userId: _userId, ...rest } = row
  return rest
}
