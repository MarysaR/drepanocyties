import { beforeEach, describe, expect, it } from 'vitest'
import { ConsentRequiredError, DomainError, NotFoundError, ValidationError } from '@shared/errors/AppError'
import { aicha, mary } from '../../support/fixtures'
import { createMemoryHarness } from './memoryHarness'

type Harness = ReturnType<typeof createMemoryHarness>

const sourceMessageId = '11111111-1111-4111-8111-111111111111'

async function proposeAndAccept(harness: Harness, content: string, messageId = sourceMessageId) {
  const [proposal] = await harness.recordSuggestions.execute(mary, { sourceMessageId: messageId, suggestions: [content] })
  if (!proposal) throw new Error('aucune proposition créée')
  return harness.accept.execute(mary, { proposalId: proposal.id })
}

describe('Mémoire consentie', () => {
  let harness: Harness

  beforeEach(() => {
    harness = createMemoryHarness()
  })

  describe('propositions du jumeau', () => {
    it("ne crée aucune proposition sans consentement à la mémoire permanente", async () => {
      const proposals = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary aime le jazz.'] })
      expect(proposals).toEqual([])
      expect(harness.store.proposals.rows).toHaveLength(0)
    })

    it("n'enregistre jamais automatiquement un souvenir : une proposition reste en attente", async () => {
      harness.grantMemoryConsent(mary)
      const proposals = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary aime le jazz.'] })
      expect(proposals).toHaveLength(1)
      expect(await harness.authorized.execute(mary)).toEqual([])
      expect(harness.store.memories.rows).toHaveLength(0)
    })

    it('limite le nombre de propositions et ignore les suggestions vides ou trop longues', async () => {
      harness.grantMemoryConsent(mary)
      const proposals = await harness.recordSuggestions.execute(mary, {
        sourceMessageId,
        suggestions: ['  ', 'x'.repeat(501), 'Mary chante dans une chorale.', 'Mary a un chat.', 'Mary aime la mer.'],
      })
      expect(proposals.map(p => p.content)).toEqual(['Mary chante dans une chorale.', 'Mary a un chat.'])
    })

    it('ne propose pas deux fois un contenu déjà en attente ou déjà retenu', async () => {
      harness.grantMemoryConsent(mary)
      await proposeAndAccept(harness, 'Mary aime le jazz.')
      const again = await harness.recordSuggestions.execute(mary, { sourceMessageId: '22222222-2222-4222-8222-222222222222', suggestions: ['mary aime le JAZZ'] })
      expect(again).toEqual([])
    })
  })

  describe('acceptation', () => {
    it('transforme une proposition acceptée en souvenir réutilisable', async () => {
      harness.grantMemoryConsent(mary)
      await proposeAndAccept(harness, 'Mary aime le jazz.')
      expect(await harness.authorized.execute(mary)).toEqual(['Mary aime le jazz.'])
      expect(harness.store.proposals.rows).toHaveLength(0)
    })

    it('enregistre la version modifiée par la personne', async () => {
      harness.grantMemoryConsent(mary)
      const [proposal] = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary aime le jazz.'] })
      const memory = await harness.accept.execute(mary, { proposalId: proposal!.id, content: 'J’aime surtout le jazz manouche.' })
      expect(memory.content).toBe('J’aime surtout le jazz manouche.')
      expect(await harness.authorized.execute(mary)).toEqual(['J’aime surtout le jazz manouche.'])
    })

    it('exige un consentement effectif au moment de l’acceptation', async () => {
      harness.grantMemoryConsent(mary)
      const [proposal] = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary aime le jazz.'] })
      harness.revokeMemoryConsent(mary)
      await expect(harness.accept.execute(mary, { proposalId: proposal!.id })).rejects.toBeInstanceOf(ConsentRequiredError)
      expect(harness.store.memories.rows).toHaveLength(0)
    })
  })

  describe('refus', () => {
    it("empêche le jumeau de reproposer un contenu refusé, même formulé autrement", async () => {
      harness.grantMemoryConsent(mary)
      const [proposal] = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary aime le jazz.'] })
      await harness.reject.execute(mary, proposal!.id)
      const again = await harness.recordSuggestions.execute(mary, { sourceMessageId: '33333333-3333-4333-8333-333333333333', suggestions: ['MARY aime le jazz !'] })
      expect(again).toEqual([])
      expect(await harness.authorized.execute(mary)).toEqual([])
    })
  })

  describe('correction', () => {
    it("remplace le contenu et empêche la réintroduction de l'ancienne version", async () => {
      harness.grantMemoryConsent(mary)
      const memory = await proposeAndAccept(harness, 'Mary habite à Lyon.')
      await harness.correct.execute(mary, { memoryId: memory.id, content: 'Mary habite à Marseille.' })

      expect(await harness.authorized.execute(mary)).toEqual(['Mary habite à Marseille.'])
      const fromOtherMessage = await harness.recordSuggestions.execute(mary, { sourceMessageId: '44444444-4444-4444-8444-444444444444', suggestions: ['Mary habite à Lyon.'] })
      const fromSameMessage = await harness.recordSuggestions.execute(mary, { sourceMessageId, suggestions: ['Mary vit à Lyon depuis peu.'] })
      expect(fromOtherMessage).toEqual([])
      expect(fromSameMessage).toEqual([])
    })

    it('valide le nouveau contenu', async () => {
      harness.grantMemoryConsent(mary)
      const memory = await proposeAndAccept(harness, 'Mary habite à Lyon.')
      await expect(harness.correct.execute(mary, { memoryId: memory.id, content: ' ' })).rejects.toBeInstanceOf(ValidationError)
    })
  })

  describe('suppression', () => {
    it("retire définitivement le souvenir et bloque sa réintroduction par le jumeau", async () => {
      harness.grantMemoryConsent(mary)
      const memory = await proposeAndAccept(harness, 'Mary a peur des hôpitaux.')
      await harness.remove.execute(mary, memory.id)

      expect(await harness.authorized.execute(mary)).toEqual([])
      expect(harness.store.memories.rows).toHaveLength(0)
      expect(JSON.stringify(harness.store.suppressions.rows)).not.toContain('hôpitaux')
      const again = await harness.recordSuggestions.execute(mary, { sourceMessageId: '55555555-5555-4555-8555-555555555555', suggestions: ['Mary a peur des hopitaux'] })
      expect(again).toEqual([])
    })

    it('laisse la personne réécrire elle-même un souvenir supprimé (autonomie)', async () => {
      harness.grantMemoryConsent(mary)
      const memory = await proposeAndAccept(harness, 'Mary aime le jazz.')
      await harness.remove.execute(mary, memory.id)
      const rewritten = await harness.create.execute(mary, { content: 'Mary aime le jazz.' })
      expect(rewritten.origin).toBe('WRITTEN_BY_PERSON')
      expect(await harness.authorized.execute(mary)).toEqual(['Mary aime le jazz.'])
    })
  })

  describe('retrait du consentement', () => {
    it('suspend toute réutilisation des souvenirs et abandonne les propositions en attente', async () => {
      harness.grantMemoryConsent(mary)
      await proposeAndAccept(harness, 'Mary aime le jazz.')
      await harness.recordSuggestions.execute(mary, { sourceMessageId: '66666666-6666-4666-8666-666666666666', suggestions: ['Mary fait du piano.'] })

      harness.revokeMemoryConsent(mary)
      await harness.discardPending.execute(mary)

      expect(await harness.authorized.execute(mary)).toEqual([])
      const overview = await harness.list.execute(mary)
      expect(overview.memoryEnabled).toBe(false)
      expect(overview.memories).toHaveLength(1)
      expect(overview.proposals).toHaveLength(0)
    })
  })

  describe('souvenirs choisis par la personne', () => {
    it('permet de retenir un de ses propres messages', async () => {
      harness.grantMemoryConsent(mary)
      harness.addPersonMessage({ userId: mary, id: sourceMessageId, content: 'Je joue du violoncelle.' })
      const memory = await harness.create.execute(mary, { content: 'Je joue du violoncelle.', sourceMessageId })
      expect(memory.origin).toBe('PERSON_MESSAGE')
    })

    it('refuse un doublon exact', async () => {
      harness.grantMemoryConsent(mary)
      await harness.create.execute(mary, { content: 'Mary aime le jazz.' })
      await expect(harness.create.execute(mary, { content: 'mary aime le jazz' })).rejects.toBeInstanceOf(DomainError)
    })

    it('exige le consentement à la mémoire permanente', async () => {
      await expect(harness.create.execute(mary, { content: 'Mary aime le jazz.' })).rejects.toBeInstanceOf(ConsentRequiredError)
    })
  })

  describe('isolation entre comptes', () => {
    it("empêche Aïcha d'agir sur les souvenirs et propositions de Mary", async () => {
      harness.grantMemoryConsent(mary)
      harness.grantMemoryConsent(aicha)
      const memory = await proposeAndAccept(harness, 'Mary aime le jazz.')
      const [proposal] = await harness.recordSuggestions.execute(mary, { sourceMessageId: '77777777-7777-4777-8777-777777777777', suggestions: ['Mary fait du piano.'] })

      await expect(harness.correct.execute(aicha, { memoryId: memory.id, content: 'piraté' })).rejects.toBeInstanceOf(NotFoundError)
      await expect(harness.remove.execute(aicha, memory.id)).rejects.toBeInstanceOf(NotFoundError)
      await expect(harness.accept.execute(aicha, { proposalId: proposal!.id })).rejects.toBeInstanceOf(NotFoundError)
      await expect(harness.reject.execute(aicha, proposal!.id)).rejects.toBeInstanceOf(NotFoundError)

      expect(await harness.authorized.execute(aicha)).toEqual([])
      expect((await harness.list.execute(aicha)).proposals).toEqual([])
      expect(await harness.authorized.execute(mary)).toEqual(['Mary aime le jazz.'])
    })

    it("empêche Aïcha de retenir un message de Mary", async () => {
      harness.grantMemoryConsent(aicha)
      harness.addPersonMessage({ userId: mary, id: sourceMessageId, content: 'Message de Mary' })
      await expect(harness.create.execute(aicha, { content: 'Message de Mary', sourceMessageId })).rejects.toBeInstanceOf(NotFoundError)
    })
  })
})
