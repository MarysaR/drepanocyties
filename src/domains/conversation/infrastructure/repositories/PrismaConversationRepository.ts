/**
 * Stockage PostgreSQL des conversations : messages chiffrés,
 * filtrage par personne et enregistrement transactionnel des échanges.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { ConversationRepository, ExchangeToSave } from '../../application/ports/ConversationRepository'
import type { Conversation } from '../../domain/entities/Conversation'
import type { ConversationMessage, MessageAuthor } from '../../domain/entities/ConversationMessage'

interface ConversationRow { id: string; titleEncrypted: string | null; createdAt: Date; lastActivityAt: Date }
interface MessageRow { id: string; conversationId: string; author: MessageAuthor; contentEncrypted: string; createdAt: Date }

export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  async create(userId: UserId): Promise<Conversation> {
    return this.toConversation(await this.db.conversation.create({ data: { userId } }))
  }

  async list(userId: UserId): Promise<Conversation[]> {
    const rows = await this.db.conversation.findMany({ where: { userId }, orderBy: { lastActivityAt: 'desc' } })
    return rows.map(row => this.toConversation(row))
  }

  async findById(userId: UserId, id: string): Promise<Conversation | undefined> {
    const row = await this.db.conversation.findFirst({ where: { id, userId } })
    return row ? this.toConversation(row) : undefined
  }

  async listMessages(userId: UserId, conversationId: string): Promise<ConversationMessage[]> {
    const rows = await this.db.message.findMany({ where: { conversationId, userId }, orderBy: { createdAt: 'asc' } })
    return rows.map(row => this.toMessage(row))
  }

  async recentMessages(userId: UserId, conversationId: string, limit: number): Promise<ConversationMessage[]> {
    const rows = await this.db.message.findMany({ where: { conversationId, userId }, orderBy: { createdAt: 'desc' }, take: limit })
    return rows.reverse().map(row => this.toMessage(row))
  }

  async findPersonMessage(userId: UserId, messageId: string): Promise<ConversationMessage | undefined> {
    const row = await this.db.message.findFirst({ where: { id: messageId, userId, author: 'PERSON' } })
    return row ? this.toMessage(row) : undefined
  }

  async saveExchange(userId: UserId, conversationId: string, exchange: ExchangeToSave) {
    return this.db.$transaction(async (tx) => {
      const personRow = await tx.message.create({
        data: { conversationId, userId, author: 'PERSON', contentEncrypted: this.cipher.encrypt(exchange.personContent) },
      })
      // Horodatage strictement postérieur pour garantir l'ordre d'affichage.
      const twinRow = await tx.message.create({
        data: {
          conversationId,
          userId,
          author: 'TWIN',
          contentEncrypted: this.cipher.encrypt(exchange.twinContent),
          createdAt: new Date(personRow.createdAt.getTime() + 1),
        },
      })
      const updated = await tx.conversation.updateMany({
        where: { id: conversationId, userId },
        data: {
          lastActivityAt: twinRow.createdAt,
          ...(exchange.title ? { titleEncrypted: this.cipher.encrypt(exchange.title) } : {}),
        },
      })
      if (updated.count !== 1) throw new Error('Conversation introuvable pendant l’enregistrement.')
      return { personMessage: this.toMessage(personRow), twinMessage: this.toMessage(twinRow) }
    })
  }

  async delete(userId: UserId, id: string): Promise<boolean> {
    const { count } = await this.db.conversation.deleteMany({ where: { id, userId } })
    return count === 1
  }

  private toConversation(row: ConversationRow): Conversation {
    return {
      id: row.id,
      title: row.titleEncrypted ? this.cipher.decrypt(row.titleEncrypted) : null,
      createdAt: row.createdAt,
      lastActivityAt: row.lastActivityAt,
    }
  }

  private toMessage(row: MessageRow): ConversationMessage {
    return { id: row.id, conversationId: row.conversationId, author: row.author, content: this.cipher.decrypt(row.contentEncrypted), createdAt: row.createdAt }
  }
}
