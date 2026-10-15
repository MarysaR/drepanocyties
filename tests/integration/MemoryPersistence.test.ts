import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { currentConsentPolicyVersions } from '@domains/consent/domain/services/ConsentPolicy'
import type { UserId } from '@shared/domain/UserId'
import { createTestContainer, resetDatabase } from './support/testContainer'

const { container, database, model } = createTestContainer()

describe('Mémoire persistée (PostgreSQL)', () => {
  let mary: UserId
  let conversationId: string

  afterAll(async () => {
    await resetDatabase(database)
    await database.$disconnect()
  })

  beforeEach(async () => {
    await resetDatabase(database)
    mary = (await container.identity.signIn.execute('test', 'mary-fictive')).user.id
    for (const type of ['AI_PROCESSING', 'PERSISTENT_MEMORY'] as const) {
      await container.consent.record.execute(mary, { type, granted: true, policyVersion: currentConsentPolicyVersions[type] })
    }
    conversationId = (await container.conversation.start.execute(mary)).id
  })

  it('chiffre les contenus personnels au repos', async () => {
    model.nextSuggestions = ['Mary aime le jazz manouche.']
    const sent = await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Mon secret : j’aime le jazz manouche.' })
    await container.memory.acceptProposal.execute(mary, { proposalId: sent.memoryProposals[0]!.id })
    await container.journal.create.execute(mary, { title: 'Titre intime', content: 'Contenu intime du journal', mood: null, entryDate: '2026-10-14' })
    await container.profile.update.execute(mary, { preferredName: 'Mary', aboutMe: 'Présentation intime', replyLength: 'BALANCED' })

    const rawRows = JSON.stringify(await database.$queryRawUnsafe(`
      SELECT (SELECT json_agg(m) FROM messages m) AS messages,
             (SELECT json_agg(me) FROM memories me) AS memories,
             (SELECT json_agg(j) FROM journal_entries j) AS journal,
             (SELECT json_agg(p) FROM profiles p) AS profiles,
             (SELECT json_agg(c) FROM conversations c) AS conversations`))
    for (const secret of ['jazz manouche', 'Titre intime', 'Contenu intime', 'Présentation intime', 'Mon secret']) {
      expect(rawRows).not.toContain(secret)
    }
  })

  it('ne réintroduit pas un souvenir corrigé puis supprimé (parcours complet persisté)', async () => {
    model.nextSuggestions = ['Mary habite à Lyon.']
    const first = await container.conversation.sendMessage.execute(mary, { conversationId, content: 'J’habite à Lyon.' })
    const memory = await container.memory.acceptProposal.execute(mary, { proposalId: first.memoryProposals[0]!.id })

    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Où est-ce que j’habite ?' })
    expect(model.requests.at(-1)?.instructions).toContain('Mary habite à Lyon.')

    await container.memory.correct.execute(mary, { memoryId: memory.id, content: 'Mary habite à Marseille.' })
    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Et maintenant ?' })
    expect(model.requests.at(-1)?.instructions).toContain('Mary habite à Marseille.')
    expect(model.requests.at(-1)?.instructions).not.toContain('Lyon')

    model.nextSuggestions = ['Mary habite à Lyon.']
    const retry = await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Je repense à Lyon.' })
    expect(retry.memoryProposals).toEqual([])

    await container.memory.delete.execute(mary, memory.id)
    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Tu te souviens ?' })
    expect(model.requests.at(-1)?.instructions).not.toContain('Marseille')
    expect(await database.memory.count({ where: { userId: mary } })).toBe(0)

    model.nextSuggestions = ['Mary habite à Marseille.']
    const afterDeletion = await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Marseille me manque.' })
    expect(afterDeletion.memoryProposals).toEqual([])
  })

  it('abandonne les propositions en attente quand la mémoire est désactivée', async () => {
    model.nextSuggestions = ['Mary fait du piano.']
    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Je fais du piano.' })
    expect(await database.memoryProposal.count({ where: { userId: mary } })).toBe(1)

    await container.consent.record.execute(mary, { type: 'PERSISTENT_MEMORY', granted: false, policyVersion: currentConsentPolicyVersions.PERSISTENT_MEMORY })
    expect(await database.memoryProposal.count({ where: { userId: mary } })).toBe(0)
    expect(await container.memory.authorized.execute(mary)).toEqual([])
  })

  it('conserve le message de la personne et la réponse ensemble, dans l’ordre', async () => {
    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Un' })
    await container.conversation.sendMessage.execute(mary, { conversationId, content: 'Deux' })
    const history = await container.conversation.history.execute(mary, conversationId)
    expect(history.messages.map(m => `${m.author}:${m.content}`)).toEqual(['PERSON:Un', 'TWIN:Réponse scriptée.', 'PERSON:Deux', 'TWIN:Réponse scriptée.'])
    expect(history.conversation.title).toBe('Un')
  })
})
