import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { currentConsentPolicyVersions } from '@domains/consent/domain/services/ConsentPolicy'
import type { UserId } from '@shared/domain/UserId'
import { NotFoundError } from '@shared/errors/AppError'
import { createTestContainer, resetDatabase } from './support/testContainer'

const { container, database, model } = createTestContainer()

async function createConsentingUser(subject: string): Promise<UserId> {
  const { user } = await container.identity.signIn.execute('test', subject)
  for (const type of ['AI_PROCESSING', 'PERSISTENT_MEMORY'] as const) {
    await container.consent.record.execute(user.id, { type, granted: true, policyVersion: currentConsentPolicyVersions[type] })
  }
  return user.id
}

describe('Isolation entre deux comptes (PostgreSQL)', () => {
  let mary: UserId
  let aicha: UserId

  beforeAll(async () => { await resetDatabase(database) })
  afterAll(async () => {
    await resetDatabase(database)
    await database.$disconnect()
  })

  beforeEach(async () => {
    await resetDatabase(database)
    mary = await createConsentingUser('mary-fictive')
    aicha = await createConsentingUser('aicha-fictive')
  })

  it('cloisonne les conversations et leurs messages', async () => {
    const conversation = await container.conversation.start.execute(mary)
    await container.conversation.sendMessage.execute(mary, { conversationId: conversation.id, content: 'Bonjour' })

    expect(await container.conversation.list.execute(aicha)).toEqual([])
    await expect(container.conversation.history.execute(aicha, conversation.id)).rejects.toBeInstanceOf(NotFoundError)
    await expect(container.conversation.sendMessage.execute(aicha, { conversationId: conversation.id, content: 'Intrusion' })).rejects.toBeInstanceOf(NotFoundError)
    await expect(container.conversation.delete.execute(aicha, conversation.id)).rejects.toBeInstanceOf(NotFoundError)
    expect((await container.conversation.history.execute(mary, conversation.id)).messages).toHaveLength(2)
  })

  it('cloisonne les souvenirs et les propositions', async () => {
    const conversation = await container.conversation.start.execute(mary)
    model.nextSuggestions = ['Mary aime le jazz.']
    const sent = await container.conversation.sendMessage.execute(mary, { conversationId: conversation.id, content: 'J’adore le jazz.' })
    const [proposal] = sent.memoryProposals
    expect(proposal).toBeDefined()

    await expect(container.memory.acceptProposal.execute(aicha, { proposalId: proposal!.id })).rejects.toBeInstanceOf(NotFoundError)
    const memory = await container.memory.acceptProposal.execute(mary, { proposalId: proposal!.id })

    await expect(container.memory.correct.execute(aicha, { memoryId: memory.id, content: 'Modifié par Aïcha' })).rejects.toBeInstanceOf(NotFoundError)
    await expect(container.memory.delete.execute(aicha, memory.id)).rejects.toBeInstanceOf(NotFoundError)
    await expect(container.memory.create.execute(aicha, { content: 'J’adore le jazz.', sourceMessageId: sent.personMessage.id })).rejects.toBeInstanceOf(NotFoundError)
    expect((await container.memory.list.execute(aicha)).memories).toEqual([])
    expect(await container.memory.authorized.execute(aicha)).toEqual([])
    expect(await container.memory.authorized.execute(mary)).toEqual(['Mary aime le jazz.'])
  })

  it('cloisonne le journal', async () => {
    const entry = await container.journal.create.execute(mary, { title: null, content: 'Journée calme.', mood: 'CALM', entryDate: '2026-10-14' })
    expect(await container.journal.list.execute(aicha)).toEqual([])
    await expect(container.journal.update.execute(aicha, entry.id, { title: null, content: 'X', mood: null, entryDate: '2026-10-14' })).rejects.toBeInstanceOf(NotFoundError)
    await expect(container.journal.delete.execute(aicha, entry.id)).rejects.toBeInstanceOf(NotFoundError)
    expect((await container.journal.list.execute(mary))[0]?.content).toBe('Journée calme.')
  })

  it('cloisonne le profil, le tableau de bord et l’export', async () => {
    await container.profile.update.execute(mary, { preferredName: 'Mary', aboutMe: 'Je chante.', replyLength: 'SHORT' })
    expect((await container.profile.get.execute(aicha)).preferredName).toBeNull()
    expect((await container.dashboard.overview.execute(aicha)).preferredName).toBeNull()
    const exported = await container.privacy.export.execute(aicha)
    expect(JSON.stringify(exported)).not.toContain('Je chante.')
  })

  it('efface toutes les données d’une personne sans toucher à celles de l’autre', async () => {
    const maryConversation = await container.conversation.start.execute(mary)
    await container.conversation.sendMessage.execute(mary, { conversationId: maryConversation.id, content: 'Bonjour' })
    const aichaConversation = await container.conversation.start.execute(aicha)
    await container.conversation.sendMessage.execute(aicha, { conversationId: aichaConversation.id, content: 'Salut' })

    await container.privacy.eraseAll.execute(mary, { confirmation: 'SUPPRIMER' })

    expect(await database.user.count({ where: { id: mary } })).toBe(0)
    expect(await database.message.count({ where: { userId: mary } })).toBe(0)
    expect(await database.consentDecision.count({ where: { userId: mary } })).toBe(0)
    await expect(container.identity.requireExistingUser.execute(mary)).rejects.toThrow()
    expect((await container.conversation.history.execute(aicha, aichaConversation.id)).messages).toHaveLength(2)
  })
})
