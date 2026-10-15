import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConversationModel, TwinReplyRequest } from '@domains/conversation/application/ports/ConversationModel'
import { SendMessageUseCase } from '@domains/conversation/application/use-cases/SendMessageUseCase'
import { ConsentRequiredError, NotFoundError, RateLimitedError, TechnicalError, ValidationError } from '@shared/errors/AppError'
import type { UserId } from '@shared/domain/UserId'
import { InMemoryConversationRepository } from '../../support/InMemoryConversationRepository'
import { aicha, mary } from '../../support/fixtures'

function createHarness() {
  const repository = new InMemoryConversationRepository()
  const aiAllowed = new Set<UserId>([mary, aicha])
  const memoryAllowed = new Set<UserId>([mary])
  const memories = new Map<UserId, string[]>([[mary, ['Mary aime le jazz.']]])
  const requests: TwinReplyRequest[] = []
  let limited = false
  const model: ConversationModel = {
    generateReply: vi.fn(async (request: TwinReplyRequest) => {
      requests.push(request)
      return { content: 'Je vous écoute.', memorySuggestions: ['Mary joue du violoncelle.'] }
    }),
  }
  const recordSuggestions = vi.fn(async (_userId: UserId, input: { sourceMessageId: string; suggestions: readonly string[] }) =>
    input.suggestions.map((content, index) => ({ id: `proposal-${index}`, content })))

  const useCase = new SendMessageUseCase({
    conversations: repository,
    model,
    rateLimiter: { consume: () => (limited ? { allowed: false, retryAfterSeconds: 30 } : { allowed: true }) },
    consent: {
      isAiProcessingAllowed: async userId => aiAllowed.has(userId),
      isMemoryAllowed: async userId => memoryAllowed.has(userId),
    },
    memory: { authorizedMemories: async userId => memories.get(userId) ?? [], recordSuggestions },
    profile: { twinProfile: async () => ({ preferredName: 'Mary', aboutMe: null, replyLength: 'BALANCED' }) },
  })

  return {
    repository, model, requests, recordSuggestions, useCase, aiAllowed, memoryAllowed, memories,
    limit: () => { limited = true },
  }
}

describe('Envoi d’un message au jumeau', () => {
  let harness: ReturnType<typeof createHarness>
  let conversationId: string

  beforeEach(async () => {
    harness = createHarness()
    conversationId = (await harness.repository.create(mary)).id
  })

  it("enregistre l'échange et donne un titre à partir du premier message", async () => {
    const result = await harness.useCase.execute(mary, { conversationId, content: '  Bonjour, je suis fatiguée aujourd’hui.  ' })
    expect(result.personMessage.content).toBe('Bonjour, je suis fatiguée aujourd’hui.')
    expect(result.twinMessage.content).toBe('Je vous écoute.')
    expect(harness.repository.messages).toHaveLength(2)
    expect(harness.repository.conversations[0]?.title).toBe('Bonjour, je suis fatiguée aujourd’hui.')
  })

  it("exige le consentement au traitement par l'IA avant tout appel", async () => {
    harness.aiAllowed.delete(mary)
    await expect(harness.useCase.execute(mary, { conversationId, content: 'Bonjour' })).rejects.toBeInstanceOf(ConsentRequiredError)
    expect(harness.model.generateReply).not.toHaveBeenCalled()
    expect(harness.repository.messages).toHaveLength(0)
  })

  it("refuse d'écrire dans la conversation d'une autre personne", async () => {
    await expect(harness.useCase.execute(aicha, { conversationId, content: 'Bonjour' })).rejects.toBeInstanceOf(NotFoundError)
    expect(harness.model.generateReply).not.toHaveBeenCalled()
  })

  it('limite les appels au modèle', async () => {
    harness.limit()
    await expect(harness.useCase.execute(mary, { conversationId, content: 'Bonjour' })).rejects.toBeInstanceOf(RateLimitedError)
    expect(harness.model.generateReply).not.toHaveBeenCalled()
  })

  it('valide le contenu du message', async () => {
    await expect(harness.useCase.execute(mary, { conversationId, content: '   ' })).rejects.toBeInstanceOf(ValidationError)
    await expect(harness.useCase.execute(mary, { conversationId, content: 'a'.repeat(4001) })).rejects.toBeInstanceOf(ValidationError)
  })

  it('ne transmet au modèle que les souvenirs autorisés', async () => {
    await harness.useCase.execute(mary, { conversationId, content: 'Tu te souviens de ce que j’aime ?' })
    expect(harness.requests[0]?.instructions).toContain('Mary aime le jazz.')

    harness.memories.set(mary, [])
    await harness.useCase.execute(mary, { conversationId, content: 'Et maintenant ?' })
    expect(harness.requests[1]?.instructions).not.toContain('Mary aime le jazz.')
  })

  it("n'autorise les suggestions de souvenirs qu'avec le consentement à la mémoire", async () => {
    const aichaConversation = (await harness.repository.create(aicha)).id
    const result = await harness.useCase.execute(aicha, { conversationId: aichaConversation, content: 'Bonjour' })
    expect(harness.requests[0]?.canSuggestMemories).toBe(false)
    expect(harness.recordSuggestions).not.toHaveBeenCalled()
    expect(result.memoryProposals).toEqual([])
  })

  it('transmet les suggestions au domaine mémoire, rattachées au message de la personne', async () => {
    const result = await harness.useCase.execute(mary, { conversationId, content: 'Je joue du violoncelle.' })
    expect(harness.recordSuggestions).toHaveBeenCalledWith(mary, { sourceMessageId: result.personMessage.id, suggestions: ['Mary joue du violoncelle.'] })
    expect(result.memoryProposals).toEqual([{ id: 'proposal-0', content: 'Mary joue du violoncelle.' }])
  })

  it("n'enregistre rien si le modèle échoue (échange atomique) et propage l'erreur", async () => {
    vi.mocked(harness.model.generateReply).mockRejectedValueOnce(new TechnicalError('AI_PROVIDER_UNAVAILABLE'))
    await expect(harness.useCase.execute(mary, { conversationId, content: 'Bonjour' })).rejects.toBeInstanceOf(TechnicalError)
    expect(harness.repository.messages).toHaveLength(0)
  })

  it("signale l'échec d'enregistrement des propositions sans perdre la réponse", async () => {
    harness.recordSuggestions.mockRejectedValueOnce(new Error('db down'))
    const result = await harness.useCase.execute(mary, { conversationId, content: 'Je joue du violoncelle.' })
    expect(result.twinMessage.content).toBe('Je vous écoute.')
    expect(result.memoryProposalsFailed).toBe(true)
  })

  it("transmet l'historique récent dans l'ordre, nouveau message inclus", async () => {
    await harness.useCase.execute(mary, { conversationId, content: 'Premier' })
    await harness.useCase.execute(mary, { conversationId, content: 'Second' })
    expect(harness.requests[1]?.history.map(m => `${m.author}:${m.content}`)).toEqual([
      'PERSON:Premier', 'TWIN:Je vous écoute.', 'PERSON:Second',
    ])
  })
})
