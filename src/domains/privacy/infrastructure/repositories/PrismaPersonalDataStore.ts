/**
 * Collecte (avec déchiffrement) et effacement transactionnel de toutes les données
 * d'une personne dans PostgreSQL.
 */
import type { ContentCipher } from '@shared/application/ContentProtection'
import type { UserId } from '@shared/domain/UserId'
import type { DatabaseClient } from '@shared/infrastructure/prisma/createPrismaClient'
import type { PersonalDataExport } from '../../application/dto/PersonalDataExport'
import type { PersonalDataCollector, PersonalDataEraser } from '../../application/ports/PersonalDataPorts'

export class PrismaPersonalDataStore implements PersonalDataCollector, PersonalDataEraser {
  constructor(private readonly db: DatabaseClient, private readonly cipher: ContentCipher) {}

  async collect(userId: UserId): Promise<PersonalDataExport> {
    const decrypt = (value: string) => this.cipher.decrypt(value)
    const decryptOptional = (value: string | null) => (value === null ? null : decrypt(value))

    const user = await this.db.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        profile: true,
        conversations: { orderBy: { createdAt: 'asc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } },
        memories: { orderBy: { createdAt: 'asc' } },
        memoryProposals: { orderBy: { createdAt: 'asc' } },
        memorySuppressions: { orderBy: { createdAt: 'asc' } },
        journalEntries: { orderBy: { entryDate: 'asc' } },
        consentDecisions: { orderBy: { decidedAt: 'asc' } },
      },
    })

    return {
      account: { createdAt: user.createdAt.toISOString(), authProvider: user.authProvider },
      profile: user.profile
        ? { preferredName: decryptOptional(user.profile.preferredNameEncrypted), aboutMe: decryptOptional(user.profile.aboutMeEncrypted), replyLength: user.profile.replyLength }
        : null,
      conversations: user.conversations.map(conversation => ({
        id: conversation.id,
        title: decryptOptional(conversation.titleEncrypted),
        createdAt: conversation.createdAt.toISOString(),
        messages: conversation.messages.map(message => ({ author: message.author, content: decrypt(message.contentEncrypted), createdAt: message.createdAt.toISOString() })),
      })),
      memories: user.memories.map(memory => ({
        content: decrypt(memory.contentEncrypted),
        origin: memory.origin,
        consentedAt: memory.consentedAt.toISOString(),
        updatedAt: memory.updatedAt.toISOString(),
      })),
      pendingMemoryProposals: user.memoryProposals.map(proposal => ({ content: decrypt(proposal.contentEncrypted), createdAt: proposal.createdAt.toISOString() })),
      memorySuppressions: user.memorySuppressions.map(suppression => ({
        reason: suppression.reason,
        createdAt: suppression.createdAt.toISOString(),
        note: 'Empreinte non réversible d’un contenu que le jumeau ne doit plus proposer ; aucun texte n’est conservé.',
      })),
      journalEntries: user.journalEntries.map(entry => ({
        title: decryptOptional(entry.titleEncrypted),
        content: decrypt(entry.contentEncrypted),
        mood: entry.mood,
        entryDate: entry.entryDate.toISOString().slice(0, 10),
      })),
      consentDecisions: user.consentDecisions.map(decision => ({
        type: decision.type,
        granted: decision.granted,
        policyVersion: decision.policyVersion,
        decidedAt: decision.decidedAt.toISOString(),
      })),
    }
  }

  async eraseAll(userId: UserId): Promise<void> {
    // La suppression du compte entraîne, par cascade, celle de toutes les données liées.
    await this.db.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { userId } })
      await tx.user.deleteMany({ where: { id: userId } })
    })
  }
}
